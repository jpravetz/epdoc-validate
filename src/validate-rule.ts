import { isObject, isNonEmptyString, isString, isNumber, isInteger, isBoolean, pick } from './lib/util';

const RULE_PARAMS = ['required', 'type', 'label', 'test', 'min', 'max', 'default', 'sanitize', 'fromView', 'strict'];
const RULE_LIBRARY = {
  url: { test: /^https?:\/\// },
  email: {
    test: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
    sanitize: function (v) {
      return String(v); // v.toLowerCase();
    }
  },
  dimension: { type: 'string', test: /^\d[1,4]$/ },
  aspect: { type: 'string', test: /^\d+:\d+$/ },
  title: { type: 'string', test: /^.+$/ },
  filename: { type: 'string', test: /^[^\/]+$/ },
  fullname: { type: 'string', test: /^.+$/ },
  company: { type: 'string', test: /^.+$/ },
  subject: { type: 'string', test: /^.+$/ },
  description: { type: 'string', test: /^.+$/ },
  password: { type: 'string', test: /^.{6,}$/ },
  label: { type: 'string', test: /^[a-zA-Z\-\.\s]+$/ },
  username: { type: 'string', test: /^[a-z0-9]+$/ },
  interaction: { type: 'string', test: /^(none|url|clickplay)$/ },
  globalPerm: { type: 'string', test: /^(none|globalView|globalAdmin)$/ },
  streamStatus: { type: 'string', test: /^(upcoming|live|completed)$/ },
  usertoken: { type: 'string', test: /^.*$/ },
  externalId: { type: 'string', test: /^.*$/ },
  posInt: { type: 'string', test: /^\d+$/, sanitize: 'integer' },
  posIntAsString: { type: 'string', test: /^\d+$/, sanitize: 'string' },
  signedInt: { type: 'string', test: /^(\+|-)?\d+$/, sanitize: 'integer' }
};
const PRIM_MAP = {
  '*': function (val) {
    return true;
  },
  array: function (val) {
    return Array.isArray(val);
  },
  string: function (val) {
    return isString(val);
  },
  number: function (val) {
    return isNumber(val);
  },
  integer: function (val) {
    return isInteger(val);
  },
  boolean: function (val) {
    return isBoolean(val);
  },
  object: function (val) {
    return isObject(val);
  }
};

export class ValidateRule {

  name: string;
  label: string;
  type: any;
  test: any;
  default: any;
  min: number;
  max: number;
  sanitize: any;
  required: boolean;
  optional: boolean;
  strict: boolean;

  /**
   * @param {Object|string} rule - The rule or a reference to a predefined rule
   * @param {string} [rule.name] - The machine name of the property, used
   * if/when adding to changes object
   * @param {string} [rule.label] - The display name of the property, set to
   * rule.name if not set
   * @param {string} rule.type - The name of a predefined rule or one of the
   * primitive types 'string', 'int', integer', 'float', 'number', 'boolean',
   * 'array', 'date', 'object'. Must be set unless ruleDef.sanitize ===
   * 'integer'
   * @param {RegExp|function} [rule.test] - Test to be run against val
   * @param {*|function} [rule.default] - Default value if val is not present
   * @param {number|Date} [rule.min] - Min value or length of val
   * @param {number|Date} [rule.max] - Max value or length of val
   * @param {*|function} [rule.sanitize] - Function to apply to val if it is not
   * of the right type
   * @param {boolean} [rule.required] - The value must be present. Relevant for
   * properties that are recursively validated.
   * @param {boolean} [rule.required] - The value may be present. Relevant for
   * properties that are recursively validated.
   * @param {boolean} [rule.strict] - Strictly apply required and optional and
   * produce error
   *
   * REVIEW THESE
   * @param rules.apply
   * @param rules.apply.array {boolean} apply the value to changes[rules.name]
   * as a push
   *
   */
  constructor(rule: any) {
    if (isObject(rule)) {
      Object.assign(this, pick(rule, RULE_PARAMS));
      if (isString(rule.type) && RULE_LIBRARY[rule.type]) {
        Object.assign(this, RULE_LIBRARY[rule.type]);
      }
      this._recurse(rule);
    } else if (isNonEmptyString(rule)) {
      this._fromLibrary(rule);
    }
    this.label = this.label ? this.label : this.name;
  }

  isValid() {
    return this.type ? true : false;
  }

  _fromLibrary(sRule) {
    if (RULE_LIBRARY[sRule]) {
      Object.assign(this, RULE_LIBRARY[sRule]);
    } else {
      let types = sRule.split('|');
      for (let tdx = 0; tdx < types.length; tdx++) {
        if (!PRIM_MAP[types[tdx]]) {
          throw new Error(`Invalid type ${sRule} must be one of ${ValidateRule.validTypes().join(', ')}`);
        }
      }
      // TODO 
      //result = { type: sRule };
    }
    return this;
  }

  /**
   * Expand 'properties', 'required' and 'optional' generic objects into the
   * 'properties' generic object as a hash of key = ValidateRule object.
   * @param {Object} rule - Generic object potentially with 'properties',
   * 'required' and 'optional' dictionaries
   */
  _recurse(rule) {
    let props = [];
    if (isObject(rule.properties)) {
      Object.keys(rule.properties).forEach(key => {
        let subRule = new ValidateRule(rule.properties[key]);
        props.push(subRule);
      });
    }
    ['required', 'optional'].forEach(prop => {
      if (isObject(rule[prop])) {
        Object.keys(rule[prop]).forEach(key => {
          let subRule = new ValidateRule(rule[prop][key]);
          subRule[prop] = true;
          props.push(subRule);
        });
      }
    });
    return this;
  }

  static validTypes() {
    return [...Object.keys(PRIM_MAP), ...Object.keys(RULE_LIBRARY)];
  }
}
