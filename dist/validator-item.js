"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validator_rule_1 = require("./validator-rule");
const validator_base_1 = require("./validator-base");
const epdoc_util_1 = require("epdoc-util");
const REGEX = {
    string: /^(string)$/,
    number: /^(int|integer|float|number)$/,
    boolean: /^boolean$/,
    object: /^(array|object|date)$/,
    integer: /^(int|integer)$/,
    isTrue: /^true$/i,
    isFalse: /^false$/i,
    isWholeNumber: /^[0-9]+$/
};
const APPLY_METHOD = {
    string: 'stringApply',
    boolean: 'booleanApply',
    int: 'numberApply',
    integer: 'numberApply',
    number: 'numberApply',
    date: 'dateApply',
    any: 'anyApply',
    null: 'nullApply',
    object: 'objectApply',
    array: 'arrayApply'
};
class ValidatorItem extends validator_base_1.ValidatorBase {
    constructor(value, parent) {
        super(parent);
        this._chain = [];
        this._value = value;
    }
    name(name) {
        this._name = name;
        return this;
    }
    getName() {
        return this._name;
    }
    chain(val) {
        this._chain = epdoc_util_1.isString(val) ? [val] : val;
        return this;
    }
    getChain() {
        if (this._name) {
            if (this._chain && this._chain.length) {
                return [...this._chain, this._name];
            }
            return [this._name];
        }
        return this._chain;
    }
    set label(val) {
        this._label = val;
    }
    get label() {
        if (this._label) {
            return this._label;
        }
        const result = this.getChain();
        return result ? result.join('.') : '?';
    }
    get errors() {
        return this._errors;
    }
    get value() {
        return this._value;
    }
    hasValue() {
        return epdoc_util_1.hasValue(this._value);
    }
    set changes(val) {
        this._changes = val;
    }
    set refDoc(val) {
        this._refDoc = val;
    }
    addError(type, params) {
        const err = { key: this.label, type, params };
        this._errors.push(err);
        return this;
    }
    validate(rule) {
        if (!this._name && rule.name) {
            this._name = rule.name;
        }
        if (!this._label && rule.label) {
            this._label = rule.label;
        }
        if (!this._label) {
            this._label = this._name;
        }
        return this.valueApply(rule);
    }
    isMissing(rule) {
        if (Array.isArray(rule.isMissing)) {
            for (let idx = 0; idx < rule.isMissing.length; ++idx) {
                if (this._value === rule.isMissing[idx]) {
                    return true;
                }
            }
        }
        else if (epdoc_util_1.isFunction(rule.isMissing)) {
            return rule.isMissing(this._value);
        }
        else if (epdoc_util_1.isBoolean(rule.isMissing)) {
            return rule.isMissing;
        }
        return this.hasValue() ? false : true;
    }
    setDefault(rule) {
        if (epdoc_util_1.isFunction(rule.default)) {
            const val = rule.default(rule);
            return this.setResult(val);
        }
        let def = rule.default;
        if (def === 'undefined') {
            def = undefined;
        }
        else if (def === null) {
            def = null;
        }
        return this.setResult(def);
    }
    setResult(val) {
        this._result = val;
        return this;
    }
    valueApply(rule) {
        if (this.isMissing(rule)) {
            if (epdoc_util_1.isDefined(rule.default)) {
                return this.setDefault(rule);
            }
            else if (rule.required) {
                return this.addError(validator_base_1.ValidatorErrorType.missing);
            }
            return this;
        }
        else if (rule.strict && !rule.optional && !rule.required) {
            return this.addError(validator_base_1.ValidatorErrorType.notAllowed);
        }
        const methodName = APPLY_METHOD[rule.type];
        if (!methodName || !epdoc_util_1.isFunction(this[methodName])) {
            throw new Error(`Invalid rule type '${rule.type}'`);
        }
        try {
            this[methodName](this._value, rule);
        }
        catch (err) {
            this._errors.push(err);
        }
        if (this._errors.length) {
            if (rule.default && !rule.strict) {
                this._result = rule.default;
                return this;
            }
        }
        return this;
    }
    nullApply(val, rule) {
        if (val === null) {
            return this.setResult(val);
        }
        if (epdoc_util_1.isFunction(rule.sanitize)) {
            return this.setResult(rule.sanitize(val, rule));
        }
        if (rule.default === null) {
            return this.setResult(rule.default);
        }
        if (epdoc_util_1.isFunction(rule.default)) {
            return this.setResult(rule.default(val, rule));
        }
        if (rule.required) {
            return this.addError(validator_base_1.ValidatorErrorType.missingOrInvalid);
        }
        return this;
    }
    booleanApply(val, rule) {
        if (epdoc_util_1.isBoolean(val)) {
            return this.setResult(val);
        }
        if (epdoc_util_1.isFunction(rule.sanitize)) {
            return this.setResult(rule.sanitize(val, rule));
        }
        if (rule.sanitize === true || rule.sanitize === 'boolean') {
            if (epdoc_util_1.isNumber(val)) {
                return this.setResult(val > 0);
            }
            if (epdoc_util_1.isString(val)) {
                if (REGEX.isTrue.test(val)) {
                    return this.setResult(true);
                }
                if (REGEX.isFalse.test(val)) {
                    return this.setResult(false);
                }
                if (REGEX.isWholeNumber.test(val)) {
                    return this.setResult(parseInt(val, 10) > 0);
                }
            }
        }
        if (epdoc_util_1.isBoolean(rule.default)) {
            return this.setResult(rule.default);
        }
        if (epdoc_util_1.isFunction(rule.default)) {
            return this.setResult(rule.default(val, rule));
        }
        if (rule.required && val) {
            return this.addError(validator_base_1.ValidatorErrorType.missing);
        }
        return this.addError(validator_base_1.ValidatorErrorType.invalid);
    }
    stringApply(val, rule) {
        if (epdoc_util_1.isFunction(rule.sanitize)) {
            val = rule.sanitize(val, rule);
        }
        else if (!epdoc_util_1.isString(val) && (rule.sanitize === true || rule.sanitize === 'string')) {
            val = String(val);
        }
        if (epdoc_util_1.isString(val)) {
            return this.applyStringLengthTests(val, rule);
        }
        if (rule.required) {
            return this.addError(validator_base_1.ValidatorErrorType.missing);
        }
        return this;
    }
    applyStringLengthTests(val, rule) {
        if (epdoc_util_1.isRegExp(rule.pattern)) {
            if (!rule.pattern.test(val)) {
                return this.addError(validator_base_1.ValidatorErrorType.invalid);
            }
        }
        if (epdoc_util_1.isFunction(rule.pattern)) {
            if (!rule.pattern(val, rule)) {
                return this.addError(validator_base_1.ValidatorErrorType.invalid);
            }
        }
        if (epdoc_util_1.isNumber(rule.min) && val.length < rule.min) {
            if (epdoc_util_1.isString(rule.default)) {
                return this.setResult(rule.default);
            }
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule, 'min'));
            }
            return this.addError(validator_base_1.ValidatorErrorType.lenMin, { min: rule.min });
        }
        if (epdoc_util_1.isNumber(rule.max) && val.length > rule.max) {
            if (epdoc_util_1.isDefined(rule.default)) {
                return this.setDefault(rule);
            }
            return this.addError(validator_base_1.ValidatorErrorType.lenMax, { max: rule.max });
        }
        return this.setResult(val);
    }
    numberApply(val, rule) {
        const isInt = REGEX.integer.test(rule.type);
        if (epdoc_util_1.isNumber(val)) {
            if (isInt) {
                if (epdoc_util_1.isFunction(rule.sanitize)) {
                    val = rule.sanitize(val, rule);
                    return this.applyNumberLimitTests(val, rule);
                }
                if (rule.sanitize === true) {
                    val = Math.round(val);
                    return this.applyNumberLimitTests(val, rule);
                }
                if (epdoc_util_1.isString(rule.sanitize) && epdoc_util_1.isFunction(Math[rule.sanitize])) {
                    val = Math[rule.sanitize](val);
                    return this.applyNumberLimitTests(val, rule);
                }
                if (Math.round(val) !== val) {
                    return this.addError(validator_base_1.ValidatorErrorType.invalid);
                }
            }
            return this.applyNumberLimitTests(val, rule);
        }
        if (epdoc_util_1.isString(val)) {
            if (isInt) {
                const valAsInt = Math.round(parseFloat(val));
                if (isNaN(valAsInt)) {
                    if (rule.default) {
                        return this.setResult(this.getDefault(rule));
                    }
                    if (rule.required) {
                        return this.addError(validator_base_1.ValidatorErrorType.missingOrInvalid);
                    }
                }
                return this.applyNumberLimitTests(valAsInt, rule);
            }
            const valAsFloat = parseFloat(val);
            if (isNaN(valAsFloat)) {
                if (rule.default) {
                    return this.setResult(this.getDefault(rule));
                    return this;
                }
                if (rule.required) {
                    return this.addError(validator_base_1.ValidatorErrorType.missingOrInvalid);
                }
            }
            return this.applyNumberLimitTests(valAsFloat, rule);
        }
        if (rule.default) {
            return this.setResult(this.getDefault(rule));
        }
        if (rule.required) {
            return this.addError(validator_base_1.ValidatorErrorType.missingOrInvalid);
        }
        return this;
    }
    applyNumberLimitTests(val, rule) {
        if (epdoc_util_1.isNumber(rule.min) && val < rule.min) {
            if (epdoc_util_1.isNumber(rule.default)) {
                return this.setResult(rule.default);
            }
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule, 'min'));
            }
            return this.addError(validator_base_1.ValidatorErrorType.min, { min: rule.min });
        }
        if (epdoc_util_1.isNumber(rule.max) && val > rule.max) {
            if (epdoc_util_1.isNumber(rule.default)) {
                return this.setResult(rule.default);
            }
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule, 'max'));
            }
            return this.addError(validator_base_1.ValidatorErrorType.max, { max: rule.max });
        }
        return this.setResult(val);
    }
    dateApply(val, rule) {
        if (epdoc_util_1.isDate(val)) {
            return this.applyDateLimitTests(val, rule);
        }
        if (epdoc_util_1.hasValue(val)) {
            if (epdoc_util_1.isFunction(rule.sanitize)) {
                val = rule.sanitize(val, rule);
                return this.applyDateLimitTests(val, rule);
            }
            if (rule.sanitize === true || rule.sanitize === 'date') {
                if (epdoc_util_1.isString(val) && REGEX.isWholeNumber.test(val)) {
                    val = parseInt(val, 10);
                }
            }
            try {
                val = new Date(val);
                if (!isNaN(val.getTime())) {
                    return this.applyDateLimitTests(val, rule);
                }
            }
            catch (err) {
            }
        }
        if (epdoc_util_1.isFunction(rule.default)) {
            return rule.default(val, rule);
        }
        if (epdoc_util_1.hasValue(rule.default)) {
            return new Date(rule.default);
        }
        if (rule.required) {
            return this.addError(validator_base_1.ValidatorErrorType.missingOrInvalid);
        }
        return this.addError(validator_base_1.ValidatorErrorType.invalid);
    }
    applyDateLimitTests(val, rule) {
        if (epdoc_util_1.hasValue(rule.min) && val < rule.min) {
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule, validator_base_1.ValidatorErrorType.min));
            }
            if (epdoc_util_1.hasValue(rule.default)) {
                return this.setResult(new Date(rule.default));
            }
            return this.addError(validator_base_1.ValidatorErrorType.dateMin, { min: rule.min });
        }
        if (epdoc_util_1.hasValue(rule.max) && val > rule.max) {
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule, 'max'));
            }
            if (epdoc_util_1.hasValue(rule.default)) {
                return this.setResult(new Date(rule.default));
            }
            return this.addError(validator_base_1.ValidatorErrorType.dateMax, { max: rule.max });
        }
        return this.setResult(val);
    }
    objectApply(val, rule) {
        if (epdoc_util_1.isObject(val)) {
            this._result = {};
            this.propertiesApply(rule);
            return this;
        }
        if (epdoc_util_1.hasValue(val)) {
            if (epdoc_util_1.isFunction(rule.sanitize)) {
                return this.setResult(rule.sanitize(val, rule));
            }
            return this.addError(validator_base_1.ValidatorErrorType.invalid);
        }
        if (epdoc_util_1.isFunction(rule.default)) {
            return this.setResult(rule.default(val, rule));
        }
        if (epdoc_util_1.isObject(rule.default)) {
            return this.setResult(epdoc_util_1.deepCopy(rule.default));
        }
        if (rule.required) {
            return this.addError(validator_base_1.ValidatorErrorType.missing);
        }
        return this;
    }
    propertiesApply(rule) {
        if (rule.type === 'object') {
            if (rule.properties) {
                let errors = [];
                const validity = this.checkIPropertyValidity(rule);
                if (true ||
                    (!Object.keys(validity.notAllowed).length &&
                        !Object.keys(validity.missing).length)) {
                    Object.keys(validity.present).forEach(prop => {
                        try {
                            if (rule.properties[prop]) {
                                const subRule = new validator_rule_1.ValidatorRule(rule.properties[prop]);
                                const item = new ValidatorItem(this._value[prop]);
                                item
                                    .chain(this.getChain())
                                    .name(prop)
                                    .validate(subRule);
                                if (item.hasErrors()) {
                                    item.errors.forEach(err => {
                                        err.key = [this.label, err.key].join('.');
                                    });
                                    errors = errors.concat(item.errors);
                                }
                                else if (item.output !== undefined) {
                                    this._result[prop] = item.output;
                                }
                            }
                            else {
                                this._result[prop] = this._value[prop];
                            }
                        }
                        catch (err) {
                            errors.push(err);
                        }
                    });
                    if (errors.length) {
                        this.addErrors(errors);
                    }
                }
            }
            else {
                this._result = this._value;
            }
        }
        return this;
    }
    checkIPropertyValidity(rule) {
        const result = {
            present: {},
            notAllowed: {},
            ignore: {},
            missing: {}
        };
        const val = this._value;
        const ruleProps = rule.getProperties();
        Object.keys(val).forEach(key => {
            if (ruleProps && ruleProps[key]) {
                result.present[key] = true;
            }
            else if (rule.strict && (!ruleProps[key] || !ruleProps[key].optional)) {
                result.notAllowed[key] = true;
                this._errors.push({ key, type: validator_base_1.ValidatorErrorType.notAllowed });
            }
            else if (rule.only && (!ruleProps[key] || !ruleProps[key].optional)) {
                result.ignore[key] = true;
            }
            else {
                result.present[key] = true;
            }
        });
        Object.keys(ruleProps).forEach(key => {
            if ((ruleProps[key].required || rule.strict) && !result.present[key]) {
                if (ruleProps[key].default) {
                    result.present[key] = true;
                }
                else {
                    result.missing[key] = true;
                    this._errors.push({ key, type: validator_base_1.ValidatorErrorType.missing });
                }
            }
        });
        return result;
    }
    arrayApply(val, rule) {
        if (Array.isArray(val)) {
            this._result = [];
            if (rule.itemType) {
                this._result = [];
                for (let idx = 0; idx < val.length; ++idx) {
                    const v = val[idx];
                    try {
                        const item = new ValidatorItem(v);
                        const subRule = new validator_rule_1.ValidatorRule(rule.itemType);
                        item
                            .chain(this.getChain())
                            .name(String(idx))
                            .validate(subRule);
                        if (item.hasErrors()) {
                            this._errors.concat(item.errors);
                        }
                        else {
                            this._result.push(item.output);
                        }
                    }
                    catch (err) {
                        this._errors.push(err);
                    }
                }
            }
            else {
                this._result = val;
            }
        }
        else {
            return this.addError(validator_base_1.ValidatorErrorType.invalid);
        }
        return this;
    }
    getDefault(rule) {
        if (epdoc_util_1.isFunction(rule.default)) {
            return rule.default(this._value, rule);
        }
        return rule.default;
    }
}
exports.ValidatorItem = ValidatorItem;
//# sourceMappingURL=validator-item.js.map