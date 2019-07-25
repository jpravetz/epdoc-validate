import { ValidatorItem } from "./validator-item";
import { GenericObject, Callback, hasValue, isString } from "./lib/util";

export class ValidatorItemInput extends ValidatorItem {

  constructor(value: any, fnFromData?: Callback) {
    value = hasValue(value) ? value : '';
    if (isString(value)) {
      if (value.length > 0) {
        value = value.trim();
      }
    } else {
      value = String(value);
    }
    super(value);
  }


  hasValue(): boolean {
    return this._value && this._value.length > 0;
  }

}
