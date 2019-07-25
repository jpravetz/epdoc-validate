import { GenericObject, Callback } from "./lib/util";
import { Validator } from "./validator";
import { ValidatorItemInput } from "./validator-item-input";

export class InputValidator extends Validator {

  protected _changes: GenericObject;
  protected _refDoc: GenericObject;
  protected _name: string = undefined;

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
    this._name = name;
    return this;
  }

  /**
  * If a reference doc is set then the validate method will only set the value on
  * changes if it is different from the reference's value
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
    this._itemValidator.changes = this._changes;
    this._itemValidator.refDoc = this._refDoc;
    return this;
  }

  validate(rule: GenericObject): this {
    this._itemValidator.validate(rule);
    if (this._itemValidator.hasErrors()) {
      this.addErrors(this._itemValidator.errors);
    } else {
      if (this._refDoc) {
        if (this._itemValidator.output() !== this._refDoc[this._name]) {
          this._changes[this._name] = this._itemValidator.output();
        }
      } else {
        this._changes[this._name] = this._itemValidator.output();
      }
    }
    return this;
  }

}
