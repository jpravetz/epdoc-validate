// import { LogManager } from 'aurelia-framework';
import { Translator } from './lib/translator';
import { ValidatorError } from './validator-error';
import { ValidatorRule } from './validator-rule';
import { ValidatorItem, ValidatorInput, ValidatorOption, ValidatorResponse } from './validator-item';
import { isObject, GenericObject, Callback } from './lib/util';


// let logger = LogManager.getLogger('validator');

export class Validator {
  private _changes: object;
  private _errors: ValidatorError[] = [];
  private _role: string = 'input';
  private _reference: object;
  _obj: object;

  constructor(changes: object, errors: ValidatorError[] = []) {
    this._changes = changes;
    this._errors = errors ;
  }

  /**
   * If doc is set then the validate method will only set the value on changes
   * if it is different from the reference's value
   * @param {BaseModel} doc
   */
  reference(ref: object) {
    this._reference = ref;
    return this;
  }

  get ref() {
    return this._reference;
  }

  get changes() {
    return this._changes;
  }

  get errors() {
    return this._errors;
  }

  clear() {
    this._changes = {};
    this._errors = [];
    this._reference = undefined;
  }

  input(val: any, fnFromData?: Callback) {
    return new ValidatorInput(this, val, fnFromData);
  }

  response(obj = {}) {
    this._obj = obj;
    this._role = 'response';
    return this;
  }

  options(obj = {}) {
    this._obj = obj;
    this._role = 'options';
    return this;
  }

  // object (obj = {}) {
  //   this._obj = obj;
  //   this._role = 'object';
  //   return this;
  // }

  property(name) {
    if (this._role === 'response') {
      return new ValidatorResponse(this, this._obj ? this._obj[name] : undefined).name(name);
    } else if (this._role === 'options') {
      return new ValidatorOption(this, this._obj ? this._obj[name] : undefined).name(name);
    }
  }

  _validateItem(rules, key) {
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

  _validateObject(rules) {
    let item = new ValidatorItem(this, this._role, this._obj);
    item.validate(rules);
    return this;
  }

  errorString(trParams: GenericObject = {}) {
    if (this.hasErrors) {
      // logger.debug('errorString', this._errors);
      trParams.msg = this._errors.map(err => {
        return err.toString();
      }).join(', ');
      let tr = 'validator.' + this._role + '.badData';
      return new Translator(tr).params(trParams).tr();
    }
  }

  asError(trParams) {
    let msg = this.errorString(trParams);
    return new Error(msg);
  }

  newError(trParams) {
    return new Error(this.errorString(trParams));
  }

  get hasErrors() {
    return this._errors && this._errors.length > 0;
  }

  addError(err) {
    this._errors.push(err);
  }

  addErrors(errs: ValidatorError[]) {
    errs.forEach(err => {
      this._errors.push(err);
    });
  }

    /**
   * Similar to Object.assign except recursively validates and assigns values
   * from srcObj.
   * @param {*} destObj - This object is populated with entries from srcObj
   * @param {Object} srcObj - Value to be validated
   * @param {*} rules - Object containing recursive rules
   */
  // validateObjectAssign_deprecated(destObj, srcObj, rules) {
  //   if (rules.type === 'object' && isObject(srcObj) && rules.properties) {
  //     let dest = {};
  //     Object.keys(rules.properties).forEach(key => {
  //       let entryRule = rules.properties[key];
  //       let test = ValidatorItem.applyRuleDef(srcObj[key], entryRule);
  //       if (test.error) {
  //         if (entryRule.default) {
  //           dest[key] = entryRule.default;
  //         } else {
  //           this._errors.push(test.error);
  //         }
  //       }
  //       if (entryRule.type === 'object' && entryRule.properties) {
  //         let subSrc = isObject(srcObj[key]) ? srcObj[key] : {};
  //         let subDest = {};
  //         this.validateObjectAssign(subDest, subSrc, entryRule);
  //         if (Object.keys(subDest).length) {
  //           dest[key] = subDest;
  //         }
  //       } else {
  //         dest[key] = srcObj[key];
  //       }
  //     });
  //     if (Object.keys(dest).length) {
  //       Object.assign(destObj, dest);
  //     }
  //   }
  //   return destObj;
  // }


}
