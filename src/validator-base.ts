import { Dict } from 'epdoc-util';
import { ValidatorItem } from './validator-item';
import { IValidatorRuleParams, ValidatorRuleLibrary } from './validator-rule';

export type ValueCallback = (val: any) => any;

export interface IValidator {
  _itemValidator?: ValidatorItem;
  input(val: any): this;
  validate(rule: IValidatorRuleParams | IValidatorRuleParams[]): this;
}

export enum ValidatorErrorType {
  invalid = 'invalid',
  missing = 'missing',
  missingOrInvalid = 'missing or invalid',
  notAllowed = 'notAllowed',
  min = 'min',
  lenMin = 'lenMin',
  max = 'max',
  lenMax = 'lenMax',
  dateMin = 'dateMin',
  dateMax = 'dateMax'
}

export interface IValidatorErrorItem {
  // Name of attribute that caused the error. This will be the name shown to the
  // user, so if translation or substitution needs to take place, it needs to be
  // done beforehand.
  key: string;
  // Type of error. Useful for translation lookup.
  type: ValidatorErrorType;
  // Params that can be passed to string translator
  params?: Dict;
}

export type ValidationErrorStringCallback = (
  key: string,
  type: ValidatorErrorType,
  params: Dict
) => string;

export class ValidatorBase {
  protected _parent?: ValidatorBase;
  protected _result?: any;
  protected _errors: IValidatorErrorItem[] = [];
  protected _externalLibrary: ValidatorRuleLibrary = {};

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

  public addErrorItem(err: IValidatorErrorItem): this {
    this._errors.push(err);
    return this;
  }

  public addErrors(errs: IValidatorErrorItem[]): this {
    this._errors = this._errors.concat(errs);
    return this;
  }

  public validate(rule: Dict): this {
    throw new Error('Implemented by subclass');
  }

  public addRuleLibrary(library: ValidatorRuleLibrary): this {
    this._externalLibrary = Object.assign(this._externalLibrary, library);
    return this;
  }
}
