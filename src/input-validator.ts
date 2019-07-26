import { GenericObject, Callback, deepEquals } from './lib/util';
import { Validator } from './validator';
import { ValidatorItemInput } from './validator-item-input';
import { isString } from 'util';
import { ValidatorRule } from './validator-rule';

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
  protected _refDoc: GenericObject;
  protected _name: string = undefined;
  protected _rule: any = undefined;

  constructor(changes: GenericObject = {}) {
    super();
    this._changes = changes;
  }

  clear() {
    this._changes = {};
    this._refDoc = undefined;
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

  rule(rule: any): this {
    if (!this._itemValidator) {
      this._rule = rule;
    } else {
      this._itemValidator.rule(rule);
    }
    return this;
  }

  /**
   * If a reference doc is set then the validate method will only set the value
   * on changes if it is different from the reference's value
   * @param {BaseModel} doc
   */
  reference(ref: GenericObject) {
    this._refDoc = ref;
    return this;
  }

  get ref() {
    return this._refDoc;
  }

  get changes() {
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
      this._itemValidator.validate(validatorRule);
      if (!this._itemValidator.hasErrors()) {
        passed = true;
      }
    }
    if (passed) {
      if (this._refDoc) {
        if (!deepEquals(this._itemValidator.output(), this._refDoc[this._name])) {
          this._changes[this._name] = this._itemValidator.output;
        }
      } else {
        let name = this._itemValidator.getName();
        this._changes[name] = this._itemValidator.output;
      }
    } else {
      this.addErrors(this._itemValidator.errors);
    }
    return this;
  }

  private applyChainVariables(): this {
    if (this._name) {
      this._itemValidator.name(this._name);
      this._name = undefined;
    }
    return this;
  }
}
