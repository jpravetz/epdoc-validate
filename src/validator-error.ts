import { Translator } from './lib/translator';
import { GenericObject } from './lib/util';

export class ValidatorError {
  public key: string;
  public type: string;

  constructor(key: string, type: string, params: GenericObject = {}) {
    this.key = key;
    this.type = type;
    Object.assign(this, params);
  }

  get message() {
    return this.toString();
  }

  toString() {
    let tr = 'validator.error.' + this.type;
    return new Translator(tr).params(this).trIfExists();
  }
}
