import { ValidatorError } from './validator-error';
import { ValidatorItem } from './validator-item';
import { ValidatorAllBase } from './validator-all-base';
import { IValidatorRuleParams } from './declarations';

export class ValidatorBase extends ValidatorAllBase {
  protected _itemValidator?: ValidatorItem;

  constructor(errors: ValidatorError[] = []) {
    super();
    this._errors = errors;
  }

  public input(val: any): this {
    throw new Error('Implemented by subclass');
    return this;
  }

  public validate(rule: IValidatorRuleParams | IValidatorRuleParams[]): this {
    throw new Error('Implemented by subclass');
    return this;
  }
}
