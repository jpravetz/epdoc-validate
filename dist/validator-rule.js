"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const epdoc_util_1 = require("epdoc-util");
const FORMAT_LIBRARY = {
    email: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-zA-Z0-9-]*[a-zA-Z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/,
    dimension: /^\d[1,4]$/,
    filename: /^[^\/]+$/,
    password: /^.{6,}$/,
    globalPerm: /^(none|globalView|globalAdmin)$/
};
const RULE_LIBRARY = {
    url: { type: 'string', pattern: /^https?:\/\// },
    email: {
        type: 'string',
        pattern: FORMAT_LIBRARY.email,
        sanitize: (v) => {
            return String(v);
        }
    },
    dimension: { type: 'string', pattern: FORMAT_LIBRARY.dimension },
    aspect: { type: 'string', pattern: /^\d+:\d+$/ },
    title: { type: 'string', pattern: /^.+$/ },
    filename: { type: 'string', pattern: FORMAT_LIBRARY.filename },
    fullname: { type: 'string', pattern: /^.+$/ },
    company: { type: 'string', pattern: /^.+$/ },
    subject: { type: 'string', pattern: /^.+$/ },
    description: { type: 'string', pattern: /^.+$/ },
    password: { type: 'string', pattern: FORMAT_LIBRARY.password },
    label: { type: 'string', pattern: /^[a-zA-Z\-\.\s]+$/ },
    username: { type: 'string', pattern: /^[a-z0-9]{2,}$/ },
    interaction: { type: 'string', pattern: /^(none|url|clickplay)$/ },
    globalPerm: { type: 'string', pattern: FORMAT_LIBRARY.globalPerm },
    streamStatus: { type: 'string', pattern: /^(upcoming|live|completed)$/ },
    usertoken: { type: 'string', pattern: /^.*$/ },
    externalId: { type: 'string', pattern: /^.*$/ },
    posInt: { type: 'string', pattern: /^\d+$/, sanitize: 'integer' },
    posIntAsString: { type: 'string', pattern: /^\d+$/, sanitize: 'string' },
    signedInt: { type: 'string', pattern: /^(\+|-)?\d+$/, sanitize: 'integer' }
};
class ValidatorRule {
    constructor(rule) {
        this.type = 'string';
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