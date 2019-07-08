// import { isFunction, isString, isNumber, isObject, isBoolean, isDate, isNonEmptyString, deepCopy } from 'lib/util';
// import { ValidatorError } from 'lib/validator-error';
// import { ValidatorRule } from 'lib/validate/validate-rule';

// const REGEX = {
//   string: /^(string)$/,
//   number: /^(int|integer|float|number)$/,
//   boolean: /^boolean$/,
//   object: /^(array|object|date)$/,
//   integer: /^(int|integer)$/,
//   isTrue: /^true$/i,
//   isFalse: /^false$/i
// };
// const FNMAP = {
//   string: 'string',
//   boolean: 'boolean',
//   int: 'number',
//   integer: 'number'
// };

// /**
//  * Validate a single val, returning a value or throwing an error.
//  */
// export class ValidateItem {

//   /**
//    *
//    * @param {*} val - The val to be tested
//    * @param {*} ruleDef - The rules
//    * @param {string} [ruledef.name] - The machine name of the property
//    * @param {string} [ruledef.label] - The user friendly name of the property
//    * @param {string} ruledef.type - One of 'string', 'int', integer',
//    * 'float', 'number', 'boolean', 'array', 'date', 'object'. Must be set unless
//    * ruleDef.sanitize === 'integer'
//    * @param {RegExp|function} [ruledef.test] - Test to be run against val
//    * @param {*|function} [ruledef.default] - Default value if val is not present
//    * @param {number|Date} [ruledef.min] - Min value or length of val
//    * @param {number|Date} [ruledef.max] - Max value or length of val
//    * @param {*|function} [ruledef.sanitize] - Function to apply to val if it is not of the right type
//    */
//   constructor (parent, val, ruleDef) {
//     this.parent = parent;
//     this.value = val;
//     this.rule = new ValidatorRule(ruleDef);
//     this.errors = [];
//   }

//   apply () {
//     let methodName = FNMAP[this.rule.type];
//     if (!methodName) {
//       throw new Error(`Invalid type '${this.rule.type}'`);
//     }
//     this.label = this.rule.label ? this.rule.label : this.rule.name;
//     try {
//       val = this[methodName + 'Apply'](val);
//     } catch (err) {
//       this.errors.push(err);
//     }
//     if (methodName === 'object' && this.rule.properties) {
//       Object.keys(this.rule.properties).forEach(prop => {
//         try {
//           let item = new ValidateItem(val[prop], this.rule.properties[prop]);
//           item.apply();
//         } catch (err) {
//           this.errors.push(err);
//         }
//       });
//     }
//     if (methodName === 'array' && this.rule.arrayType) {
//       for (let idx = 0; idx < val.length; ++idx) {
//         try {
//           let item = new ValidateItem(val[idx, this.rule.arrayType]);
//           item.apply()
//         } catch (err) {
//           this.errors.push(err);
//         }
//       }
//     }
//   }


//   /**
//    * Apply this.rule to val returning a boolean or throwing an error.
//    * @param {*} val
//    */
//   booleanApply (val) {
//     if (isBoolean(val)) {
//       return val;
//     }
//     if (isFunction(this.rule.sanitize)) {
//       return this.rule.sanitize(val, this.rule);
//     }
//     if (this.rule.sanitize === true || this.rule.sanitize === 'boolean') {
//       if (isNumber(val) && val > 0) {
//         return true;
//       }
//       if (isString(val) && REGEX.isTrue.text(val)) {
//         return true;
//       }
//       if (isString(val) && REGEX.isFalse.text(val)) {
//         return false;
//       }
//     }
//     if (isBoolean(this.rule.default)) {
//       return this.rule.default;
//     }
//     if (isFunction(this.rule.default)) {
//       return this.rule.default(val, this.rule);
//     }
//     if (this.rule.required) {
//       throw new ValidatorError(this.label, 'boolean', 'missing or invalid');
//     }
//   }

//   /**
//    * Apply this.rule to val returning a string or throwing an error.
//    * @param {*} val
//    */
//   stringApply (val) {
//     if (isString(val)) {
//       return this.applyStringLengthTests(val);
//     }
//     if (this.rule.default && (val === undefined || val === null)) {
//       if (isString(this.rule.default)) {
//         return this.rule.default;
//       }
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule);
//       }
//     }
//     if (isFunction(this.rule.sanitize)) {
//       val = this.rule.sanitize(val, this.rule);
//       return this.applyStringLengthTests(val);
//     }
//     if (this.rule.sanitize === true || this.rule.sanitize === 'string') {
//       return this.applyStringLengthTests(String(val));
//     }
//     if (this.rule.required) {
//       throw new ValidatorError(this.label, 'string', 'missing');
//     }
//   }

//   applyStringLengthTests (val) {
//     if( isRegExp(this.rule.test)) {
//       if( !this.rule.test.test(val) ) {
//         throw new ValidatorError(this.label, 'string', 'invalid');
//       }
//     }
//     if( isFunction(this.rule.test)) {
//       if( !this.rule.test(val,this.rule)) {
//         throw new ValidatorError(this.label, 'string', 'invalid');
//       }
//     }
//     if (isNumber(this.rule.min) && val.length < this.rule.min) {
//       if (isString(this.rule.default)) {
//         return this.rule.default;
//       }
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule, 'min');
//       }
//       throw new ValidatorError(label, 'lenMin', { min: this.rule.min })
//     }
//     if (isNumber(this.rule.max) && val.length > this.rule.max) {
//       if (isString(this.rule.default)) {
//         return this.rule.default;
//       }
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule, 'max');
//       }
//       throw new ValidatorError(label, 'lenMax', { max: this.rule.max });
//     }
//     return val;
//   }

//   /**
//    * Apply this.rule to val returning a number or throwing an error.
//    * @param {*} val
//    */
//   numberApply (val) {
//     let isInt = REGEX.integer.test(this.rule.type);
//     if (isNumber(val)) {
//       if (isInt) {
//         if (isFunction(this.rule.sanitize)) {
//           val = this.rule.sanitize(val, rule);
//           return this.applyNumberLimitTests(val);
//         }
//         if (this.rule.sanitize === true) {
//           val = Math.round(val);
//           return this.applyNumberLimitTests(val);
//         }
//         if (isString(this.rule.sanitize) && isFunction(Math[this.rule.sanitize]) {
//           val = Math[this.rule.sanitize](val);
//           return this.applyNumberLimitTests(val);
//         }
//         if (Math.round(val) !== val) {
//           throw new ValidatorError(this.label, 'invalid');
//         }
//       }
//       return this.applyNumberLimitTests(val);
//     }
//     if (isString(val)) {
//       if (isInt) {
//         let valAsInt = parseInt(val, 10);
//         if (NaN(valAsInt)) {
//           if (this.rule.default) {
//             return this.getDefault();
//           }
//           if (this.rule.required) {
//             throw new ValidatorError(this.label, 'missing or invalid');
//           }
//         }
//         return valAsInt;
//       }
//       let valAsFloat = parseFloat(val);
//       if (NaN(valAsFloat)) {
//         if (this.rule.default) {
//           return this.getDefault();
//         }
//         if (this.rule.required) {
//           throw new ValidatorError(this.label, 'missing or invalid');
//         }
//       }
//       return valAsFloat;
//     }
//     if (this.rule.default) {
//       return this.getDefault();
//     }
//     if (this.rule.required) {
//       throw new ValidatorError(this.label, 'missing or invalid');
//     }
//   }

//   applyNumberLimitTests (val) {
//     if (isNumber(this.rule.min) && val < this.rule.min) {
//       if (isNumber(this.rule.default)) {
//         return this.rule.default;
//       }
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule, 'min');
//       }
//       throw new ValidatorError(label, 'numMin', { min: this.rule.min })
//     }
//     if (isNumber(this.rule.max) && val > this.rule.max) {
//       if (isNumber(this.rule.default)) {
//         return this.rule.default;
//       }
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule, 'max');
//       }
//       throw new ValidatorError(label, 'lenMax', { max: this.rule.max });
//     }
//     return val;
//   }

//   applyDate (val) {
//     if (isDate(val)) {
//       return this.applyDateLimitTests(val)
//     }
//     if (hasValue(val)) {
//       if (isFunction(this.rule.sanitize)) {
//         val = this.rule.sanitize(val, rule);
//         return this.applyDateLimitTests(val);
//       }
//       if (this.rule.sanitize === true) {
//         return this.applyDateLimitTests(val);
//       }
//       let valAsDate = new Date(val);
//       return this.applyDateLimitTests(valAsDate)
//     }
//     if (isFunction(this.rule.default)) {
//       return this.rule.default(val, this.rule);
//     }
//     if (hasValue(this.rule.default)) {
//       return new Date(this.rule.default);
//     }
//     if (this.rule.required) {
//       throw new ValidatorError(this.label, 'missing or invalid');
//     }
//     return val;
//   }

//   applyDateLimitTests (val) {
//     if (hasValue(this.rule.min) && val < this.rule.min) {
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule, 'min');
//       }
//       if (hasValue(this.rule.default)) {
//         return new Date(this.rule.default);
//       }
//       throw new ValidatorError(label, 'dateMin', { min: this.rule.min })
//     }
//     if (hasValue(this.rule.max) && val > this.rule.max) {
//       if (isFunction(this.rule.default)) {
//         return this.rule.default(val, this.rule, 'max');
//       }
//       if (hasValue(this.rule.default)) {
//         return new Date(this.rule.default);
//       }
//       throw new ValidatorError(label, 'dateMax', { max: this.rule.max })
//     }
//     return val;
//   }

//   applyObject (val) {
//     if (isObject(val)) {
//       return val;
//     }
//     if (hasValue(val)) {
//       if (isFunction(this.rule.sanitize)) {
//         return this.rule.sanitize(val, rule);
//       }
//       throw new ValidatorError(this.label, 'invalid');
//     }
//     if (isFunction(this.rule.default)) {
//       return this.rule.default(val, this.rule);
//     }
//     if (isObject(this.rule.default)) {
//       return deepCopy(this.rule.default);
//     }
//     if (this.rule.required) {
//       throw new ValidatorError(this.label, 'missing');
//     }
//     return val;
//   }

//   applyObjectProperties (val) {

//   }

//   fnOrVal (fn, ...args) {
//     if (isFunction(fn)) {
//       return fn(...args)
//     }
//     return fn;
//   }


//   getDefault () {
//     if (isFunction(this.rule.default)) {
//       return this.rule.default(this.val, this.rule);
//     }
//     return this.rule.default;
//   }
// }
// export function fnOrValue (fn) {
//   if (isFunction(fn)) {
//     return fn(this.val, this.rule);
//   }
//   return fn;
// }

// /**
//   * Validate a value by sanitizing (to string, to integer, using function),
//   * limit testing (min, max) and test the value against a type or RegExp.
//   * Functions are called with parameters (val, ruleDef).
//   * @param val {string|number|
//   * @param ruleDef
//   * @param label {string}
//   * @param ruleDef.type {string|Regex} one of 'string', 'int', integer',
//   * 'float', 'number', 'boolean', 'array', 'date', 'object'. Must be set unless
//   * ruleDef.sanitize === 'integer'
//   * @param ruleDef.default {*} - If set, and val does not pass ruleDef, then
//   * set the return value to ruleDef.default.
//   * @param ruleDef.sanitize {String|function} If a string, must be one of 'string', 'integer', 'int'
//   * @param ruleDef.min {number} min string length or integer value
//   * @param ruleDef.max {number} max string length or integer value
//   * @returns { value: value, error: {string} } Returns a translated error
//   *   string or sanitized value if no error
//   */
// export function applyRuleDef (value, ruleDef) {

//   let label = label ? label : ruleDef.name;

//   val = fnOrValue(ruleDef.sanitize, value, ruleDef);


//   // Deal with numbers
//   if (REGEX.number.test(ruleDef.type)) {
//     if (ruleDef.strict !== true) {
//       if (isString(ruleDef.sanitize) && REGEX.integer.test(ruleDef.sanitize)) {
//         val = parseInt(val, 10);
//       }
//     }
//     if (!isNumber(val)) {
//       if (ruleDef.strict) {
//         return { error: new ValidatorError(label, 'invalid') };
//       }
//       if (ruleDef.default) {
//         val = fnOrValue(ruleDef.default, val, ruleDef);
//       }
//     }
//     if (isNumber(ruleDef.min) && val < ruleDef.min) {
//       if (ruleDef.default === true) {
//         return { value: ruleDef.min }
//       } else if (ruleDef.default) {
//         return { value: fnOrValue(ruleDef.default, val, ruleDef) };
//       }
//       return { error: new ValidatorError(label, 'numMin', { min: ruleDef.min }) };
//     }
//     if (isNumber(ruleDef.max) && val < ruleDef.max) {
//       if (ruleDef.default === true) {
//         return { value: ruleDef.max }
//       } else if (ruleDef.default) {
//         return { value: fnOrValue(ruleDef.default, val, ruleDef) };
//       }
//       return { error: new ValidatorError(label, 'numMax', { max: ruleDef.max }) };
//     }
//     return { value: val };
//   }

//   // Deal with dates
//   if (ruleDef.type === 'date') {
//     val = isDate(val) ? val : new Date(val);
//     if (hasValue(ruleDef.min)) {
//       let min = isDate(ruleDef.min) ? ruleDef.min : new Date(min);
//       if (val < min) {
//         if (ruleDef.default === true) {
//           return { value: min }
//         } else if (ruleDef.default) {
//           return { value: fnOrValue(ruleDef.default, val, ruleDef) };
//         }
//         return { error: new ValidatorError(label, 'dateMin', { min: ruleDef.min }) };
//       }
//     }
//     if (hasValue(ruleDef.max)) {
//       let max = isDate(ruleDef.max) ? ruleDef.max : new Date(max);
//       if (val > max) {
//         if (ruleDef.default === true) {
//           return { value: max }
//         } else if (ruleDef.default) {
//           return { value: fnOrValue(ruleDef.default, val, ruleDef) };
//         }
//         return { error: new ValidatorError(label, 'dateMax', { max: ruleDef.max }) };
//       }
//     }
//     return { value: val };
//   }

//   if (REGEX.object.test(ruleDef.type)) {


//   }


//   if (typeIs.number || ruleDef.sanitize === 'integer') {
//     // Check min/max of numbers
//     if (val > ruleDef.max) {
//       if (isNumber(ruleDef.default)) {
//         return { value: ruleDef.default };
//       } else if (ruleDef.default === true) {
//         return { value: ruleDef.min };
//       } else if (isFunction(ruleDef.default)) {
//         return { value: ruleDef.default(val, ruleDef) };
//       }
//       return { error: new ValidatorError(label, 'numMax', { max: ruleDef.max }) };
//     }
//     if (val < ruleDef.min) {
//       if (isNumber(ruleDef.default)) {
//         return { value: ruleDef.default };
//       } else if (ruleDef.default === true) {
//         return { value: ruleDef.max };
//       } else if (isFunction(ruleDef.default)) {
//         return { value: ruleDef.default(val, ruleDef) };
//       }
//       return { error: new ValidatorError(label, 'numMin', { min: ruleDef.min }) };
//     }
//   } else if (!typeIs.object && !typeIs.boolean) {
//     // Check min/max of string length or num
//     if (isInteger(ruleDef.max) && val.length > ruleDef.max) {
//       return { error: new ValidatorError(label, 'lenMax', { max: ruleDef.max }) };
//     }
//     if (isInteger(ruleDef.min) && val.length < ruleDef.min) {
//       return { error: new ValidatorError(label, 'lenMin', { min: ruleDef.min }) };
//     }
//   }

//   if (!ValidatorItem.validateType(val, ruleDef.type)) {
//     return { error: new ValidatorError(label, 'invalid') };
//   }

//   return { value: val };
// }

// export functionOrValue(val, fn) {

// }

//   /**
//    * Verify that val is one of the basic types
//    * @param val
//    * @param type {String} One of 'array'
//    * @returns {boolean}
//    */
//   static validateType(val, type) {
//   if (isRegExp(type)) {
//     return type.test(val);
//   } else {
//     let types = Array.isArray(type) ? type : [];
//     if (isString(type)) {
//       types = type.split('|');
//     }
//     for (let tdx = 0; tdx < types.length; tdx++) {
//       let t = types[tdx];
//       if (ValidatorItem.validatePrimitiveType(val, t)) {
//         return true;
//       }
//     }
//   }
//   return false;
// }
