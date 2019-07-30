import { InputValidator } from './input-validator';
import { ResponseValidator } from './response-validator';
import { ValidatorRule } from './validator-rule';

export = Validator;

declare class Validator {
  public input(changes: Validator.IGenericObject): InputValidator;

  public response(): ResponseValidator;
}

declare namespace Validator {
  export interface IGenericObject {
    [key: string]: any;
  }
  export type ValidatorCallback = (val: any, rule: ValidatorRule) => any;
  export type ValueCallback = (val: any) => any;
  export interface IValidatorRuleProperties {
    [key: string]: IValidatorRuleParams;
  }
  export interface IValidatorRuleParams {
    name?: string;
    label?: string;
    type: string;
    format?: string;
    readonly pattern?: RegExp | ValidatorCallback;
    readonly default?: any;
    readonly min?: number;
    readonly max?: number;
    readonly sanitize?: boolean | string | ValidatorCallback;
    required?: boolean | IValidatorRuleProperties;
    optional?: boolean | IValidatorRuleProperties;
    strict?: boolean;
    properties?: IValidatorRuleProperties;
    arrayType?: string; // if an array, the entries must be of this type
    appendToArray?: boolean; // for arrays
    fromView?: ValueCallback; // hook to allow value to be manipulated, eg converting 0/1 to false/true XXX use sanitize instead
  }
}
