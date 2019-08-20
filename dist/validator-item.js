"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        this._value = value;
    }
    name(name) {
        this._name = name;
        return this;
    }
    getName() {
        return this._name;
    }
    set label(val) {
        this._label = val;
    }
    get label() {
        return this._label ? this._label : this._name ? this._name : '?';
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
        let err = { key: this.label, type: type, params: params };
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
    valueApply(rule) {
        if (!this.hasValue()) {
            if (rule.default) {
                this._result = rule.default;
                return this;
            }
            else if (rule.required) {
                return this.addError(validator_base_1.ValidatorErrorType.missing);
            }
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
    setResult(val) {
        this._result = val;
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
        if (epdoc_util_1.isString(val)) {
            return this.applyStringLengthTests(val, rule);
        }
        if (rule.default && (val === undefined || val === null)) {
            if (epdoc_util_1.isString(rule.default)) {
                return this.setResult(rule.default);
            }
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule));
            }
        }
        if (epdoc_util_1.isFunction(rule.sanitize)) {
            val = rule.sanitize(val, rule);
            return this.applyStringLengthTests(val, rule);
        }
        if (rule.sanitize === true || rule.sanitize === 'string') {
            return this.applyStringLengthTests(String(val), rule);
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
            if (epdoc_util_1.isString(rule.default)) {
                return this.setResult(rule.default);
            }
            if (epdoc_util_1.isFunction(rule.default)) {
                return this.setResult(rule.default(val, rule, 'max'));
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
        if (rule.type === 'object' && rule.properties) {
            let errors = [];
            Object.keys(rule.properties).forEach(prop => {
                try {
                    const item = new ValidatorItem(this._value[prop]);
                    item.name(prop).validate(rule.properties[prop]);
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
                catch (err) {
                    errors.push(err);
                }
            });
            if (errors.length) {
                this.addErrors(errors);
            }
        }
        return this;
    }
    arrayApply(val, rule) {
        if (Array.isArray(val)) {
            this._result = [];
            if (rule.arrayType) {
                this._result = [];
                for (const v of this._value) {
                    try {
                        const item = new ValidatorItem(v);
                        item.valueApply(rule.arrayType);
                        if (item.hasErrors) {
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