import {
  isObject,
  isNonEmptyString,
  isString,
  GenericObject,
  schemaTypeValidator,
  validSchemaTypes,
  Callback
} from './lib/util';

const FORMAT_LIBRARY = {
  email: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
  dimension: /^\d[1,4]$/,
  filename: /^[^\/]+$/,
  password: /^.{6,}$/,
  globalPerm: /^(none|globalView|globalAdmin)$/
};

interface IValidatorRuleParamHack {
  [index: string]: any;
}

export interface ValidatorRuleParams {
  name?: string;
  label?: string;
  type: string;
  format?: string;
  readonly pattern?: RegExp | Function;
  readonly default?: any;
  readonly min?: number;
  readonly max?: number;
  readonly sanitize?: any;
  required?: boolean | ValidatorRuleProperties;
  optional?: boolean | ValidatorRuleProperties;
  strict?: boolean;
  properties?: ValidatorRuleProperties;
  arrayType?: string; // if an array, the entries must be of this type
  appendToArray?: boolean; // for arrays
  fromView?: Callback; // hook to allow value to be manipulated, eg converting 0/1 to false/true XXX use sanitize instead
}

export interface ValidatorRuleProperties {
  [key: string]: ValidatorRuleParams;
}

const RULE_LIBRARY: { [key: string]: ValidatorRuleParams } = {
  url: { type: 'string', pattern: /^https?:\/\// },
  email: {
    type: 'string',
    pattern: FORMAT_LIBRARY.email,
    sanitize: function(v: any) {
      return String(v); // v.toLowerCase();
    }
  },
  dimension: { type: 'string', pattern: FORMAT_LIBRARY.dimension },
  aspect: { type: 'string', pattern: /^\d+:\d+$/ },
  title: { type: 'string', pattern: /^.+$/ },
  filename: { type: 'string', pattern: FORMAT_LIBRARY.filename },
  fullname: { type: 'string', pattern: /^.+$/ },
  company: { type: 'string', pattern: /^.+$/ },
  subject: { type: 'string', pattern: /^.+$/ },
  description: { type: 'string', pattern: /^.+$/ },
  password: { type: 'string', pattern: FORMAT_LIBRARY.password },
  label: { type: 'string', pattern: /^[a-zA-Z\-\.\s]+$/ },
  username: { type: 'string', pattern: /^[a-z0-9]{2,}$/ },
  interaction: { type: 'string', pattern: /^(none|url|clickplay)$/ },
  globalPerm: { type: 'string', pattern: FORMAT_LIBRARY.globalPerm },
  streamStatus: { type: 'string', pattern: /^(upcoming|live|completed)$/ },
  usertoken: { type: 'string', pattern: /^.*$/ },
  externalId: { type: 'string', pattern: /^.*$/ },
  posInt: { type: 'string', pattern: /^\d+$/, sanitize: 'integer' },
  posIntAsString: { type: 'string', pattern: /^\d+$/, sanitize: 'string' },
  signedInt: { type: 'string', pattern: /^(\+|-)?\d+$/, sanitize: 'integer' }
};

export class ValidatorRule {
  name?: string;
  label?: string;
  type: string = 'string';
  pattern?: any;
  default?: any;
  min?: number;
  max?: number;
  sanitize?: any;
  required?: boolean;
  optional?: boolean;
  strict?: boolean;
  properties?: GenericObject;
  arrayType?: any; // if an array, the entries must be of this type
  appendToArray?: boolean; // for arrays
  fromView?: Callback; // hook to allow value to be manipulated, eg converting 0/1 to false/true XXX use sanitize instead

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
  constructor(rule: ValidatorRuleParams | string) {
    if (isObject(rule)) {
      let r = rule as ValidatorRuleParams;
      Object.assign(this, r);
      if (isString(r.format) && RULE_LIBRARY[r.format as string]) {
        Object.assign(this, RULE_LIBRARY[r.format as string]);
      }
      this._recurse(r);
    } else if (isNonEmptyString(rule)) {
      this._fromLibrary(rule as string);
    }
    this.label = this.label ? this.label : this.name;
    if (!this.isValid()) {
      throw new Error('Invalid validator rule');
    }
  }

  isValid() {
    return this.type ? true : false;
  }

  _fromLibrary(sRule: string) {
    if (RULE_LIBRARY[sRule]) {
      // It's a pre-canned rule
      Object.assign(this, RULE_LIBRARY[sRule]);
    } else {
      let types = sRule.split('|');
      for (let tdx = 0; tdx < types.length; tdx++) {
        if (schemaTypeValidator(types[tdx]) === undefined) {
          throw new Error(
            `Invalid type ${sRule} must be one of ${validSchemaTypes.join(', ')}`
          );
        }
      }
      // TODO
      //result = { type: sRule };
    }
    return this;
  }

  /**
   * Expand 'properties', 'required' and 'optional' generic objects into the
   * 'properties' generic object as a hash of key = ValidatorRule object.
   * @param {Object} rule - Generic object potentially with 'properties',
   * 'required' and 'optional' dictionaries
   */
  _recurse(rule: ValidatorRuleParams): this {
    let props: ValidatorRule[] = [];
    if (isObject(rule.properties)) {
      let p = rule.properties as { [key: string]: ValidatorRuleParams };
      Object.keys(p).forEach(key => {
        let subRule = new ValidatorRule(p[key]);
        props.push(subRule);
      });
    }
    ['required', 'optional'].forEach((prop: string) => {
      if (isObject((rule as IValidatorRuleParamHack)[prop])) {
        Object.keys((rule as IValidatorRuleParamHack)[prop]).forEach(key => {
          let subRule = new ValidatorRule((rule as IValidatorRuleParamHack)[prop][key]);
          (subRule as IValidatorRuleParamHack)[prop] = true;
          props.push(subRule);
        });
      }
    });
    return this;
  }
}
