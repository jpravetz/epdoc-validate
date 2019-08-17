"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator_item_1 = require("./validator-item");
const epdoc_util_1 = require("epdoc-util");
function asString(val) {
    if (epdoc_util_1.isString(val)) {
        if (val.length > 0) {
            return val.trim();
        }
        return val;
    }
    if (!epdoc_util_1.hasValue(val)) {
        return '';
    }
    if (epdoc_util_1.isDate(val)) {
        return val.toISOString();
    }
    if (epdoc_util_1.isObject(val) || epdoc_util_1.isArray(val)) {
        throw new Error('InputValidator does not permit complex values');
    }
    return String(val);
}
class ValidatorItemInput extends validator_item_1.ValidatorItem {
    constructor(value, fnFromData) {
        if (epdoc_util_1.isFunction(fnFromData)) {
            value = fnFromData(value);
        }
        else if (fnFromData === undefined) {
            value = asString(value);
        }
        super(value);
    }
    hasValue() {
        return this._value && this._value.length > 0;
    }
}
exports.ValidatorItemInput = ValidatorItemInput;
//# sourceMappingURL=validator-item-input.js.map