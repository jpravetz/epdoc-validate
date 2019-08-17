import { ValueCallback } from './validator-base';
import { ValidatorItem } from './validator-item';
export declare class ValidatorItemInput extends ValidatorItem {
    constructor(value: any, fnFromData?: ValueCallback);
    hasValue(): boolean;
}
