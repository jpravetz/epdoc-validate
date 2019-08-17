"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ValidatorBase {
    constructor(parent) {
        this._errors = [];
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
    addError(err) {
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
}
exports.ValidatorBase = ValidatorBase;
//# sourceMappingURL=validator-base.js.map