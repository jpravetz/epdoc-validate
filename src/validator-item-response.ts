import { ValidatorBase } from './validator-base';
import { ValidatorItem } from './validator-item';
import { Dict } from 'epdoc-util';

export class ValidatorItemResponse extends ValidatorItem {
  protected _changes?: Dict;

  constructor(value: any, parent?: ValidatorBase) {
    super(value, parent);
  }
}
