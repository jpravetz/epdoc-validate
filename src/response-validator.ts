import { ValidatorItemResponse } from './validator-item-response';
import { Validator } from './validator';
import { GenericObject } from './lib/util';

export class ResponseValidator extends Validator {
  protected _result: any;

  constructor() {
    super();
  }

  input(response: any): this {
    this._itemValidator = new ValidatorItemResponse(response, this);
    return this;
  }

  validate(rule?: GenericObject): this {
    this._itemValidator.validate(rule);
    this.output = this._itemValidator.output;
    if (this._itemValidator.hasErrors()) {
      this.addErrors(this._itemValidator.errors);
    }
    return this;
  }
}
