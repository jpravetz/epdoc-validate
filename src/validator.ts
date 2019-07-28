// import { LogManager } from 'aurelia-framework';
import { Translator } from './lib/translator';
import { ValidatorError } from './validator-error';
import { ValidatorItem } from './validator-item';
import { IGenericObject } from './lib/util';
import { ValidatorBase } from './validator-base';

// let logger = LogManager.getLogger('validator');

export class Validator extends ValidatorBase {
  protected _errors: ValidatorError[] = [];
  protected _itemValidator?: ValidatorItem;

  constructor(errors: ValidatorError[] = []) {
    super();
    this._errors = errors;
  }

  public input(val: any): this {
    throw new Error('Implemented by subclass');
    return this;
  }

  public validate(rule: any): this {
    throw new Error('Implemented by subclass');
    return this;
  }

  public errorString(trParams: IGenericObject = {}) {
    if (this.hasErrors) {
      // logger.debug('errorString', this._errors);
      trParams.msg = this._errors
        .map(err => {
          return err.toString();
        })
        .join(', ');
      let tr = 'validator.badData';
      return new Translator(tr).params(trParams).tr();
    }
  }

  public asError(trParams: IGenericObject): Error {
    let msg = this.errorString(trParams);
    return new Error(msg);
  }

  public newError(trParams: IGenericObject): Error {
    return new Error(this.errorString(trParams));
  }
}
