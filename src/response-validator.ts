import { ValidatorItemResponse } from './validator-item-response';
import { Validator } from './validator';
import { ValidatorRule } from './validator-rule';
import { ValidatorItem } from './validator-item';

export class ResponseValidator extends Validator {
  protected _result: any;

  constructor() {
    super();
  }

  public input(response: any): this {
    this._itemValidator = new ValidatorItemResponse(response, this);
    return this;
  }

  public validate(rule: ValidatorRule): this {
    const itemValidator = this._itemValidator as ValidatorItem;
    itemValidator.validate(rule);
    this.output = itemValidator.output;
    if (itemValidator.hasErrors()) {
      this.addErrors(itemValidator.errors);
    }
    return this;
  }
}
