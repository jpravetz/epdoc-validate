import { ValidatorBase, IValidator, ValueCallback } from './validator-base';
import { ValidatorRuleParams } from './validator-rule';
import { ValidatorItem } from './validator-item';
import { Dict } from 'epdoc-util';
export declare class InputValidator extends ValidatorBase implements IValidator {
    _itemValidator?: ValidatorItem;
    protected _changes: Dict;
    protected _refDoc?: Dict;
    protected _name?: string;
    constructor(changes?: Dict);
    clear(): this;
    name(name: string): this;
    reference(ref: Dict | undefined): this;
    readonly ref: Dict | undefined;
    readonly changes: Dict;
    input(val: any, fnFromData?: ValueCallback): this;
    validate(rule: ValidatorRuleParams | ValidatorRuleParams[]): this;
    private applyChainVariables;
}
