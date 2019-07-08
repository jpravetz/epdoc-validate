// import { LogManager } from 'aurelia-framework';
import { Translator } from './lib/translator';
import { ValidatorError } from './validator-error';
import {ValidateRule} from './validate-rule';
import { ValidatorItem, ValidatorInput, ValidatorOption, ValidatorResponse } from './validator-item';
import { isObject , GenericObject} from './lib/util';

// let logger = LogManager.getLogger('validator');

export class Validator {
  changes:object;
  errors:object[];
  _role:string = 'input';
  _doc:object;
  _obj:object;

  constructor (changes:object, errors:object[]) {
    this.changes = changes;
    this.errors = errors;
  }

  /**
   * If doc is set then the validate method will only set the value on changes
   * if it is different from the doc's value
   * @param {BaseModel} doc
   */
  setCompareDoc (doc:object) {
    this._doc = doc;
    return this;
  }

  get doc () {
    return this._doc;
  }

  clear () {
    this.changes = {};
    this.errors = [];
  }

  input (val, fnFromData) {
    return new ValidatorInput(this, val, fnFromData);
  }

  response (obj = {}) {
    this._obj = obj;
    this._role = 'response';
    return this;
  }

  options (obj = {}) {
    this._obj = obj;
    this._role = 'options';
    return this;
  }

  // object (obj = {}) {
  //   this._obj = obj;
  //   this._role = 'object';
  //   return this;
  // }

  property (name) {
    if (this._role === 'response') {
      return new ValidatorResponse(this, this._obj ? this._obj[name] : undefined).setName(name);
    } else if (this._role === 'options') {
      return new ValidatorOption(this, this._obj ? this._obj[name] : undefined).setName(name);
    }
  }

  /**
   * Similar to Object.assign except recursively validates and assigns values
   * from srcObj.
   * @param {*} destObj - This object is populated with entries from srcObj
   * @param {Object} srcObj - Value to be validated
   * @param {*} rules - Object containing recursive rules
   */
  validateObjectAssign (destObj, srcObj, rules) {
    if (rules.type === 'object' && isObject(srcObj) && rules.properties) {
      let dest = {};
      Object.keys(rules.properties).forEach(key => {
        let entryRule = rules.properties[key];
        let test = ValidatorItem.applyRuleDef(srcObj[key], entryRule);
        if (test.error) {
          if (entryRule.default) {
            dest[key] = entryRule.default;
          } else {
            this.errors.push(test.error);
          }
        }
        if (entryRule.type === 'object' && entryRule.properties) {
          let subSrc = isObject(srcObj[key]) ? srcObj[key] : {};
          let subDest = {};
          this.validateObjectAssign(subDest, subSrc, entryRule);
          if (Object.keys(subDest).length) {
            dest[key] = subDest;
          }
        } else {
          dest[key] = srcObj[key];
        }
      });
      if (Object.keys(dest).length) {
        Object.assign(destObj, dest);
      }
    }
    return destObj;
  }

  validate (ruleDef) {
    let rule = new ValidateRule(ruleDef);
    if (rule.isValid()) {
      let item = new ValidatorItem(this, this._role, this._obj);
      item.validate(rule);
      this.addErrors(item.errors);
    }
    // let rules = Object.assign({}, rulesDef);
    // rules.required = rules.required ? rules.required : {};
    // rules.optional = rules.optional ? rules.optional : {};
    // let keysWithRules = {};
    // Object.keys(rules.required).forEach(key => {
    //   this._validateItem(rules, key);
    //   keysWithRules[key] = true;
    // });
    // Object.keys(rules.optional).forEach(key => {
    //   this._validateItem(rules, key);
    //   keysWithRules[key] = true;
    // });
    // if (rules.strict) {
    //   Object.keys(this._obj).forEach(key => {
    //     if (!keysWithRules[key]) {
    //       this.errors.push(new ValidatorError(key, 'notAllowed'));
    //     }
    //   });
    // }
    return this;
  }

  _validateItem (rules, key) {
    let item = new ValidatorItem(this, this._role, this._obj[key]);
    let rule = {
      name: key,
      required: rules.required[key] ? true : false,
      optional: rules.optional[key] ? true : false,
      type: rules.required[key] ? rules.required[key] : rules.optional[key],
      strict: rules.strict
    };
    rule.type = rule.type ? rule.type : '*';
    item.validate(rule);
  }

  _validateObject (rules) {
    let item = new ValidatorItem(this, this._role, this._obj);
    item.validate(rules);
    return this;
  }

  errorString (trParams:GenericObject = {}) {
    if (this.hasErrors) {
      // logger.debug('errorString', this.errors);
      trParams.msg = this.errors.map(err => {
        return err.toString();
      }).join(', ');
      let tr = 'validator.' + this._role + '.badData';
      return new Translator(tr).params(trParams).tr();
    }
  }

  asError (trParams) {
    let msg = this.errorString(trParams);
    return new Error(msg);
  }

  newError (trParams) {
    return new Error(this.errorString(trParams));
  }

  get hasErrors () {
    return this.errors && this.errors.length > 0;
  }

  addError (err) {
    this.errors.push(err);
  }

  addErrors(errs:object[]) {
    errs.forEach(err=>{
      this.errors.push(err);
    });
  }
}
