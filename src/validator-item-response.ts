import { ValidatorItem } from './validator-item';
import { IGenericObject } from './lib/util';
import { Validator } from './validator';

export class ValidatorItemResponse extends ValidatorItem {
  protected _changes?: IGenericObject;

  constructor(value: any, parent?: Validator) {
    super(value, parent);
  }
}
