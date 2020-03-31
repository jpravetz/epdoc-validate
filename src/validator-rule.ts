import { ValueCallback } from './validator-base';
import {
  isObject,
  isString,
  isNonEmptyString,
  isDict,
  isRegExp,
  isFunction
} from 'epdoc-util';

/**
 * Callback to process a value. This function signature is used by the pattern,
 * sanitize and fromView callbacks.
 */
export type ValidatorCallback = (val: any, rule: ValidatorRule) => any;
export type IsMissingCallback = (val: any) => boolean;

export interface IValidatorRuleProps {
  [key: string]: IValidatorRuleParams;
}

export enum ValidatorType {
  string = 'string',
  number = 'number',
  boolean = 'boolean',
  null = 'null',
  object = 'object',
  array = 'array',
  date = 'date',
  any = 'any',
  integer = 'integer'
}

/**
 * Parameters to validate a value.
 */
export interface IValidatorRuleParams {
  name?: string;
  label?: string;
  type?: ValidatorType;
  format?: string;
  readonly pattern?: RegExp | ValidatorCallback;
  readonly default?: any;
  readonly min?: number;
  readonly max?: number;
  readonly sanitize?: boolean | string | ValidatorCallback;
  required?: boolean | IValidatorRuleProps;
  optional?: boolean | IValidatorRuleProps;
  strict?: boolean;
  isMissing?: IsMissingCallback;
  // For objects, a list of properties that the object may contain
  properties?: IValidatorRuleProps;
  // if an array, and itemType is specified, the entries must be of this type
  itemType?: string;
  // for arrays
  appendToArray?: boolean;
  // hook to allow value to be manipulated, eg converting 0/1 to false/true XXX use sanitize instead
  fromView?: ValueCallback;
}

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

const RULE_LIBRARY: { [key: string]: IValidatorRuleParams } = {
  url: { type: ValidatorType.string, pattern: /^https?:\/\// },
  email: {
    type: ValidatorType.string,
    pattern: FORMAT_LIBRARY.email,
    sanitize: (v: any) => {
      return String(v); // v.toLowerCase();
    }
  },
  dimension: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.dimension },
  aspect: { type: ValidatorType.string, pattern: /^\d+:\d+$/ },
  title: { type: ValidatorType.string, pattern: /^.+$/ },
  filename: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.filename },
  fullname: { type: ValidatorType.string, pattern: /^.+$/ },
  company: { type: ValidatorType.string, pattern: /^.+$/ },
  subject: { type: ValidatorType.string, pattern: /^.+$/ },
  description: { type: ValidatorType.string, pattern: /^.+$/ },
  password: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.password },
  label: { type: ValidatorType.string, pattern: /^[a-zA-Z\-\.\s]+$/ },
  username: { type: ValidatorType.string, pattern: /^[a-z0-9]{2,}$/ },
  interaction: { type: ValidatorType.string, pattern: /^(none|url|clickplay)$/ },
  globalPerm: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.globalPerm },
  streamStatus: { type: ValidatorType.string, pattern: /^(upcoming|live|completed)$/ },
  usertoken: { type: ValidatorType.string, pattern: /^.*$/ },
  externalId: { type: ValidatorType.string, pattern: /^.*$/ },
  posInt: { type: ValidatorType.string, pattern: /^\d+$/, sanitize: 'integer' },
  posIntAsString: { type: ValidatorType.string, pattern: /^\d+$/, sanitize: 'string' },
  signedInt: { type: ValidatorType.string, pattern: /^(\+|-)?\d+$/, sanitize: 'integer' }
};

export class ValidatorRule {
  public static isInstance(val: any): val is ValidatorRule {
    return val && isDict(val) && val._isValidatorRule;
  }

  // @ts-ignore
  public name?: string;
  public label?: string;
  public type: ValidatorType = ValidatorType.string;
  public pattern?: any;
  public default?: any;
  public min?: number;
  public max?: number;
  public sanitize?: any;
  public required?: boolean;
  public optional?: boolean;
  public strict?: boolean;
  public only?: boolean;
  public isMissing?: IsMissingCallback;
  public properties?: Record<string, ValidatorRule>;
  public itemType?: any; // if an array, the entries must be of this type
  public appendToArray?: boolean; // for arrays
  public fromView?: ValueCallback; // hook to allow value to be manipulated, eg converting 0/1 to false/true XXX use sanitize instead
  public readonly validRules = [
    'string',
    'number',
    'boolean',
    'null',
    'object',
    'array',
    'date',
    'any',
    'integer'
  ];
  // @ts-ignore
  private _isValidatorRule: boolean = true;

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
  constructor(rule: IValidatorRuleParams | string) {
    if (isObject(rule)) {
      const r = rule as IValidatorRuleParams;
      Object.assign(this, r);
      if (isString(r.format) && RULE_LIBRARY[r.format as string]) {
        Object.assign(this, RULE_LIBRARY[r.format as string]);
      }
      this._recurse(r);
    } else if (isNonEmptyString(rule)) {
      this._fromLibrary(rule as string);
    }
    this.label = this.label ? this.label : this.name;
    if (!this.type && isRegExp(this.pattern)) {
      this.type = ValidatorType.string;
    }
    if (!this.isValid()) {
      throw new Error('Invalid validator rule');
    }
  }

  public isValid() {
    if (!this.type) {
      return false;
    }
    if (this.pattern && !isRegExp(this.pattern) && !isFunction(this.pattern)) {
      return false;
    }
    return true;
  }

  public getProperties(): Record<string, ValidatorRule> {
    if (isDict(this.properties)) {
      return this.properties;
    }
    return {} as Record<string, ValidatorRule>;
  }

  private _fromLibrary(sRule: string) {
    if (RULE_LIBRARY[sRule]) {
      // It's a pre-canned rule
      Object.assign(this, RULE_LIBRARY[sRule]);
    } else {
      const types = sRule.split('|');
      for (const type of types) {
        if (!this.validRules.includes(type)) {
          throw new Error(
            `Invalid type ${sRule} must be one of ${this.validRules.join(', ')}`
          );
        }
      }
    }
    return this;
  }

  /**
   * Expand 'properties', 'required' and 'optional' generic objects into the
   * 'properties' generic object as a hash of key = ValidatorRule object.
   * @param {Object} rule - Generic object potentially with 'properties',
   * 'required' and 'optional' dictionaries
   */
  private _recurse(rule: IValidatorRuleParams): this {
    const props: ValidatorRule[] = [];
    if (isObject(rule.properties)) {
      const p = rule.properties as { [key: string]: IValidatorRuleParams };
      Object.keys(p).forEach(key => {
        const subRule = new ValidatorRule(p[key]);
        props.push(subRule);
      });
    }
    ['required', 'optional'].forEach((prop: string) => {
      if (isObject((rule as IValidatorRuleParamHack)[prop])) {
        Object.keys((rule as IValidatorRuleParamHack)[prop]).forEach(key => {
          const subRule = new ValidatorRule((rule as IValidatorRuleParamHack)[prop][key]);
          (subRule as IValidatorRuleParamHack)[prop] = true;
          props.push(subRule);
        });
      }
    });
    return this;
  }
}
