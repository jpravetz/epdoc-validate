import { deepEquals, Dict, isString } from 'epdoc-util';
import { IValidator, ValidatorBase, ValueCallback } from './validator-base';
import { ValidatorItem } from './validator-item';
import { ValidatorItemInput } from './validator-item-input';
import { IValidatorRuleParams, ValidatorRule } from './validator-rule';

/**
 * Intended for the purpose of gathering values from UI,  dcomparing them against
 * an existing document, then adding the changed value to a changes object. For
 * this reason, this should probably not be used for nested objects that need to
 * be compared.
 *
 * With InputValidator values are added and validated one at a time and, if they
 * are valid, they are added to changes. But if a reference doc is specified,
 * they are only added if there is a diff to the reference doc.
 */
export class InputValidator extends ValidatorBase implements IValidator {
  public _itemValidator?: ValidatorItem;
  protected _changes: Dict;
  protected _refDoc?: Dict;
  protected _name?: string;

  constructor(changes: Dict = {}) {
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
  public reference(ref: Dict | undefined): this {
    this._refDoc = ref;
    return this;
  }

  get ref(): Dict | undefined {
    return this._refDoc as Dict;
  }

  get changes(): Dict {
    return this._changes;
  }

  public input(val: any, fnFromData?: ValueCallback): this {
    this._itemValidator = new ValidatorItemInput(val, fnFromData);
    this.applyChainVariables();
    this._itemValidator.changes = this._changes;
    this._itemValidator.refDoc = this._refDoc as Dict;
    return this;
  }

  public validate(rule: IValidatorRuleParams | IValidatorRuleParams[]): this {
    this.applyChainVariables();

    const rules: IValidatorRuleParams[] = Array.isArray(rule) ? rule : [rule];
    let passed = false;
    for (let idx = 0; idx < rules.length && !passed; ++idx) {
      const validatorRule = new ValidatorRule(rules[idx], this._externalLibrary);
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
            (this._refDoc as Dict)[this._name as string]
          )
        ) {
          const name: string = isString(this._name)
            ? this._name
            : ((this._itemValidator as ValidatorItem).getName() as string);
          (this._changes as Dict)[name] = (this._itemValidator as ValidatorItem).output;
        }
      } else {
        const name: string = (this._itemValidator as ValidatorItem).getName() as string;
        (this._changes as Dict)[name] = (this._itemValidator as ValidatorItem).output;
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
