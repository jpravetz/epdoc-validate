import { ValidatorItem } from './validator-item';
import { GenericObject, Callback, hasValue, isString } from './lib/util';
import { isFunction } from 'util';

function asString(val: any): string {
  if (isString(val)) {
    if (val.length > 0) {
      return val.trim();
    }
    return val;
  }
  if (!hasValue(val)) {
    return '';
  }
  return String(val);
}

export class ValidatorItemInput extends ValidatorItem {
  /**
   * Will by default cast value to a string and trim leading and trailing
   * whitespace. This is done because input is assumed to have originated from
   * UI that provides the result as a string.
   * @param value - The value to be validated
   * @param fnFromData - If set to null then does not cast value to a string. If
   * a function then calls the function with value.
   */
  constructor(value: any, fnFromData?: Callback) {
    if (isFunction(fnFromData)) {
      value = fnFromData(value);
    } else if (fnFromData === undefined) {
      value = asString(value);
    }
    super(value);
  }

  hasValue(): boolean {
    return this._value && this._value.length > 0;
  }
}
