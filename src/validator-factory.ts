import { Dict } from 'epdoc-util';
import { InputValidator } from './input-validator';
import { ResponseValidator } from './response-validator';

export class ValidatorFactory {
  constructor() {}

  /**
   * For validating input fields, one at a time
   * @param changes - where results are to be written
   */
  static input(changes: Dict = {}): InputValidator {
    return new InputValidator(changes);
  }

  /**
   * For validating a reponse or general object
   */
  static response(): ResponseValidator {
    return new ResponseValidator();
  }
}
