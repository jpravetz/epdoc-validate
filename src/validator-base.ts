import { ValidatorError } from "./validator-error";

export class ValidatorBase {

  protected _parent: ValidatorBase;
  protected _errors: ValidatorError[] = [];
  protected _result: any = undefined;

  constructor(parent?: ValidatorBase) {
    this._parent = parent;
  }

  clear() {
    this._errors = [];
    this._result = undefined;
    return this;
  }

  get changes() {
    return undefined;
  }

  get ref() {
    return undefined;
  }

  get parent() {
    return this._parent;
  }

  get output() {
    return this._result;
  }

  set output(val: any) {
    this._result = val;
  }

  get errors() {
    return this._errors;
  }

  hasErrors(): boolean {
    return this._errors.length ? true : false;
  }

  addError(err): this {
    throw new Error(`Errors array not defined for ${this.constructor.name}`);
    return this;
  }

  addErrors(errs: ValidatorError[]): this {
    throw new Error(`Errors array not defined for ${this.constructor.name}`);
    return this;
  }
}