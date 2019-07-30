import { ValidatorItem } from './validator-item';
import { ValidatorBase } from './validator-base';
import { IGenericObject } from '.';

export class ValidatorItemResponse extends ValidatorItem {
  protected _changes?: IGenericObject;

  constructor(value: any, parent?: ValidatorBase) {
    super(value, parent);
  }
}
