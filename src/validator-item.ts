import { Validator } from './validator';
import { ValidatorError } from './validator-error';
import { isBoolean, isNumber, isObject, isRegExp, isString, isInteger, isFunction, GenericObject } from './lib/util';
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
const PRIM_MAP = {
  '*': function (val: any) {
    return true;
  },
  array: function (val: any) {
    return Array.isArray(val);
  },
  string: function (val: any) {
    return isString(val);
  },
  number: function (val: any) {
    return isNumber(val);
  },
  integer: function (val: any) {
    return isInteger(val);
  },
  boolean: function (val: any) {
    return isBoolean(val);
  },
  object: function (val: any) {
    return isObject(val);
  }
};
const APPLY_METHOD = {
  string: 'stringApply',
  boolean: 'booleanApply',
  int: 'numberApply',
  integer: 'numberApply'
};

export class ValidatorItem {
  parent: object;
  role: string;
  value: any;
  errors: object[];
  hasValue: boolean = false;
  _name: string;
  _label: string


  constructor(parent: object, role: string, value: any) {
    this.parent = parent;
    this.role = role;
    this.value = value;
    this.setHasValue();
    this.errors = [];
  }

  setHasValue() {
    this.hasValue = (this.value === undefined || this.value === null) ? false : true;
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

  validateProperty(obj: any, name: string, ruleDef: ValidateRule, opts: GenericObject = {}) {
    if (!obj[name] && opts.required) {
      return new ValidatorError(name, 'missing');
    } else if (obj[name] && !Validator.validateType(obj[name], type)) {
      return new ValidatorError(name, 'type');
    }
  }

  rule(rule) {
    this._rules = new ValidateRule(rule);
    if (isFunction(rule.fromView)) {
      this.value = rule.fromView(this.value);
    }
    return this;
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
  validate(rule) {
    if (this.rule.name && !this._name) {
      this._name = this.rule.name;
    }
    if (this.rule.label && !this._label) {
      this._label = this.rule.label;
    }
    if (!this._label) {
      this._label = this._name;
    }
    // let newObj = this.parent.doc ? this.parent.changes;
    return this._validate(this.value, rule);
  }

  _validate(value, rule) {
    // First if empty and required or present and strict and not optional
    if (!this.hasValue()) {
      if (rule.default) {
        this.value = rule.default;
        return this;
      } else {
        if (rule.required) {
          this.errors.push(new ValidatorError(label, 'missing'));
        }
        // Nothing more to test
        return this;
      }
    } else if (rule.strict && !rule.optional && !rule.required) {
      this.errors.push(new ValidatorError(label, 'notAllowed'));
      return this;
    }

    // Now test the actual value
    let test = ValidatorItem.apply(this.value, ruleDef);
    if (test.errors.length) {
      if (rule.default) {
        this.value = rule.default;
      }
    } else {
      if (rule.apply && rule.apply.array) {
        this.parent.changes[rule.name].push(test.value);
      } else {
        if (!this.parent.doc || this.parent.doc[rule.name] !== test.value) {
          this.parent.changes[rule.name] = test.value;
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
    let methodName = APPLY_METHOD[this.rule.type];
    if (!methodName) {
      throw new Error(`Invalid type '${this.rule.type}'`);
    }
    try {
      val = this[methodName](val);
    } catch (err) {
      this.errors.push(err);
    }
    if (this.rule.type === 'object' && this.rule.properties) {
      Object.keys(this.rule.properties).forEach(prop => {
        try {
          let item = new ValidateItem(val[prop], this.rule.properties[prop]);
          item.apply();
        } catch (err) {
          this.errors.push(err);
        }
      });
    }
    if (methodName === 'array' && this.rule.arrayType) {
      for (let idx = 0; idx < val.length; ++idx) {
        try {
          let item = new ValidateItem(val[idx, this.rule.arrayType]);
          item.apply();
        } catch (err) {
          this.errors.push(err);
        }
      }
    }
  }


  /**
   * Apply this.rule to val returning a boolean or throwing an error.
   * @param {*} val
   */
  booleanApply(val) {
    if (isBoolean(val)) {
      return val;
    }
    if (isFunction(this.rule.sanitize)) {
      return this.rule.sanitize(val, this.rule);
    }
    if (this.rule.sanitize === true || this.rule.sanitize === 'boolean') {
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
    if (isBoolean(this.rule.default)) {
      return this.rule.default;
    }
    if (isFunction(this.rule.default)) {
      return this.rule.default(val, this.rule);
    }
    if (this.rule.required) {
      throw new ValidatorError(this.label, 'boolean', 'missing or invalid');
    }
  }

  /**
   * Apply this.rule to val returning a string or throwing an error.
   * @param {*} val
   */
  stringApply(val) {
    if (isString(val)) {
      return this.applyStringLengthTests(val);
    }
    if (this.rule.default && (val === undefined || val === null)) {
      if (isString(this.rule.default)) {
        return this.rule.default;
      }
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule);
      }
    }
    if (isFunction(this.rule.sanitize)) {
      val = this.rule.sanitize(val, this.rule);
      return this.applyStringLengthTests(val);
    }
    if (this.rule.sanitize === true || this.rule.sanitize === 'string') {
      return this.applyStringLengthTests(String(val));
    }
    if (this.rule.required) {
      throw new ValidatorError(this.label, 'string', 'missing');
    }
  }

  applyStringLengthTests(val) {
    if (isRegExp(this.rule.test)) {
      if (!this.rule.test.test(val)) {
        throw new ValidatorError(this.label, 'string', 'invalid');
      }
    }
    if (isFunction(this.rule.test)) {
      if (!this.rule.test(val, this.rule)) {
        throw new ValidatorError(this.label, 'string', 'invalid');
      }
    }
    if (isNumber(this.rule.min) && val.length < this.rule.min) {
      if (isString(this.rule.default)) {
        return this.rule.default;
      }
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule, 'min');
      }
      throw new ValidatorError(label, 'lenMin', { min: this.rule.min });
    }
    if (isNumber(this.rule.max) && val.length > this.rule.max) {
      if (isString(this.rule.default)) {
        return this.rule.default;
      }
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule, 'max');
      }
      throw new ValidatorError(label, 'lenMax', { max: this.rule.max });
    }
    return val;
  }

  /**
   * Apply this.rule to val returning a number or throwing an error.
   * @param {*} val
   */
  numberApply(val) {
    let isInt = REGEX.integer.test(this.rule.type);
    if (isNumber(val)) {
      if (isInt) {
        if (isFunction(this.rule.sanitize)) {
          val = this.rule.sanitize(val, rule);
          return this.applyNumberLimitTests(val);
        }
        if (this.rule.sanitize === true) {
          val = Math.round(val);
          return this.applyNumberLimitTests(val);
        }
        if (isString(this.rule.sanitize) && isFunction(Math[this.rule.sanitize])) {
          val = Math[this.rule.sanitize](val);
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
          if (this.rule.default) {
            return this.getDefault();
          }
          if (this.rule.required) {
            throw new ValidatorError(this.label, 'missing or invalid');
          }
        }
        return valAsInt;
      }
      let valAsFloat = parseFloat(val);
      if (NaN(valAsFloat)) {
        if (this.rule.default) {
          return this.getDefault();
        }
        if (this.rule.required) {
          throw new ValidatorError(this.label, 'missing or invalid');
        }
      }
      return valAsFloat;
    }
    if (this.rule.default) {
      return this.getDefault();
    }
    if (this.rule.required) {
      throw new ValidatorError(this.label, 'missing or invalid');
    }
  }

  applyNumberLimitTests(val) {
    if (isNumber(this.rule.min) && val < this.rule.min) {
      if (isNumber(this.rule.default)) {
        return this.rule.default;
      }
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule, 'min');
      }
      throw new ValidatorError(label, 'numMin', { min: this.rule.min });
    }
    if (isNumber(this.rule.max) && val > this.rule.max) {
      if (isNumber(this.rule.default)) {
        return this.rule.default;
      }
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule, 'max');
      }
      throw new ValidatorError(label, 'lenMax', { max: this.rule.max });
    }
    return val;
  }

  applyDate(val) {
    if (isDate(val)) {
      return this.applyDateLimitTests(val);
    }
    if (hasValue(val)) {
      if (isFunction(this.rule.sanitize)) {
        val = this.rule.sanitize(val, rule);
        return this.applyDateLimitTests(val);
      }
      if (this.rule.sanitize === true) {
        return this.applyDateLimitTests(val);
      }
      let valAsDate = new Date(val);
      return this.applyDateLimitTests(valAsDate);
    }
    if (isFunction(this.rule.default)) {
      return this.rule.default(val, this.rule);
    }
    if (hasValue(this.rule.default)) {
      return new Date(this.rule.default);
    }
    if (this.rule.required) {
      throw new ValidatorError(this.label, 'missing or invalid');
    }
    return val;
  }

  applyDateLimitTests(val) {
    if (hasValue(this.rule.min) && val < this.rule.min) {
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule, 'min');
      }
      if (hasValue(this.rule.default)) {
        return new Date(this.rule.default);
      }
      throw new ValidatorError(label, 'dateMin', { min: this.rule.min });
    }
    if (hasValue(this.rule.max) && val > this.rule.max) {
      if (isFunction(this.rule.default)) {
        return this.rule.default(val, this.rule, 'max');
      }
      if (hasValue(this.rule.default)) {
        return new Date(this.rule.default);
      }
      throw new ValidatorError(label, 'dateMax', { max: this.rule.max });
    }
    return val;
  }

  applyObject(val) {
    if (isObject(val)) {
      return val;
    }
    if (hasValue(val)) {
      if (isFunction(this.rule.sanitize)) {
        return this.rule.sanitize(val, rule);
      }
      throw new ValidatorError(this.label, 'invalid');
    }
    if (isFunction(this.rule.default)) {
      return this.rule.default(val, this.rule);
    }
    if (isObject(this.rule.default)) {
      return deepCopy(this.rule.default);
    }
    if (this.rule.required) {
      throw new ValidatorError(this.label, 'missing');
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
    if (isFunction(this.rule.default)) {
      return this.rule.default(this.val, this.rule);
    }
    return this.rule.default;
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

  /**
   * Same as validateType except that type can be an array of types and will match if any of the
   * types match
   * @param val {*} The value to verify
   * @param type {array or string} Array of types or array as '|' separated string
   * @returns {boolean}
   */
  static validatePrimitiveType(val, type) {
    if (PRIM_MAP[type]) {
      return PRIM_MAP[type](val);
    }
    return false;
  }
}

export class ValidatorInput extends ValidatorItem {
  constructor(parent: object, value: *, fnFromData: function) {
    super(parent, 'input', value);
  }

  setHasValue() {
    this.value = (this.value === undefined || this.value === null) ? '' : String(this.value);
    if (this.value.length > 0) {
      this.value = this.value.trim();
    }
    this.hasValue = this.value.length > 0;
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
