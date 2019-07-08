import { Translator } from './lib/translator';
import { GenericObject } from './lib/util';

export class ValidatorError {
  private _key: string;
  private _type: string;

  constructor(key: string, type: string, params: GenericObject = {}) {
    this._key = key;
    this._type = type;
    Object.assign(this, params);
  }

  get key() {
    return this._key;
  }

  get type() {
    return this._type;
  }

  get message() {
    return this.toString();
  }

  toString() {
    let tr = 'validator.error.' + this._type;
    return new Translator(tr).params(this).trIfExists();
  }
}
