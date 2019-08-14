import { ValidatorError } from './validator-error';
import { ValidatorRule } from './validator-rule';
import { ValidatorAllBase } from './validator-all-base';
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
  isDate
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

export class ValidatorItem extends ValidatorAllBase {
  protected _value: any;
  protected _changes?: Dict;
  protected _refDoc?: Dict;

  // track errors here for objects with properties, so we collect them all before failing
  protected _name?: string;
  protected _label?: string;

  constructor(value: any, parent?: ValidatorAllBase) {
    super(parent);
    this._value = value;
  }

  public name(name: string): this {
    this._name = name;
    return this;
  }

  public getName(): string | undefined {
    return this._name;
  }

  set label(val) {
    this._label = val;
  }

  get label() {
    return this._label;
  }

  get errors() {
    return this._errors;
  }

  get value() {
    return this._value;
  }

  /**
   * Can be overridden by subclasses
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

  protected valueApply(rule: ValidatorRule): this {
    // First test if value is empty and required, or if present and strict and not optional
    if (!this.hasValue()) {
      if (rule.default) {
        this._result = rule.default;
        return this;
      } else if (rule.required) {
        this._errors.push(new ValidatorError(this._label as string, 'missing'));
        return this;
      }
    } else if (rule.strict && !rule.optional && !rule.required) {
      this._errors.push(new ValidatorError(this._label as string, 'notAllowed'));
      return this;
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
      throw new ValidatorError(this.label as string, 'missing or invalid');
    }
    return this;
  }

  protected setResult(val: any): this {
    this._result = val;
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
      throw new ValidatorError(this.label as string, 'missing');
    }
    throw new ValidatorError(this.label as string, 'invalid');
  }

  /**
   * Apply rule to val returning a string or throwing an error.
   * @param {*} val
   */
  protected stringApply(val: any, rule: ValidatorRule) {
    if (isString(val)) {
      return this.applyStringLengthTests(val, rule);
    }
    if (rule.default && (val === undefined || val === null)) {
      if (isString(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule));
      }
    }
    if (isFunction(rule.sanitize)) {
      val = rule.sanitize(val, rule);
      return this.applyStringLengthTests(val, rule);
    }
    if (rule.sanitize === true || rule.sanitize === 'string') {
      return this.applyStringLengthTests(String(val), rule);
    }
    if (rule.required) {
      throw new ValidatorError(this.label as string, 'missing');
    }
    return this;
  }

  protected applyStringLengthTests(val: any, rule: ValidatorRule) {
    if (isRegExp(rule.pattern)) {
      if (!rule.pattern.test(val)) {
        throw new ValidatorError(this.label as string, 'invalid');
      }
    }
    if (isFunction(rule.pattern)) {
      if (!rule.pattern(val, rule)) {
        throw new ValidatorError(this.label as string, 'invalid');
      }
    }
    if (isNumber(rule.min) && val.length < (rule.min as number)) {
      if (isString(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'min'));
      }
      throw new ValidatorError(this.label as string, 'lenMin', { min: rule.min });
    }
    if (isNumber(rule.max) && val.length > (rule.max as number)) {
      if (isString(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'max'));
      }
      throw new ValidatorError(this.label as string, 'lenMax', { max: rule.max });
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
          throw new ValidatorError(this.label as string, 'invalid');
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
            throw new ValidatorError(this.label as string, 'missing or invalid');
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
          throw new ValidatorError(this.label as string, 'missing or invalid');
        }
      }
      return this.applyNumberLimitTests(valAsFloat, rule);
    }
    if (rule.default) {
      return this.setResult(this.getDefault(rule));
    }
    if (rule.required) {
      throw new ValidatorError(this.label as string, 'missing or invalid');
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
      throw new ValidatorError(this._label as string, 'min', { min: rule.min });
    }
    if (isNumber(rule.max) && val > (rule.max as number)) {
      if (isNumber(rule.default)) {
        return this.setResult(rule.default);
      }
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'max'));
      }
      throw new ValidatorError(this._label as string, 'max', { max: rule.max });
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
      throw new ValidatorError(this.label as string, 'missing or invalid');
    }
    throw new ValidatorError(this.label as string, 'invalid');
  }

  protected applyDateLimitTests(val: any, rule: ValidatorRule) {
    if (hasValue(rule.min) && val < (rule.min as number)) {
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'min'));
      }
      if (hasValue(rule.default)) {
        return this.setResult(new Date(rule.default));
      }
      throw new ValidatorError(this._label as string, 'dateMin', { min: rule.min });
    }
    if (hasValue(rule.max) && val > (rule.max as number)) {
      if (isFunction(rule.default)) {
        return this.setResult(rule.default(val, rule, 'max'));
      }
      if (hasValue(rule.default)) {
        return this.setResult(new Date(rule.default));
      }
      throw new ValidatorError(this._label as string, 'dateMax', { max: rule.max });
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
      throw new ValidatorError(this.label as string, 'invalid');
    }
    if (isFunction(rule.default)) {
      return this.setResult(rule.default(val, rule));
    }
    if (isObject(rule.default)) {
      return this.setResult(deepCopy(rule.default));
    }
    if (rule.required) {
      throw new ValidatorError(this.label as string, 'missing');
    }
    return this;
  }

  protected propertiesApply(rule: ValidatorRule): this {
    if (rule.type === 'object' && rule.properties) {
      let errors: ValidatorError[] = [];
      Object.keys(rule.properties).forEach(prop => {
        try {
          const item = new ValidatorItem(this._value[prop]);
          item.name(prop).validate((rule.properties as Dict)[prop]);
          if (item.hasErrors()) {
            errors = errors.concat(item.errors);
          } else if (item.output !== undefined) {
            this._result[prop] = item.output;
          }
        } catch (err) {
          errors.push(err);
        }
      });
      if (errors.length) {
        this.addErrors(errors);
      }
    }
    return this;
  }

  // TODO verify the functionality of this method
  protected arrayApply(val: any, rule: ValidatorRule): this {
    if (Array.isArray(val)) {
      this._result = [];
      if (rule.arrayType) {
        this._result = [];
        for (const v of this._value) {
          try {
            const item = new ValidatorItem(v);
            item.valueApply(rule.arrayType);
            if (item.hasErrors) {
              this._errors.concat(item.errors);
            } else {
              this._result.push(item.output);
            }
          } catch (err) {
            this._errors.push(err);
          }
        }
      } else {
        this._result = val;
      }
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
