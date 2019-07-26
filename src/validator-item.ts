import { Validator } from './validator';
import { ValidatorError } from './validator-error';
import {
  isBoolean,
  isNumber,
  isObject,
  isRegExp,
  isString,
  isInteger,
  isFunction,
  isDate,
  GenericObject,
  Callback,
  hasValue,
  deepCopy,
  validateType
} from './lib/util';
import { ValidatorRule } from './validator-rule';
import { ValidatorBase } from './validator-base';

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
const APPLY_METHOD = {
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

export class ValidatorItem extends ValidatorBase {
  protected _value: any;
  protected _changes: GenericObject;
  protected _refDoc: GenericObject;
  protected _rule: ValidatorRule = undefined;

  // track errors here for objects with properties, so we collect them all before failing
  protected _name: string;
  protected _label: string;

  constructor(value: any, parent?: ValidatorBase) {
    super(parent);
    this._value = value;
  }

  public name(name: string): this {
    this._name = name;
    return this;
  }

  public getName(): string {
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

  set changes(val) {
    this._changes = val;
  }

  set refDoc(val) {
    this._refDoc = val;
  }

  /**
   * Set rule here or with validate method.
   * @param rule {GenericObject} - Converted to ValidatorRule
   */
  public rule(rule: GenericObject) {
    this._rule = new ValidatorRule(rule);
    if (isFunction(this._rule.fromView)) {
      this._value = this._rule.fromView(this._value);
    }
    return this;
  }

  /**
   * Validate this._value. Errors in the value and it's descendant propeties are
   * added to this._parent.errors. Errors in how this validation is called (eg.
   * rules) result in an exception.
   * @param [rule] Cast to a ValidatorRule. If not specified then must be
   * specified using the rule() method.
   */
  public validate(rule?: GenericObject) {
    // Setup all the variables needed
    this._rule = rule ? new ValidatorRule(rule) : this._rule;
    if (!this._name && this._rule.name) {
      this._name = this._rule.name;
    }
    if (!this._label && this._rule.label) {
      this._label = this._rule.label;
    }
    if (!this._label) {
      this._label = this._name;
    }

    this.valueApply();

    // Look at the results and pass them upstream to parent
    // if (this._errors.length) {
    //   if (this.parent) {
    //     this.parent.addErrors(this._errors);
    //     this._errors = [];
    //   }
    // }
    return this;
  }

  protected valueApply() {
    // First test if value is empty and required, or if present and strict and not optional
    if (!this.hasValue()) {
      if (this._rule.default) {
        this._result = this._rule.default;
        return this;
      } else if (this._rule.required) {
        this._errors.push(new ValidatorError(this._label, 'missing'));
        return this;
      }
    } else if (this._rule.strict && !this._rule.optional && !this._rule.required) {
      this._errors.push(new ValidatorError(this._label, 'notAllowed'));
      return this;
    }

    // Now call a type-specific validator on the value
    let methodName = APPLY_METHOD[this._rule.type];
    if (!methodName || !isFunction(this[methodName])) {
      // This is an error in the rule (not the value) so throw an exception
      throw new Error(`Invalid rule type '${this._rule.type}'`);
    }
    try {
      this[methodName](this._value);
    } catch (err) {
      this._errors.push(err);
    }

    // If there is an error in the value, we are done
    if (this._errors.length) {
      // Use the default if there is one
      if (this._rule.default && !this._rule.strict) {
        this._result = this._rule.default;
        return this;
      }
    }

    return this;
  }

  protected nullApply(val) {
    if (val === null) {
      return this.setResult(val);
    }
    if (isFunction(this._rule.sanitize)) {
      return this.setResult(this._rule.sanitize(val, this._rule));
    }
    if (this._rule.default === null) {
      return this.setResult(this._rule.default);
    }
    if (isFunction(this._rule.default)) {
      return this.setResult(this._rule.default(val, this._rule));
    }
    if (this._rule.required) {
      throw new ValidatorError(this.label, 'missing or invalid');
    }
    return this;
  }

  protected setResult(val: any): this {
    this._result = val;
    return this;
  }

  /**
   * Apply this._rule to val returning a boolean or throwing an error.
   * @param {*} val
   */
  protected booleanApply(val) {
    if (isBoolean(val)) {
      return this.setResult(val);
    }
    if (isFunction(this._rule.sanitize)) {
      return this.setResult(this._rule.sanitize(val, this._rule));
    }
    if (this._rule.sanitize === true || this._rule.sanitize === 'boolean') {
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
    if (isBoolean(this._rule.default)) {
      return this.setResult(this._rule.default);
    }
    if (isFunction(this._rule.default)) {
      return this.setResult(this._rule.default(val, this._rule));
    }
    if (this._rule.required && val) {
      throw new ValidatorError(this.label, 'missing');
    }
    throw new ValidatorError(this.label, 'invalid');
  }

  /**
   * Apply this._rule to val returning a string or throwing an error.
   * @param {*} val
   */
  protected stringApply(val) {
    if (isString(val)) {
      return this.applyStringLengthTests(val);
    }
    if (this._rule.default && (val === undefined || val === null)) {
      if (isString(this._rule.default)) {
        return this.setResult(this._rule.default);
      }
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule));
      }
    }
    if (isFunction(this._rule.sanitize)) {
      val = this._rule.sanitize(val, this._rule);
      return this.applyStringLengthTests(val);
    }
    if (this._rule.sanitize === true || this._rule.sanitize === 'string') {
      return this.applyStringLengthTests(String(val));
    }
    if (this._rule.required) {
      throw new ValidatorError(this.label, 'missing');
    }
    return this;
  }

  private applyStringLengthTests(val) {
    if (isRegExp(this._rule.pattern)) {
      if (!this._rule.pattern.test(val)) {
        throw new ValidatorError(this.label, 'invalid');
      }
    }
    if (isFunction(this._rule.pattern)) {
      if (!this._rule.pattern(val, this._rule)) {
        throw new ValidatorError(this.label, 'invalid');
      }
    }
    if (isNumber(this._rule.min) && val.length < this._rule.min) {
      if (isString(this._rule.default)) {
        return this.setResult(this._rule.default);
      }
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule, 'min'));
      }
      throw new ValidatorError(this._label, 'lenMin', { min: this._rule.min });
    }
    if (isNumber(this._rule.max) && val.length > this._rule.max) {
      if (isString(this._rule.default)) {
        return this.setResult(this._rule.default);
      }
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule, 'max'));
      }
      throw new ValidatorError(this._label, 'lenMax', { max: this._rule.max });
    }
    return this.setResult(val);
  }

  /**
   * Apply this._rule to val returning a number or throwing an error.
   * @param {*} val
   */
  protected numberApply(val: any): ValidatorItem {
    let isInt: boolean = REGEX.integer.test(this._rule.type);
    if (isNumber(val)) {
      if (isInt) {
        if (isFunction(this._rule.sanitize)) {
          val = this._rule.sanitize(val, this._rule);
          return this.applyNumberLimitTests(val);
        }
        if (this._rule.sanitize === true) {
          val = Math.round(val);
          return this.applyNumberLimitTests(val);
        }
        if (isString(this._rule.sanitize) && isFunction(Math[this._rule.sanitize])) {
          val = Math[this._rule.sanitize](val);
          return this.applyNumberLimitTests(val);
        }
        if (Math.round(val) !== val) {
          throw new ValidatorError(this.label, 'invalid');
        }
      }
      return this.applyNumberLimitTests(val);
    }
    if (isString(val)) {
      if (isInt) {
        let valAsInt: any = Math.round(parseFloat(val));
        if (isNaN(valAsInt)) {
          if (this._rule.default) {
            return this.setResult(this.getDefault());
          }
          if (this._rule.required) {
            throw new ValidatorError(this.label, 'missing or invalid');
          }
        }
        return this.applyNumberLimitTests(valAsInt);
      }
      let valAsFloat: any = parseFloat(val);
      if (isNaN(valAsFloat)) {
        if (this._rule.default) {
          return this.setResult(this.getDefault());
          return this;
        }
        if (this._rule.required) {
          throw new ValidatorError(this.label, 'missing or invalid');
        }
      }
      return this.applyNumberLimitTests(valAsFloat);
    }
    if (this._rule.default) {
      return this.setResult(this.getDefault());
    }
    if (this._rule.required) {
      throw new ValidatorError(this.label, 'missing or invalid');
    }
    return this;
  }

  private applyNumberLimitTests(val) {
    if (isNumber(this._rule.min) && val < this._rule.min) {
      if (isNumber(this._rule.default)) {
        return this.setResult(this._rule.default);
      }
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule, 'min'));
      }
      throw new ValidatorError(this._label, 'min', { min: this._rule.min });
    }
    if (isNumber(this._rule.max) && val > this._rule.max) {
      if (isNumber(this._rule.default)) {
        return this.setResult(this._rule.default);
      }
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule, 'max'));
      }
      throw new ValidatorError(this._label, 'max', { max: this._rule.max });
    }
    return this.setResult(val);
  }

  protected dateApply(val) {
    if (isDate(val)) {
      return this.applyDateLimitTests(val);
    }
    if (hasValue(val)) {
      if (isFunction(this._rule.sanitize)) {
        val = this._rule.sanitize(val, this._rule);
        return this.applyDateLimitTests(val);
      }
      if (this._rule.sanitize === true || this._rule.sanitize === 'date') {
        if (isString(val) && REGEX.isWholeNumber.test(val)) {
          val = parseInt(val, 10);
        }
      }
      try {
        val = new Date(val);
        if (!isNaN(val.getTime())) {
          return this.applyDateLimitTests(val);
        }
      } catch (err) {}
    }
    if (isFunction(this._rule.default)) {
      return this._rule.default(val, this._rule);
    }
    if (hasValue(this._rule.default)) {
      return new Date(this._rule.default);
    }
    if (this._rule.required) {
      throw new ValidatorError(this.label, 'missing or invalid');
    }
    throw new ValidatorError(this.label, 'invalid');
  }

  private applyDateLimitTests(val) {
    if (hasValue(this._rule.min) && val < this._rule.min) {
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule, 'min'));
      }
      if (hasValue(this._rule.default)) {
        return this.setResult(new Date(this._rule.default));
      }
      throw new ValidatorError(this._label, 'dateMin', { min: this._rule.min });
    }
    if (hasValue(this._rule.max) && val > this._rule.max) {
      if (isFunction(this._rule.default)) {
        return this.setResult(this._rule.default(val, this._rule, 'max'));
      }
      if (hasValue(this._rule.default)) {
        return this.setResult(new Date(this._rule.default));
      }
      throw new ValidatorError(this._label, 'dateMax', { max: this._rule.max });
    }
    return this.setResult(val);
  }

  protected objectApply(val): ValidatorItem {
    if (isObject(val)) {
      this._result = {};
      this.propertiesApply();
      return this;
    }
    if (hasValue(val)) {
      if (isFunction(this._rule.sanitize)) {
        return this.setResult(this._rule.sanitize(val, this._rule));
      }
      throw new ValidatorError(this._label, 'invalid');
    }
    if (isFunction(this._rule.default)) {
      return this.setResult(this._rule.default(val, this._rule));
    }
    if (isObject(this._rule.default)) {
      return this.setResult(deepCopy(this._rule.default));
    }
    if (this._rule.required) {
      throw new ValidatorError(this._label, 'missing');
    }
    return this;
  }

  protected propertiesApply() {
    if (this._rule.type === 'object' && this._rule.properties) {
      let errors = [];
      Object.keys(this._rule.properties).forEach(prop => {
        try {
          let item = new ValidatorItem(this._value[prop]);
          item
            .rule(this._rule.properties[prop])
            .name(prop)
            .validate();
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
  protected arrayApply(val): ValidatorItem {
    if (Array.isArray(val)) {
      this._result = [];
      if (this._rule.arrayType) {
        this._result = [];
        for (let idx = 0; idx < this._value.length; ++idx) {
          try {
            let item = new ValidatorItem(this._value[idx]);
            item.rule(this._rule.arrayType).valueApply();
            if (item.hasErrors) {
              this._errors.concat(item.errors);
            } else {
              this._result.push(item.result);
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

  protected getDefault() {
    if (isFunction(this._rule.default)) {
      return this._rule.default(this._value, this._rule);
    }
    return this._rule.default;
  }

  // protected fnOrVal(fn, ...args) {
  //   if (isFunction(fn)) {
  //     return fn(...args);
  //   }
  //   return fn;
  // }
}
