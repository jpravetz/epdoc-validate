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
    email: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
    dimension: /^\d[1,4]$/,
    filename: /^[^\/]+$/,
    password: /^.{6,}$/,
    globalPerm: /^(none|globalView|globalAdmin)$/
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
    dimension: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.dimension },
    aspect: { type: ValidatorType.string, pattern: /^\d+:\d+$/ },
    title: { type: ValidatorType.string, pattern: /^.+$/ },
    filename: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.filename },
    fullname: { type: ValidatorType.string, pattern: /^.+$/ },
    company: { type: ValidatorType.string, pattern: /^.+$/ },
    subject: { type: ValidatorType.string, pattern: /^.+$/ },
    description: { type: ValidatorType.string, pattern: /^.+$/ },
    password: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.password },
    label: { type: ValidatorType.string, pattern: /^[a-zA-Z\-\.\s]+$/ },
    username: { type: ValidatorType.string, pattern: /^[a-z0-9]{2,}$/ },
    interaction: { type: ValidatorType.string, pattern: /^(none|url|clickplay)$/ },
    globalPerm: { type: ValidatorType.string, pattern: FORMAT_LIBRARY.globalPerm },
    streamStatus: { type: ValidatorType.string, pattern: /^(upcoming|live|completed)$/ },
    usertoken: { type: ValidatorType.string, pattern: /^.*$/ },
    externalId: { type: ValidatorType.string, pattern: /^.*$/ },
    posInt: { type: ValidatorType.string, pattern: /^\d+$/, sanitize: 'integer' },
    posIntAsString: { type: ValidatorType.string, pattern: /^\d+$/, sanitize: 'string' },
    signedInt: { type: ValidatorType.string, pattern: /^(\+|-)?\d+$/, sanitize: 'integer' }
};
class ValidatorRule {
    constructor(rule) {
        this._isValidatorRule = true;
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
        if (epdoc_util_1.isObject(rule)) {
            const r = rule;
            Object.assign(this, r);
            if (epdoc_util_1.isString(r.format) && RULE_LIBRARY[r.format]) {
                Object.assign(this, RULE_LIBRARY[r.format]);
            }
            this._recurse(r);
        }
        else if (epdoc_util_1.isNonEmptyString(rule)) {
            this._fromLibrary(rule);
        }
        this.label = this.label ? this.label : this.name;
        if (!this.isValid()) {
            throw new Error('Invalid validator rule');
        }
    }
    static isInstance(val) {
        return val && epdoc_util_1.isDict(val) && val._isValidatorRule;
    }
    isValid() {
        return this.type ? true : false;
    }
    _fromLibrary(sRule) {
        if (RULE_LIBRARY[sRule]) {
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
    getProperties() {
        if (epdoc_util_1.isDict(this.properties)) {
            return this.properties;
        }
        return {};
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