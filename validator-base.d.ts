import { ValidatorRuleParams } from './validator-rule';
import { ValidatorError } from './validator-error';
import { Dict } from 'epdoc-util';
import { ValidatorItem } from './validator-item';
export declare type ValueCallback = (val: any) => any;
export interface IValidator {
    _itemValidator?: ValidatorItem;
    input(val: any): this;
    validate(rule: ValidatorRuleParams | ValidatorRuleParams[]): this;
}
export declare class ValidatorBase {
    protected _parent?: ValidatorBase;
    protected _result?: any;
    protected _errors: ValidatorError[];
    constructor(parent?: ValidatorBase);
    clear(): this;
    readonly parent: ValidatorBase | undefined;
    output: any;
    readonly errors: ValidatorError[];
    hasErrors(): boolean;
    addError(err: ValidatorError): this;
    addErrors(errs: ValidatorError[]): this;
    validate(rule: Dict): this;
}
