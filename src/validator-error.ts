import { Dict } from 'epdoc-util';

/**
 * Validator Error object, containing details regarding an error, but which is
 * not a subclass of Error. One or more ValidatorError objects can be combined
 * to create an Error.
 */
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

}
