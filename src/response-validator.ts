import { ValidatorItemResponse } from './validator-item-response';
import { ValidatorBase, IValidator } from './validator-base';
import { IValidatorRuleParams, ValidatorRule } from './validator-rule';
import { ValidatorItem } from './validator-item';

export class ResponseValidator extends ValidatorBase implements IValidator {
  _itemValidator?: ValidatorItem;
  protected _result: any;

  constructor() {
    super();
  }

  public input(response: any): this {
    this._itemValidator = new ValidatorItemResponse(response, this);
    return this;
  }

  public validate(rule: IValidatorRuleParams | IValidatorRuleParams[]): this {
    if (Array.isArray(rule)) {
      throw new Error(
        'ResponseValidator validate method can only be called with a single rule'
      );
    }
    const validatorRule = new ValidatorRule(rule);
    const itemValidator = this._itemValidator as ValidatorItem;
    itemValidator.validate(validatorRule);
    this.output = itemValidator.output;
    if (itemValidator.hasErrors()) {
      this.addErrors(itemValidator.errors);
    }
    return this;
  }
}
