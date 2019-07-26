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

  /**
   * Called only if the value is valid
   */
  validationApply() {
    if (this._parent) {
      this._parent.addErrors(this._errors);
      this._parent.output = this.output;
    }
    return this;
  }
}
