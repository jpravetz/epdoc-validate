// import { LogManager } from 'aurelia-framework';
import { Translator } from './lib/translator';
import { ValidatorError } from './validator-error';
import { ValidatorRule } from './validator-rule';
import { ValidatorItem } from './validator-item';
import { isObject, GenericObject, Callback } from './lib/util';
import { ValidatorBase } from './validator-base';


// let logger = LogManager.getLogger('validator');

export class Validator extends ValidatorBase {

  protected _errors: ValidatorError[] = [];
  protected _itemValidator: ValidatorItem = undefined;
  _obj: object;

  constructor(errors: ValidatorError[] = []) {
    super();
    this._errors = errors;
  }

  options(obj = {}) {
    this._obj = obj;
    return this;
  }

  input(val: any): this {
    this._itemValidator.input(val);
    return this;
  }

  validate(rule: GenericObject): this {
    throw new Error('Implemented by subclass');
    return this;
  }

  errorString(trParams: GenericObject = {}) {
    if (this.hasErrors) {
      // logger.debug('errorString', this._errors);
      trParams.msg = this._errors.map(err => {
        return err.toString();
      }).join(', ');
      let tr = 'validator.badData';
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

  // object (obj = {}) {
  //   this._obj = obj;
  //   this._role = 'object';
  //   return this;
  // }

  // property(name) {
  //   if (this._role === 'response') {
  //     return new ResponseValidator(this, this._obj ? this._obj[name] : undefined).name(name);
  //   } else if (this._role === 'options') {
  //     return new ValidatorOption(this, this._obj ? this._obj[name] : undefined).name(name);
  //   }
  // }

  // _validateItem(rules, key) {
  //   let item = new ValidatorItem(this, this._role, this._obj[key]);
  //   let rule = {
  //     name: key,
  //     required: rules.required[key] ? true : false,
  //     optional: rules.optional[key] ? true : false,
  //     type: rules.required[key] ? rules.required[key] : rules.optional[key],
  //     strict: rules.strict
  //   };
  //   rule.type = rule.type ? rule.type : '*';
  //   item.validate(rule);
  // }

  // _validateObject(rules) {
  //   let item = new ValidatorItem(this, this._role, this._obj);
  //   item.validate(rules);
  //   return this;
  // }


}

