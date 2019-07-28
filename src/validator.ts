// import { LogManager } from 'aurelia-framework';
import { Translator } from './lib/translator';
import { ValidatorError } from './validator-error';
import { ValidatorItem } from './validator-item';
import { GenericObject } from './lib/util';
import { ValidatorBase } from './validator-base';

// let logger = LogManager.getLogger('validator');

export class Validator extends ValidatorBase {
  protected _errors: ValidatorError[] = [];
  protected _itemValidator: ValidatorItem | undefined = undefined;

  constructor(errors: ValidatorError[] = []) {
    super();
    this._errors = errors;
  }

  input(val: any): this {
    throw new Error('Implemented by subclass');
    return this;
  }

  validate(rule: any): this {
    throw new Error('Implemented by subclass');
    return this;
  }

  errorString(trParams: GenericObject = {}) {
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

  asError(trParams: GenericObject): Error {
    let msg = this.errorString(trParams);
    return new Error(msg);
  }

  newError(trParams: GenericObject): Error {
    return new Error(this.errorString(trParams));
  }
}
