"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator_base_1 = require("./validator-base");
const validator_item_input_1 = require("./validator-item-input");
const validator_rule_1 = require("./validator-rule");
const epdoc_util_1 = require("epdoc-util");
class InputValidator extends validator_base_1.ValidatorBase {
    constructor(changes = {}) {
        super();
        this._changes = changes;
    }
    clear() {
        this._changes = {};
        this._refDoc = undefined;
        this._name = undefined;
        return super.clear();
    }
    name(name) {
        if (!this._itemValidator) {
            this._name = name;
        }
        else {
            this._itemValidator.name(name);
        }
        return this;
    }
    reference(ref) {
        this._refDoc = ref;
        return this;
    }
    get ref() {
        return this._refDoc;
    }
    get changes() {
        return this._changes;
    }
    input(val, fnFromData) {
        this._itemValidator = new validator_item_input_1.ValidatorItemInput(val, fnFromData);
        this.applyChainVariables();
        this._itemValidator.changes = this._changes;
        this._itemValidator.refDoc = this._refDoc;
        return this;
    }
    validate(rule) {
        this.applyChainVariables();
        const rules = Array.isArray(rule) ? rule : [rule];
        let passed = false;
        for (let idx = 0; idx < rules.length && !passed; ++idx) {
            const validatorRule = new validator_rule_1.ValidatorRule(rules[idx]);
            this._itemValidator.validate(validatorRule);
            if (!this._itemValidator.hasErrors()) {
                passed = true;
            }
        }
        if (passed) {
            if (this._refDoc) {
                if (!epdoc_util_1.deepEquals(this._itemValidator.output, this._refDoc[this._name])) {
                    const name = epdoc_util_1.isString(this._name)
                        ? this._name
                        : this._itemValidator.getName();
                    this._changes[name] = this._itemValidator.output;
                }
            }
            else {
                const name = this._itemValidator.getName();
                this._changes[name] = this._itemValidator.output;
            }
        }
        else {
            this.addErrors(this._itemValidator.errors);
        }
        return this;
    }
    applyChainVariables() {
        if (this._name) {
            this._itemValidator.name(this._name);
            this._name = undefined;
        }
        return this;
    }
}
exports.InputValidator = InputValidator;
//# sourceMappingURL=input-validator.js.map