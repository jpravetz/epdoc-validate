import { Validator } from './validator';
import { ValidatorError } from './validator-error';
import { isBoolean, isNumber, isObject, isRegExp, isString, isInteger, isFunction, isDate, GenericObject, hasValue, validateType } from './lib/util';
import { ValidateRule } from './validate-rule';

const REGEX = {
  string: /^(string)$/,
  number: /^(int|integer|float|number)$/,
  boolean: /^boolean$/,
  object: /^(array|object|date)$/,
  integer: /^(int|integer)$/,
  isTrue: /^true$/i,
  isFalse: /^false$/i
};
const APPLY_METHOD = {
  string: 'stringApply',
  boolean: 'booleanApply',
  int: 'numberApply',
  integer: 'numberApply'
};


export class ValidatorItem {
  protected _parent: GenericObject;
  protected _role: string;
  protected _value: any;
  protected _rule: ValidateRule;

  protected _errors: object[];
  protected _name: string;
  protected _label: string;

  constructor(parent: GenericObject, role: string, value: any) {
    this._parent = parent;
    this._role = role;
    this._value = value;
    this._errors = [];
  }

  setName(name) {
    this._name = name;
    return this;
  }

  set name(val) {
    this._name = val;
  }

  set label(val) {
    this._label = val;
  }

  get name() {
    return this._name;
  }

  get label() {
    return this._label;
  }

  get errors() {
    return this._errors;
  }

  hasErrors(): boolean {
    return this._errors.length ? true : false;
  }

  get value() {
    return this._value;
  }

  hasValue() {
    return hasValue(this._value);
  }

  rule(rule: GenericObject) {
    this._rule = new ValidateRule(rule);
    if (isFunction(rule.fromView)) {
      this._value = rule.fromView(this._value);
    }
    return this;
  }

  validateProperty(obj: any, name: string, ruleDef: ValidateRule, opts: GenericObject = {}) {
    if (!obj[name] && opts.required) {
      return new ValidatorError(name, 'missing');
    } else if (obj[name] && !validateType(obj[name], ruleDef.type)) {
      return new ValidatorError(name, 'type');
    }
  }

  /**
   * Validate a specific value
   * @param value {Anything} Value to be validated
   *
   * @returns {Validator}
   */
  /**
   * Validate this.value
   * @param {ValidateRule} rule
   */
  validate(rule?: GenericObject) {
    if (rule) {
      this._rule = new ValidateRule(rule)
    }
    if (!this._name && this._rule.name) {
      this._name = this._rule.name;
    }
    if (!this._label && this._rule.label) {
      this._label = this._rule.label;
    }
    if (!this._label) {
      this._label = this._name;
    }

    // First if empty and required or present and strict and not optional
    if (!this.hasValue()) {
      if (this._rule.default) {
        this._value = this._rule.default;
        return this;
      } else if (this._rule.required) {
        this.errors.push(new ValidatorError(this._label, 'missing'));
        return this;
      }
    } else if (this._rule.strict && !this._rule.optional && !this._rule.required) {
      this.errors.push(new ValidatorError(this._label, 'notAllowed'));
      return this;
    }

    // Now test the actual value
    let test = this.apply();
    if (this._errors.length) {
      if (this._rule.default) {
        this._value = this._rule.default;
      }
    } else {
      if (this._rule.apply && this._rule.apply.array) {
        this._parent.changes[rule.name].push(test.value);
      } else {
        if (!this._parent.doc || this._parent.doc[rule.name] !== test.value) {
          this._parent.changes[rule.name] = test.value;
        }
      }
    }
    //console.log(`validate ${value}`, this.changes);
    return this;
  }


  /**
   * Validate a value by sanitizing (to string, to integer, using function),
   * limit testing (min, max) and test the value against a type or RegExp.
   * Functions are called with parameters (val, ruleDef).
   * @param val {string|number|
   * @param ruleDef
   * @param ruleDef.label {string}
   * @param ruleDef.type {string|Regex} one of 'string', 'int', integer',
   * 'float', 'number', 'boolean', 'array', 'date', 'object'. Must be set unless
   * ruleDef.sanitize === 'integer'
   * @param ruleDef.default {*} - If set, and val does not pass ruleDef, then
   * set the return value to ruleDef.default.
   * @param ruleDef.sanitize {String|function} If a string, must be one of the
   * valid ruleDef types, and the value will be cast to that type
   * @param ruleDef.min {number} min string length or integer value
   * @param ruleDef.max {number} max string length or integer value
   * @returns { value: value, error: {string} } Returns a translated error
   *   string or sanitized value if no error
   */
  static applyRuleDef(val, ruleDef) {
    let label = ruleDef.label ? ruleDef.label : ruleDef.name;
    // Deal with booleans
    if (REGEX.boolean.test(ruleDef.type)) {
      if (isBoolean(val)) {
        return { value: val };
      }
      if (ruleDef.strict) {
        if (ruleDef.default) {
          return { value: ruleDef.default };
        }
        return { error: new ValidatorError(name, 'numMax', { max: ruleDef.max }) };
      }
    } else if (isNumber(val) && val > 0) {
      return { value: true };
    } else if (isString(val) && REGEX.isTrue.text(val)) {
      return { value: true };
    }


    let typeIs = {
      string: REGEX.string.test(ruleDef.type),
      number: REGEX.number.test(ruleDef.type),
      object: REGEX.object.test(ruleDef.type),
      boolean: REGEX.boolean.test(ruleDef.type)
    };
    // Sanitize the value if ruleDef.sanitize
    if (isFunction(ruleDef.sanitize)) {
      val = ruleDef.sanitize(val, ruleDef);
    } else if (ruleDef.sanitize === 'string') {
      val = isString(val) ? val : String(val);
    } else if (isString(ruleDef.sanitize) && REGEX.integer.test(ruleDef.sanitize)) {
      val = parseInt(val, 10);
    } else if (typeIs.string && !isString(val) && val !== undefined && val !== null) {
      val = String(val);
    } else if (typeIs.boolean && !isBoolean(val)) {
      if (isBoolean(val)) {
        return { value: val };
      }
      if (isNumber(val) && val > 0) {
        return { value: true };
      } else if (isString(val) && REGEX.isTrue.text(val)) {
        return { value: true };
      } else if (ruleDef.default === true) {
        return { value: true };
      }
      val = false;
    }

    if (typeIs.number || ruleDef.sanitize === 'integer') {
      // Check min/max of numbers
      if (val > ruleDef.max) {
        if (isNumber(ruleDef.default)) {
          return { value: ruleDef.default };
        } else if (ruleDef.default === true) {
          return { value: ruleDef.min };
        } else if (isFunction(ruleDef.default)) {
          return { value: ruleDef.default(val, ruleDef) };
        }
        return { error: new ValidatorError(ruleDef.label, 'numMax', { max: ruleDef.max }) };
      }
      if (val < ruleDef.min) {
        if (isNumber(ruleDef.default)) {
          return { value: ruleDef.default };
        } else if (ruleDef.default === true) {
          return { value: ruleDef.max };
        } else if (isFunction(ruleDef.default)) {
          return { value: ruleDef.default(val, ruleDef) };
        }
        return { error: new ValidatorError(ruleDef.label, 'numMin', { min: ruleDef.min }) };
      }
    } else if (!typeIs.object && !typeIs.boolean) {
      // Check min/max of string length or num
      if (isInteger(ruleDef.max) && val.length > ruleDef.max) {
        return { error: new ValidatorError(ruleDef.label, 'lenMax', { max: ruleDef.max }) };
      }
      if (isInteger(ruleDef.min) && val.length < ruleDef.min) {
        return { error: new ValidatorError(ruleDef.label, 'lenMin', { min: ruleDef.min }) };
      }
    }

    if (!ValidatorItem.validateType(val, ruleDef.type)) {
      return { error: new ValidatorError(ruleDef.label, 'invalid') };
    }

    return { value: val };
  }

  apply() {
    let methodName = APPLY_METHOD[this._rule.type];
    let val: any;
    if (!methodName) {
      throw new Error(`Invalid type '${this._rule.type}'`);
    }
    try {
      val = this[methodName](this._value);
    } catch (err) {
      this._errors.push(err);
    }
    if (this._rule.type === 'object' && this._rule.properties) {
      Object.keys(this._rule.properties).forEach(prop => {
        try {
          let item = new ValidatorItem(this._parent, this._role, val[prop]);
          item.rule(this._rule.properties[prop])
            .apply();
          if (item.hasErrors) {
            this._errors.concat(item.errors);
          }
        } catch (err) {
          this.errors.push(err);
        }
      });
    }
    if (methodName === 'array' && this._rule.arrayType) {
      for (let idx = 0; idx < val.length; ++idx) {
        try {
          let item = new ValidatorItem(this._parent, this._role, val[idx]);
          item.rule(this._rule.arrayType)
            .apply();
          if (item.hasErrors) {
            this._errors.concat(item.errors);
          }
        } catch (err) {
          this.errors.push(err);
        }
      }
    }
  }


  /**
   * Apply this._rule to val returning a boolean or throwing an error.
   * @param {*} val
   */
  booleanApply(val) {
    if (isBoolean(val)) {
      return val;
    }
    if (isFunction(this._rule.sanitize)) {
      return this._rule.sanitize(val, this._rule);
    }
    if (this._rule.sanitize === true || this._rule.sanitize === 'boolean') {
      if (isNumber(val) && val > 0) {
        return true;
      }
      if (isString(val) && REGEX.isTrue.text(val)) {
        return true;
      }
      if (isString(val) && REGEX.isFalse.text(val)) {
        return false;
      }
    }
    if (isBoolean(this._rule.default)) {
      return this._rule.default;
    }
    if (isFunction(this._rule.default)) {
      return this._rule.default(val, this._rule);
    }
    if (this._rule.required) {
      throw new ValidatorError(this.label, 'boolean', 'missing or invalid');
    }
  }

  /**
   * Apply this._rule to val returning a string or throwing an error.
   * @param {*} val
   */
  stringApply(val) {
    if (isString(val)) {
      return this.applyStringLengthTests(val);
    }
    if (this._rule.default && (val === undefined || val === null)) {
      if (isString(this._rule.default)) {
        return this._rule.default;
      }
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule);
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
      throw new ValidatorError(this.label, 'string', { reason: 'missing' });
    }
  }

  applyStringLengthTests(val) {
    if (isRegExp(this._rule.test)) {
      if (!this._rule.test.test(val)) {
        throw new ValidatorError(this.label, 'string', { reason: 'invalid' });
      }
    }
    if (isFunction(this._rule.test)) {
      if (!this._rule.test(val, this._rule)) {
        throw new ValidatorError(this.label, 'string', { reason: 'invalid' });
      }
    }
    if (isNumber(this._rule.min) && val.length < this._rule.min) {
      if (isString(this._rule.default)) {
        return this._rule.default;
      }
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule, 'min');
      }
      throw new ValidatorError(this._label, 'lenMin', { min: this._rule.min });
    }
    if (isNumber(this._rule.max) && val.length > this._rule.max) {
      if (isString(this._rule.default)) {
        return this._rule.default;
      }
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule, 'max');
      }
      throw new ValidatorError(this._label, 'lenMax', { max: this._rule.max });
    }
    return val;
  }

  /**
   * Apply this._rule to val returning a number or throwing an error.
   * @param {*} val
   */
  numberApply(val: any) {
    let isInt = REGEX.integer.test(this._rule.type);
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
        let valAsInt = parseInt(val, 10);
        if (NaN(valAsInt)) {
          if (this._rule.default) {
            return this.getDefault();
          }
          if (this._rule.required) {
            throw new ValidatorError(this.label, 'missing or invalid');
          }
        }
        return valAsInt;
      }
      let valAsFloat = parseFloat(val);
      if (NaN(valAsFloat)) {
        if (this._rule.default) {
          return this.getDefault();
        }
        if (this._rule.required) {
          throw new ValidatorError(this.label, 'missing or invalid');
        }
      }
      return valAsFloat;
    }
    if (this._rule.default) {
      return this.getDefault();
    }
    if (this._rule.required) {
      throw new ValidatorError(this.label, 'missing or invalid');
    }
  }

  applyNumberLimitTests(val) {
    if (isNumber(this._rule.min) && val < this._rule.min) {
      if (isNumber(this._rule.default)) {
        return this._rule.default;
      }
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule, 'min');
      }
      throw new ValidatorError(this._label, 'numMin', { min: this._rule.min });
    }
    if (isNumber(this._rule.max) && val > this._rule.max) {
      if (isNumber(this._rule.default)) {
        return this._rule.default;
      }
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule, 'max');
      }
      throw new ValidatorError(this._label, 'lenMax', { max: this._rule.max });
    }
    return val;
  }

  applyDate(val) {
    if (isDate(val)) {
      return this.applyDateLimitTests(val);
    }
    if (hasValue(val)) {
      if (isFunction(this._rule.sanitize)) {
        val = this._rule.sanitize(val, this._rule);
        return this.applyDateLimitTests(val);
      }
      if (this._rule.sanitize === true) {
        return this.applyDateLimitTests(val);
      }
      let valAsDate = new Date(val);
      return this.applyDateLimitTests(valAsDate);
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
    return val;
  }

  applyDateLimitTests(val) {
    if (hasValue(this._rule.min) && val < this._rule.min) {
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule, 'min');
      }
      if (hasValue(this._rule.default)) {
        return new Date(this._rule.default);
      }
      throw new ValidatorError(this._label, 'dateMin', { min: this._rule.min });
    }
    if (hasValue(this._rule.max) && val > this._rule.max) {
      if (isFunction(this._rule.default)) {
        return this._rule.default(val, this._rule, 'max');
      }
      if (hasValue(this._rule.default)) {
        return new Date(this._rule.default);
      }
      throw new ValidatorError(this._label, 'dateMax', { max: this._rule.max });
    }
    return val;
  }

  applyObject(val) {
    if (isObject(val)) {
      return val;
    }
    if (hasValue(val)) {
      if (isFunction(this._rule.sanitize)) {
        return this._rule.sanitize(val, this._rule);
      }
      throw new ValidatorError(this._label, 'invalid');
    }
    if (isFunction(this._rule.default)) {
      return this._rule.default(val, this._rule);
    }
    if (isObject(this._rule.default)) {
      return deepCopy(this._rule.default);
    }
    if (this._rule.required) {
      throw new ValidatorError(this._label, 'missing');
    }
    return val;
  }

  applyObjectProperties(val) {

  }

  fnOrVal(fn, ...args) {
    if (isFunction(fn)) {
      return fn(...args);
    }
    return fn;
  }


  getDefault() {
    if (isFunction(this._rule.default)) {
      return this._rule.default(this._value, this._rule);
    }
    return this._rule.default;
  }  /**
   * Verify that val is one of the basic types
   * @param val
   * @param type {String} One of 'array'
   * @returns {boolean}
   */
  static validateType(val, type) {
    if (isRegExp(type)) {
      return type.test(val);
    } else {
      let types = Array.isArray(type) ? type : [];
      if (isString(type)) {
        types = type.split('|');
      }
      for (let tdx = 0; tdx < types.length; tdx++) {
        let t = types[tdx];
        if (ValidatorItem.validatePrimitiveType(val, t)) {
          return true;
        }
      }
    }
    return false;
  }

}

export class ValidatorInput extends ValidatorItem {
  constructor(parent: object, value: any, fnFromData: any) {
    value = hasValue(value) ? value : '';
    if( isString(value) && value.length > 0 ) {
      value = value.trim();
    }
    super(parent, 'input', value);
  }

  hasValue(): boolean {
    return this._value && this._value.length > 0;
  }
}

export class ValidatorOption extends ValidatorItem {
  constructor(parent, value) {
    super(parent, 'option', value);
  }
}

export class ValidatorResponse extends ValidatorItem {
  constructor(parent, value) {
    super(parent, 'response', value);
  }
}
