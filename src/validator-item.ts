import { ValidatorRule, IsMissingCallback } from './validator-rule';
import { ValidatorBase, ValidatorErrorType, IValidatorErrorItem } from './validator-base';
import {
  isObject,
  isString,
  isFunction,
  isNumber,
  isBoolean,
  hasValue,
  Dict,
  deepCopy,
  isRegExp,
  isDate,
  isDefined
} from 'epdoc-util';

const REGEX = {
  string: /^(string)$/,
  number: /^(int|integer|float|number)$/,
  boolean: /^boolean$/,
  object: /^(array|object|date)$/,
  integer: /^(int|integer)$/,
  isTrue: /^true$/i,
  isFalse: /^false$/i,
  isWholeNumber: /^[0-9]+$/
};
const APPLY_METHOD: { [key: string]: string } = {
  string: 'stringApply',
  boolean: 'booleanApply',
  int: 'numberApply',
  integer: 'numberApply',
  number: 'numberApply',
  date: 'dateApply',
  any: 'anyApply',
  null: 'nullApply',
  object: 'objectApply',
  array: 'arrayApply'
};

interface IPropertyValidity {
  present: Record<string, boolean>;
  notAllowed: Record<string, boolean>;
  missing: Record<string, boolean>;
}

export class ValidatorItem extends ValidatorBase {
  protected _value: any;
  protected _changes?: Dict;
  protected _refDoc?: Dict;
  protected _chain: string[] = [];

  // track errors here for objects with properties, so we collect them all before failing
  protected _name?: string;
  protected _label?: string;

  constructor(value: any, parent?: ValidatorBase) {
    super(parent);
    this._value = value;
  }

  public name(name: string): this {
    this._name = name;
    return this;
  }

  public getName() {
    return this._name;
  }

  public chain(val: string | string[]): this {
    this._chain = isString(val) ? [val] : val;
    return this;
  }

  public getChain(): string[] {
    if (this._name) {
      if (this._chain && this._chain.length) {
        return [...this._chain, this._name];
      }
      return [this._name];
    }
    return this._chain;
  }

  set label(val) {
    this._label = val;
  }

  get label(): string {
    if (this._label) {
      return this._label;
    }
    const result = this.getChain();
    return result ? result.join('.') : '?';
  }

  get errors() {
    return this._errors;
  }

  get value() {
    return this._value;
  }

  /**
   * Can be overridden by subclasses, for example ValidatorItemInput which
   * accepts input from UI and will want to treat empty strings as undefined.
   * Default is to return true if not undefined or null.
   */
  public hasValue() {
    return hasValue(this._value);
  }

  set changes(val: Dict) {
    this._changes = val;
  }

  set refDoc(val: Dict) {
    this._refDoc = val;
  }

  public addError(type: ValidatorErrorType, params?: Dict): this {
    const err = { key: this.label, type, params };
    this._errors.push(err);
    return this;
  }

  /**
   * Validate this._value. Errors in the value and it's descendant propeties are
   * added to this._parent.errors. Errors in how this validation is called (eg.
   * rules) result in an exception.
   * @param [rule] Cast to a ValidatorRule. If not specified then must be
   * specified using the rule() method.
   */
  public validate(rule: ValidatorRule): this {
    // Setup all the variables needed
    if (!this._name && rule.name) {
      this._name = rule.name;
    }
    if (!this._label && rule.label) {
      this._label = rule.label;
    }
    if (!this._label) {
      this._label = this._name;
    }

    return this.valueApply(rule);
  }

  public isMissing(rule: ValidatorRule): boolean {
    if (Array.isArray(rule.isMissing)) {
      // tslint:disable-next-line: prefer-for-of
      for (let idx = 0; idx < rule.isMissing.length; ++idx) {
        if (this._value === rule.isMissing[idx]) {
          return true;
        }
      }
    } else if (isFunction(rule.isMissing)) {
      return (rule.isMissing as IsMissingCallback)(this._value);
    } else if (isBoolean(rule.isMissing)) {
      return rule.isMissing;
    }
    return this.hasValue() ? false : true;
  }

  protected setDefault(rule: ValidatorRule): this {
    if (isFunction(rule.default)) {
      const val = rule.default(rule);
      return this.setResult(val);
    }
    let def = rule.default;
    if (def === 'undefined') {
      def = undefined;
    } else if (def === null) {
      def = null;
    }
    return this.setResult(def);
  }

  protected setResult(val: any): this {
    this._result = val;
    return this;
  }

  protected valueApply(rule: ValidatorRule): this {
    // First test if value is empty and required, or if present and strict and not optional
    if (this.isMissing(rule)) {
      if (isDefined(rule.default)) {
        return this.setDefault(rule);
      } else if (rule.required) {
        return this.addError(ValidatorErrorType.missing);
      }
      return this;
    } else if (rule.strict && !rule.optional && !rule.required) {
      return this.addError(ValidatorErrorType.notAllowed);
    }

    // Now call a type-specific validator on the value
    const methodName: string = APPLY_METHOD[rule.type];
    // @ts-ignore
    if (!methodName || !isFunction(this[methodName])) {
      // This is an error in the rule (not the value) so throw an exception
      throw new Error(`Invalid rule type '${rule.type}'`);
    }
    try {
      // @ts-ignore
      this[methodName](this._value, rule);
    } catch (err) {
      this._errors.push(err);
    }

    // If there is an error in the value, we are done
    if (this._errors.length) {
      // Use the default if there is one
      if (rule.default && !rule.strict) {
        this._result = rule.default;
        return this;
      }
    }

    return this;
  }

  protected nullApply(val: any, rule: ValidatorRule) {
    if (val === null) {
      return this.setResult(val);
    }
    if (isFunction(rule.sanitize)) {
      return this.setResult(rule.sanitize(val, rule));
    }
    if (rule.default === null) {
      return this.setResult(rule.default);
    }
    if (isFunction(rule.default)) {
      return this.setResult(rule.default(val, rule));
    }
    if (rule.required) {
      return this.addError(ValidatorErrorType.missingOrInvalid);
    }
    return this;
  }

  /**
   * Apply rule to val returning a boolean or throwing an error.
   * @param {*} val
   */
  protected booleanApply(val: any, rule: ValidatorRule) {
    if (isBoolean(val)) {
      return this.setResult(val);
    }
    if (isFunction(rule.sanitize)) {
      return this.setResult(rule.sanitize(val, rule));
    }
    if (rule.sanitize === true || rule.sanitize === 'boolean') {
      if (isNumber(val)) {
        return this.setResult(val > 0);
      }
      if (isString(val)) {
        if (REGEX.isTrue.test(val)) {
          return this.setResult(true);
        }
        if (REGEX.isFalse.test(val)) {
          return this.setResult(false);
        }
        if (REGEX.isWholeNumber.test(val)) {
          return this.setResult(parseInt(val, 10) > 0);
        }
      }
    }
    if (isBoolean(rule.default)) {
      return this.setResult(rule.default);
    }
    if (isFunction(rule.default)) {
      return this.setResult(rule.default(val, rule));
    }
    if (rule.required && val) {
      return this.addError(ValidatorErrorType.missing);
    }
    return this.addError(ValidatorErrorType.invalid);
  }

  /**
   * Apply rule to val returning a string or throwing an error.
   * This will not be executed if val is of length 0.
   * @param {*} val
   */
  protected stringApply(val: any, rule: ValidatorRule) {
    if (isFunction(rule.sanitize)) {
      val = rule.sanitize(val, rule);
    } else if (!isString(val) && (rule.sanitize === true || rule.sanitize === 'string')) {
      val = String(val);
    }
    if (isString(val)) {
      return this.applyStringLengthTests(val, rule);
    }
    if (rule.required) {
      return this.addError(ValidatorErrorType.missing);
    }
    return this;
  }

  protected applyStringLengthTests(val: any, rule: ValidatorRule) {
    if (isRegExp(rule.pattern)) {
      if (!rule.pattern.test(val)) {
        return this.addError(ValidatorErrorType.invalid);
      }
    }
    if (isFunction(rule.pattern)) {
      if (!rule.pattern(val, rule)) {
        return this.addError(ValidatorErrorType.invalid);
      }
    }
    if (isNumber(rule.min) && val.length < (rule.min as number)) {
      if (isString(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'min'));
      }
      return this.addError(ValidatorErrorType.lenMin, { min: rule.min });
    }
    if (isNumber(rule.max) && val.length > (rule.max as number)) {
      if (isDefined(rule.default)) {
        return this.setDefault(rule);
      }
      return this.addError(ValidatorErrorType.lenMax, { max: rule.max });
    }
    return this.setResult(val);
  }

  /**
   * Apply rule to val returning a number or throwing an error.
   * @param {*} val
   */
  protected numberApply(val: any, rule: ValidatorRule): ValidatorItem {
    const isInt: boolean = REGEX.integer.test(rule.type);
    if (isNumber(val)) {
      if (isInt) {
        if (isFunction(rule.sanitize)) {
          val = rule.sanitize(val, rule);
          return this.applyNumberLimitTests(val, rule);
        }
        if (rule.sanitize === true) {
          val = Math.round(val);
          return this.applyNumberLimitTests(val, rule);
        }
        // @ts-ignore
        if (isString(rule.sanitize) && isFunction(Math[rule.sanitize])) {
          // @ts-ignore
          val = Math[rule.sanitize](val);
          return this.applyNumberLimitTests(val, rule);
        }
        if (Math.round(val) !== val) {
          return this.addError(ValidatorErrorType.invalid);
        }
      }
      return this.applyNumberLimitTests(val, rule);
    }
    if (isString(val)) {
      if (isInt) {
        const valAsInt: any = Math.round(parseFloat(val));
        if (isNaN(valAsInt)) {
          if (rule.default) {
            return this.setResult(this.getDefault(rule));
          }
          if (rule.required) {
            return this.addError(ValidatorErrorType.missingOrInvalid);
          }
        }
        return this.applyNumberLimitTests(valAsInt, rule);
      }
      const valAsFloat: any = parseFloat(val);
      if (isNaN(valAsFloat)) {
        if (rule.default) {
          return this.setResult(this.getDefault(rule));
          return this;
        }
        if (rule.required) {
          return this.addError(ValidatorErrorType.missingOrInvalid);
        }
      }
      return this.applyNumberLimitTests(valAsFloat, rule);
    }
    if (rule.default) {
      return this.setResult(this.getDefault(rule));
    }
    if (rule.required) {
      return this.addError(ValidatorErrorType.missingOrInvalid);
    }
    return this;
  }

  protected applyNumberLimitTests(val: any, rule: ValidatorRule) {
    if (isNumber(rule.min) && val < (rule.min as number)) {
      if (isNumber(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'min'));
      }
      return this.addError(ValidatorErrorType.min, { min: rule.min });
    }
    if (isNumber(rule.max) && val > (rule.max as number)) {
      if (isNumber(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'max'));
      }
      return this.addError(ValidatorErrorType.max, { max: rule.max });
    }
    return this.setResult(val);
  }

  protected dateApply(val: any, rule: ValidatorRule) {
    if (isDate(val)) {
      return this.applyDateLimitTests(val, rule);
    }
    if (hasValue(val)) {
      if (isFunction(rule.sanitize)) {
        val = rule.sanitize(val, rule);
        return this.applyDateLimitTests(val, rule);
      }
      if (rule.sanitize === true || rule.sanitize === 'date') {
        if (isString(val) && REGEX.isWholeNumber.test(val)) {
          val = parseInt(val, 10);
        }
      }
      try {
        val = new Date(val);
        if (!isNaN(val.getTime())) {
          return this.applyDateLimitTests(val, rule);
        }
      } catch (err) {
        // empty catch
      }
    }
    if (isFunction(rule.default)) {
      return rule.default(val, rule);
    }
    if (hasValue(rule.default)) {
      return new Date(rule.default);
    }
    if (rule.required) {
      return this.addError(ValidatorErrorType.missingOrInvalid);
    }
    return this.addError(ValidatorErrorType.invalid);
  }

  protected applyDateLimitTests(val: any, rule: ValidatorRule) {
    if (hasValue(rule.min) && val < (rule.min as number)) {
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, ValidatorErrorType.min));
      }
      if (hasValue(rule.default)) {
        return this.setResult(new Date(rule.default));
      }
      return this.addError(ValidatorErrorType.dateMin, { min: rule.min });
    }
    if (hasValue(rule.max) && val > (rule.max as number)) {
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'max'));
      }
      if (hasValue(rule.default)) {
        return this.setResult(new Date(rule.default));
      }
      return this.addError(ValidatorErrorType.dateMax, { max: rule.max });
    }
    return this.setResult(val);
  }

  protected objectApply(val: any, rule: ValidatorRule): ValidatorItem {
    if (isObject(val)) {
      this._result = {};
      this.propertiesApply(rule);
      return this;
    }
    if (hasValue(val)) {
      if (isFunction(rule.sanitize)) {
        return this.setResult(rule.sanitize(val, rule));
      }
      return this.addError(ValidatorErrorType.invalid);
    }
    if (isFunction(rule.default)) {
      return this.setResult(rule.default(val, rule));
    }
    if (isObject(rule.default)) {
      return this.setResult(deepCopy(rule.default));
    }
    if (rule.required) {
      return this.addError(ValidatorErrorType.missing);
    }
    return this;
  }

  protected propertiesApply(rule: ValidatorRule): this {
    if (rule.type === 'object') {
      if (rule.properties) {
        let errors: IValidatorErrorItem[] = [];
        const validity: IPropertyValidity = this.checkIPropertyValidity(rule);
        // console.log('validity', validity);
        if (
          true ||
          (!Object.keys(validity.notAllowed).length &&
            !Object.keys(validity.missing).length)
        ) {
          Object.keys(validity.present).forEach(prop => {
            try {
              if ((rule.properties as Dict)[prop]) {
                // console.log('rules', prop);
                const subRule = new ValidatorRule((rule.properties as Dict)[prop]);
                const item = new ValidatorItem(this._value[prop]);
                // console.log('validate', prop);
                item
                  .chain(this.getChain())
                  .name(prop)
                  .validate(subRule);
                if (item.hasErrors()) {
                  item.errors.forEach(err => {
                    err.key = [this.label, err.key].join('.');
                  });
                  errors = errors.concat(item.errors);
                } else if (item.output !== undefined) {
                  this._result[prop] = item.output;
                }
              } else {
                // console.log('no rules', prop);
                this._result[prop] = this._value[prop];
              }
            } catch (err) {
              errors.push(err);
            }
          });
          if (errors.length) {
            this.addErrors(errors);
          }
        }
      } else {
        // If no rule defined for subobject then just pass thru
        this._result = this._value;
      }
    }
    return this;
  }

  protected checkIPropertyValidity(rule: ValidatorRule): IPropertyValidity {
    const result: IPropertyValidity = {
      present: {},
      notAllowed: {},
      missing: {}
    };
    const val = this._value as Dict;
    const ruleProps = rule.getProperties();
    Object.keys(val).forEach(key => {
      if (ruleProps && ruleProps[key]) {
        result.present[key] = true;
      } else if (rule.strict && !ruleProps[key].optional) {
        result.notAllowed[key] = true;
        this._errors.push({ key, type: ValidatorErrorType.notAllowed });
      } else {
        result.present[key] = true;
      }
    });
    Object.keys(ruleProps).forEach(key => {
      if ((ruleProps[key].required || rule.strict) && !result.present[key]) {
        if (ruleProps[key].default) {
          result.present[key] = true;
        } else {
          result.missing[key] = true;
          this._errors.push({ key, type: ValidatorErrorType.missing });
        }
      }
    });
    return result;
  }

  protected arrayApply(val: any, rule: ValidatorRule): this {
    // console.log('arrayApply', val, rule);
    if (Array.isArray(val)) {
      this._result = [];
      if (rule.itemType) {
        this._result = [];
        for (let idx = 0; idx < val.length; ++idx) {
          const v = val[idx];

          try {
            const item = new ValidatorItem(v);
            const subRule = new ValidatorRule(rule.itemType);
            item
              .chain(this.getChain())
              .name(String(idx))
              .validate(subRule);

            if (item.hasErrors()) {
              this._errors.concat(item.errors);
            } else {
              this._result.push(item.output);
            }
          } catch (err) {
            this._errors.push(err);
          }
        }
      } else {
        // console.log('arrayApply result', val);
        this._result = val;
      }
    } else {
      return this.addError(ValidatorErrorType.invalid);
    }
    return this;
  }

  protected getDefault(rule: ValidatorRule) {
    if (isFunction(rule.default)) {
      return rule.default(this._value, rule);
    }
    return rule.default;
  }
}
