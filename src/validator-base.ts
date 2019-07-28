import { ValidatorError } from './validator-error';
import { GenericObject } from './lib/util';

export class ValidatorBase {
  protected _parent?: ValidatorBase;
  protected _result?: any;
  protected _errors: ValidatorError[] = [];

  constructor(parent?: ValidatorBase) {
    this._parent = parent;
  }

  clear() {
    this._errors = [];
    this._result = undefined;
    return this;
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

  addError(err: ValidatorError): this {
    this._errors.push(err);
    return this;
  }

  addErrors(errs: ValidatorError[]): this {
    this._errors = this._errors.concat(errs);
    return this;
  }

  validate(rule?: GenericObject): this {
    throw new Error('Implemented by subclass');
  }
}
