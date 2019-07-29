import { ValidatorItem } from './validator-item';
import { Callback, hasValue, isString, isDate, isArray } from './lib/util';
import { isFunction, isObject } from 'util';

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
  if (isDate(val)) {
    return val.toISOString();
  }
  if (isObject(val) || isArray(val)) {
    throw new Error('InputValidator does not permit complex values');
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
      value = (fnFromData as Callback)(value);
    } else if (fnFromData === undefined) {
      value = asString(value);
    }
    super(value);
  }

  public hasValue(): boolean {
    return this._value && this._value.length > 0;
  }
}
