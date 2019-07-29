import { IGenericObject, Callback, deepEquals } from './lib/util';
import { Validator } from './validator';
import { ValidatorItemInput } from './validator-item-input';
import { ValidatorRule, IValidatorRuleParams } from './validator-rule';
import { ValidatorItem } from './validator-item';

/**
 * Intended for the purpose of gathering values from UI, comparing them against
 * an existing document, then adding the changed value to a changes object. For
 * this reason, this should probably not be used for nested objects that need to
 * be compared.
 *
 * With InputValidator values are added and validated one at a time and, if they
 * are valid, they are added to changes. But if a reference doc is specified,
 * they are only added if there is a diff to the reference doc.
 */
export class InputValidator extends Validator {
  protected _changes: IGenericObject;
  protected _refDoc?: IGenericObject;
  protected _name?: string;
  protected _rule?: IValidatorRuleParams;

  constructor(changes: IGenericObject = {}) {
    super();
    this._changes = changes;
  }

  public clear() {
    this._changes = {};
    this._refDoc = undefined;
    this._name = undefined;
    return super.clear();
  }

  public name(name: string): this {
    if (!this._itemValidator) {
      this._name = name;
    } else {
      this._itemValidator.name(name);
    }
    return this;
  }

  /**
   * If a reference doc is set then the validate method will only set the value
   * on changes if it is different from the reference's value
   * @param {BaseModel} doc
   */
  public reference(ref: IGenericObject | undefined): this {
    this._refDoc = ref;
    return this;
  }

  get ref(): IGenericObject | undefined {
    return this._refDoc as IGenericObject;
  }

  get changes(): IGenericObject {
    return this._changes;
  }

  public input(val: any, fnFromData?: Callback): this {
    this._itemValidator = new ValidatorItemInput(val, fnFromData);
    this.applyChainVariables();
    this._itemValidator.changes = this._changes;
    this._itemValidator.refDoc = this._refDoc as IGenericObject;
    return this;
  }

  public validate(rule?: any): this {
    if (rule) {
      this._rule = rule;
    }
    this.applyChainVariables();

    const rules = Array.isArray(this._rule) ? this._rule : [this._rule];
    this._rule = undefined;
    let passed = false;
    for (let idx = 0; idx < rules.length && !passed; ++idx) {
      const validatorRule = new ValidatorRule(rules[idx]);
      (this._itemValidator as ValidatorItem).validate(validatorRule);
      if (!(this._itemValidator as ValidatorItem).hasErrors()) {
        passed = true;
      }
    }
    if (passed) {
      if (this._refDoc) {
        if (
          !deepEquals(
            (this._itemValidator as ValidatorItem).output,
            (this._refDoc as IGenericObject)[this._name as string]
          )
        ) {
          (this._changes as IGenericObject)[this._name as string] = (this
            ._itemValidator as ValidatorItem).output;
        }
      } else {
        const name: string = (this._itemValidator as ValidatorItem).getName();
        (this._changes as IGenericObject)[name] = (this
          ._itemValidator as ValidatorItem).output;
      }
    } else {
      this.addErrors((this._itemValidator as ValidatorItem).errors);
    }
    return this;
  }

  private applyChainVariables(): this {
    if (this._name) {
      (this._itemValidator as ValidatorItem).name(this._name as string);
      this._name = undefined;
    }
    return this;
  }
}
