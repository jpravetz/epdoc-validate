import { GenericObject, Callback, deepEquals } from './lib/util';
import { Validator } from './validator';
import { ValidatorItemInput } from './validator-item-input';
import { ValidatorRule, ValidatorRuleParams } from './validator-rule';
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
  protected _changes: GenericObject;
  protected _refDoc?: GenericObject;
  protected _name?: string;
  protected _rule?: ValidatorRuleParams;

  constructor(changes: GenericObject = {}) {
    super();
    this._changes = changes;
  }

  clear() {
    this._changes = {};
    this._refDoc = undefined;
    this._name = undefined;
    return super.clear();
  }

  name(name: string): this {
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
  reference(ref: GenericObject | undefined): this {
    this._refDoc = ref;
    return this;
  }

  get ref(): GenericObject | undefined {
    return this._refDoc as GenericObject;
  }

  get changes(): GenericObject {
    return this._changes;
  }

  input(val: any, fnFromData?: Callback): this {
    this._itemValidator = new ValidatorItemInput(val, fnFromData);
    this.applyChainVariables();
    this._itemValidator.changes = this._changes;
    this._itemValidator.refDoc = this._refDoc;
    return this;
  }

  validate(rule?: any): this {
    if (rule) {
      this._rule = rule;
    }
    this.applyChainVariables();

    let rules = Array.isArray(this._rule) ? this._rule : [this._rule];
    this._rule = undefined;
    let passed = false;
    for (let idx = 0; idx < rules.length && !passed; ++idx) {
      let validatorRule = new ValidatorRule(rules[idx]);
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
            (this._refDoc as GenericObject)[this._name as string]
          )
        ) {
          (this._changes as GenericObject)[this._name as string] = (this
            ._itemValidator as ValidatorItem).output;
        }
      } else {
        let name: string = (this._itemValidator as ValidatorItem).getName();
        (this._changes as GenericObject)[name] = (this
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
