import { ValidatorRuleParams } from './validator-rule';
import { ValidatorError } from './validator-error';
import { Dict } from 'epdoc-util';
import { ValidatorItem } from './validator-item';

export type ValueCallback = (val: any) => any;

export interface IValidator {
  _itemValidator?: ValidatorItem;
  input(val: any): this;
  validate(rule: ValidatorRuleParams | ValidatorRuleParams[]): this;
}

export class ValidatorBase {
  protected _parent?: ValidatorBase;
  protected _result?: any;
  protected _errors: ValidatorError[] = [];

  constructor(parent?: ValidatorBase) {
    this._parent = parent;
  }

  public clear() {
    this._errors = [];
    this._result = undefined;
    return this;
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

  public hasErrors(): boolean {
    return this._errors.length ? true : false;
  }

  public addError(err: ValidatorError): this {
    this._errors.push(err);
    return this;
  }

  public addErrors(errs: ValidatorError[]): this {
    this._errors = this._errors.concat(errs);
    return this;
  }

  public validate(rule: Dict): this {
    throw new Error('Implemented by subclass');
  }
}
