import { Dict } from 'epdoc-util';

export class ValidatorError {
  public key: string;
  public type: string;

  /**
   *
   * @param key - name of attribute that caused the error
   * @param type - error type (eg. invalid, min, missing, max). This is NOT the
   * type of the property (eg. integer)
   * @param params - params to pass to translation string
   */
  constructor(key: string, type: string, params: Dict = {}) {
    this.key = key;
    this.type = type;
    Object.assign(this, params);
  }

  get message() {
    return this.toString();
  }

  // public toString() {
  //   const tr = 'validator.error.' + this.type;
  //   return new Translator(tr).params(this).trIfExists();
  // }
}
