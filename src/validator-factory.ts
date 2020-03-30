import { Dict } from 'epdoc-util';
import { InputValidator } from './input-validator';
import { ResponseValidator } from './response-validator';

export class ValidatorFactory {
  /**
   * For validating input fields, one at a time
   * @param changes - where results are to be written
   */
  public static input(changes: Dict = {}): InputValidator {
    return new InputValidator(changes);
  }

  /**
   * For validating a reponse or general object
   */
  public static response(): ResponseValidator {
    return new ResponseValidator();
  }
}
