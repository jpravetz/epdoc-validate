import { ValueCallback } from './validator-base';
import { Dict } from 'epdoc-util';
export declare type ValidatorCallback = (val: any, rule: ValidatorRule) => any;
export interface ValidatorRuleProps {
    [key: string]: ValidatorRuleParams;
}
export declare type ValidatorRuleParams = {
    name?: string;
    label?: string;
    type: string;
    format?: string;
    readonly pattern?: RegExp | ValidatorCallback;
    readonly default?: any;
    readonly min?: number;
    readonly max?: number;
    readonly sanitize?: boolean | string | ValidatorCallback;
    required?: boolean | ValidatorRuleProps;
    optional?: boolean | ValidatorRuleProps;
    strict?: boolean;
    properties?: ValidatorRuleProps;
    arrayType?: string;
    appendToArray?: boolean;
    fromView?: ValueCallback;
};
export declare class ValidatorRule {
    name?: string;
    label?: string;
    type: string;
    pattern?: any;
    default?: any;
    min?: number;
    max?: number;
    sanitize?: any;
    required?: boolean;
    optional?: boolean;
    strict?: boolean;
    properties?: Dict;
    arrayType?: any;
    appendToArray?: boolean;
    fromView?: ValueCallback;
    readonly validRules: string[];
    constructor(rule: ValidatorRuleParams | string);
    isValid(): boolean;
    private _fromLibrary;
    private _recurse;
}
