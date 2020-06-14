"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const epdoc_util_1 = require("epdoc-util");
var ValidatorType;
(function (ValidatorType) {
    ValidatorType["string"] = "string";
    ValidatorType["number"] = "number";
    ValidatorType["boolean"] = "boolean";
    ValidatorType["null"] = "null";
    ValidatorType["object"] = "object";
    ValidatorType["array"] = "array";
    ValidatorType["date"] = "date";
    ValidatorType["any"] = "any";
    ValidatorType["integer"] = "integer";
})(ValidatorType = exports.ValidatorType || (exports.ValidatorType = {}));
const FORMAT_LIBRARY = {
    email: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/
};
const RULE_LIBRARY = {
    url: { type: ValidatorType.string, pattern: /^https?:\/\// },
    email: {
        type: ValidatorType.string,
        pattern: FORMAT_LIBRARY.email,
        sanitize: (v) => {
            return String(v);
        }
    },
    posInt: { type: ValidatorType.string, pattern: /^\d+$/, sanitize: 'integer' },
    posIntAsString: { type: ValidatorType.string, pattern: /^\d+$/, sanitize: 'string' },
    signedInt: { type: ValidatorType.string, pattern: /^(\+|-)?\d+$/, sanitize: 'integer' }
};
class ValidatorRule {
    constructor(rule, externalLibrary = {}) {
        this.type = ValidatorType.string;
        this.validRules = [
            'string',
            'number',
            'boolean',
            'null',
            'object',
            'array',
            'date',
            'any',
            'integer'
        ];
        this._isValidatorRule = true;
        if (epdoc_util_1.isObject(rule)) {
            const r = rule;
            Object.assign(this, r);
            if (epdoc_util_1.isString(r.format)) {
                this._fromLibrary(r.format, externalLibrary);
            }
            this._recurse(r);
        }
        else if (epdoc_util_1.isNonEmptyString(rule)) {
            this._fromLibrary(rule, externalLibrary);
        }
        this.label = this.label ? this.label : this.name;
        if (!this.type && epdoc_util_1.isRegExp(this.pattern)) {
            this.type = ValidatorType.string;
        }
        if (!this.isValid()) {
            throw new Error('Invalid validator rule');
        }
    }
    static isInstance(val) {
        return val && epdoc_util_1.isDict(val) && val._isValidatorRule;
    }
    isValid() {
        if (!this.type) {
            return false;
        }
        if (this.pattern && !epdoc_util_1.isRegExp(this.pattern) && !epdoc_util_1.isFunction(this.pattern)) {
            return false;
        }
        return true;
    }
    getProperties() {
        if (epdoc_util_1.isDict(this.properties)) {
            return this.properties;
        }
        return {};
    }
    _fromLibrary(sRule, externalLibrary) {
        if (externalLibrary[sRule]) {
            Object.assign(this, externalLibrary[sRule]);
        }
        else if (RULE_LIBRARY[sRule]) {
            Object.assign(this, RULE_LIBRARY[sRule]);
        }
        else {
            const types = sRule.split('|');
            for (const type of types) {
                if (!this.validRules.includes(type)) {
                    throw new Error(`Invalid type ${sRule} must be one of ${this.validRules.join(', ')}`);
                }
            }
        }
        return this;
    }
    _recurse(rule) {
        const props = [];
        if (epdoc_util_1.isObject(rule.properties)) {
            const p = rule.properties;
            Object.keys(p).forEach(key => {
                const subRule = new ValidatorRule(p[key]);
                props.push(subRule);
            });
        }
        ['required', 'optional'].forEach((prop) => {
            if (epdoc_util_1.isObject(rule[prop])) {
                Object.keys(rule[prop]).forEach(key => {
                    const subRule = new ValidatorRule(rule[prop][key]);
                    subRule[prop] = true;
                    props.push(subRule);
                });
            }
        });
        return this;
    }
}
exports.ValidatorRule = ValidatorRule;
//# sourceMappingURL=validator-rule.js.map