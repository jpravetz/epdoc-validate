import { ValidatorItem } from './validator-item';
import { ValidatorBase } from './validator-base';
import { Dict } from 'epdoc-util';

export class ValidatorItemResponse extends ValidatorItem {
  protected _changes?: Dict;

  constructor(value: any, parent?: ValidatorBase) {
    super(value, parent);
  }
}
