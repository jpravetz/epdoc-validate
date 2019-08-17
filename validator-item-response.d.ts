import { ValidatorBase } from './validator-base';
import { ValidatorItem } from './validator-item';
import { Dict } from 'epdoc-util';
export declare class ValidatorItemResponse extends ValidatorItem {
    protected _changes?: Dict;
    constructor(value: any, parent?: ValidatorBase);
}
