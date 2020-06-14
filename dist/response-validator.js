"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator_base_1 = require("./validator-base");
const validator_item_response_1 = require("./validator-item-response");
const validator_rule_1 = require("./validator-rule");
class ResponseValidator extends validator_base_1.ValidatorBase {
    constructor() {
        super();
    }
    input(response) {
        this._itemValidator = new validator_item_response_1.ValidatorItemResponse(response, this);
        return this;
    }
    validate(rule) {
        if (Array.isArray(rule)) {
            throw new Error('ResponseValidator validate method can only be called with a single rule');
        }
        const validatorRule = new validator_rule_1.ValidatorRule(rule, this._externalLibrary);
        const itemValidator = this._itemValidator;
        itemValidator.validate(validatorRule);
        this.output = itemValidator.output;
        if (itemValidator.hasErrors()) {
            this.addErrors(itemValidator.errors);
        }
        return this;
    }
}
exports.ResponseValidator = ResponseValidator;
//# sourceMappingURL=response-validator.js.map