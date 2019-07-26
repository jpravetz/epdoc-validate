import { ValidatorItem } from './validator-item';
import { ValidatorBase } from './validator-base';
import { GenericObject } from './lib/util';
import { ResponseValidator } from './response-validator';
import { Validator } from './validator';

export class ValidatorItemResponse extends ValidatorItem {
  protected _changes: GenericObject;

  constructor(value: any, parent?: Validator) {
    super(value, parent);
  }
}
