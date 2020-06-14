"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ValidatorErrorType;
(function (ValidatorErrorType) {
    ValidatorErrorType["invalid"] = "invalid";
    ValidatorErrorType["missing"] = "missing";
    ValidatorErrorType["missingOrInvalid"] = "missing or invalid";
    ValidatorErrorType["notAllowed"] = "notAllowed";
    ValidatorErrorType["min"] = "min";
    ValidatorErrorType["lenMin"] = "lenMin";
    ValidatorErrorType["max"] = "max";
    ValidatorErrorType["lenMax"] = "lenMax";
    ValidatorErrorType["dateMin"] = "dateMin";
    ValidatorErrorType["dateMax"] = "dateMax";
})(ValidatorErrorType = exports.ValidatorErrorType || (exports.ValidatorErrorType = {}));
class ValidatorBase {
    constructor(parent) {
        this._errors = [];
        this._externalLibrary = {};
        this._parent = parent;
    }
    clear() {
        this._errors = [];
        this._result = undefined;
        return this;
    }
    get parent() {
        return this._parent;
    }
    get output() {
        return this._result;
    }
    set output(val) {
        this._result = val;
    }
    get errors() {
        return this._errors;
    }
    hasErrors() {
        return this._errors.length ? true : false;
    }
    addErrorItem(err) {
        this._errors.push(err);
        return this;
    }
    addErrors(errs) {
        this._errors = this._errors.concat(errs);
        return this;
    }
    validate(rule) {
        throw new Error('Implemented by subclass');
    }
    addRuleLibrary(library) {
        this._externalLibrary = Object.assign(this._externalLibrary, library);
        return this;
    }
}
exports.ValidatorBase = ValidatorBase;
//# sourceMappingURL=validator-base.js.map