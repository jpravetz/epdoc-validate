import { ValidatorBase, IValidator } from './validator-base';
import { ValidatorRuleParams } from './validator-rule';
import { ValidatorItem } from './validator-item';
export declare class ResponseValidator extends ValidatorBase implements IValidator {
    _itemValidator?: ValidatorItem;
    protected _result: any;
    constructor();
    input(response: any): this;
    validate(rule: ValidatorRuleParams | ValidatorRuleParams[]): this;
}
