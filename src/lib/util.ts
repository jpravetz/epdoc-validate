import { IGenericObject } from '..';

const REGEX = {
  isTrue: /^true$/i,
  isFalse: /^false$/i,
  customElement: /CustomElement$/,
  firstUppercase: /(^[A-Z])/,
  allUppercase: /([A-Z])/g,
  tr: /^\[tr\](.+)$/,
  html: /[&<>"'\/]/g,
  instr: /^\[([^\]]+)\](.*)$/
};
const VAL_MAP: { [key: string]: any } = {
  string: 'isString',
  number: 'isNumber',
  boolean: 'isBoolean',
  null: 'isNull',
  object: 'isObject',
  array: 'isArray',
  date: 'isDate',
  any: 'isDefined',
  integer: 'isInteger'
};

export class Util {
  public static validSchemaTypes: string[] = Object.keys(VAL_MAP);

  public static isNumber(val: any): val is number {
    return typeof val === 'number' && !isNaN(val);
  }

  public static isPosNumber(val: any): val is number {
    return typeof val === 'number' && !isNaN(val) && val > 0;
  }

  public static isInteger(val: any): val is number {
    return Util.isNumber(val) && Number.isInteger(val);
  }

  /**
   * Is 1,2,3,4,...
   * @param {Number} val
   */
  public static isPosInteger(val: any): val is number {
    return Util.isNumber(val) && Number.isInteger(val) && val > 0;
  }

  public static notString(val: any) {
    return typeof val !== 'string' || val.length === 0;
  }

  public static isNonEmptyString(val: any, path?: string): val is string {
    val = path ? Util.getPropertyValue(val, path) : val;
    return typeof val === 'string' && val.length > 0;
  }

  public static isString(val: any, path?: string): val is string {
    const s = path ? Util.getPropertyValue(val, path) : val;
    return typeof s === 'string';
  }

  public static isBoolean(val: any): val is boolean {
    return typeof val === 'boolean';
  }

  public static isFunction(val: any) {
    return typeof val === 'function';
  }

  public static isRegExp(val: any): val is RegExp {
    return val instanceof RegExp;
  }

  public static isNull(val: any): val is null {
    return val === null ? true : false;
  }

  public static isDefined(val: any) {
    return val !== undefined;
  }

  public static isNonEmptyArray(val: any, path?: string): val is [] {
    const a: any = path ? Util.getPropertyValue(val, path) : val;
    return Array.isArray(a) && a.length > 0;
  }

  public static isEmpty(obj: IGenericObject) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  public static isError(val: any): val is Error {
    return val instanceof Error;
  }

  public static isDate(val: any): val is Date {
    return val instanceof Date;
  }

  public static isArray(val: any): val is [] {
    return Array.isArray(val);
  }

  public static asError(...args: any[]): Error {
    let err: Error | undefined;
    const msg: string[] = [];
    if (args.length) {
      args.forEach(arg => {
        if (arg instanceof Error) {
          if (!err) {
            err = arg;
          }
          msg.push(err.message);
        } else if (Util.isString(arg)) {
          msg.push(arg);
        } else {
          msg.push(String(arg));
        }
      });
      if (!err) {
        err = new Error(msg.join(' '));
      } else {
        err.message = msg.join(' ');
      }
    }
    return err as Error;
  }

  /**
   * An Object and NOT an array or Date
   * @param obj
   * @returns {boolean}
   */
  public static isObject(obj: any, path?: string) {
    const val = path ? Util.getPropertyValue(obj, path) : obj;
    return (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      !(val instanceof Date) &&
      !(val instanceof RegExp)
    );
  }

  /**
   * Is not undefined or null.
   * @param {*} obj
   */
  public static hasValue(obj: any) {
    return obj !== null && obj !== undefined;
  }

  /**
   * Careful using this method on minimized code where the name of the class might be changed
   * @param obj
   * @param name
   * @returns {*|boolean}
   */
  public static isClass(obj: any, name: string) {
    return Util.isObject(obj) && obj.constructor.name === name;
  }

  public static isEventAggregator(ea: any) {
    return (
      Util.isObject(ea) &&
      Util.isObject(ea.eventLookup) &&
      Array.isArray(ea.messageHandlers)
    );
  }

  public static pick(obj: IGenericObject, ...args: any[]) {
    // eslint-disable-line no-extend-native
    const result: IGenericObject = {};
    if (Array.isArray(args[0])) {
      args = args[0];
    }
    args.forEach(key => {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    });
    return result;
  }

  public static omit(obj: IGenericObject, ...args: any[]) {
    if (Array.isArray(args[0])) {
      args = args[0];
    }
    const keys = Object.keys(obj).filter(key => args.indexOf(key) < 0);
    const newObj: IGenericObject = {};
    keys.forEach(k => {
      newObj[k] = obj[k];
    });
    return newObj;
  }

  public static validatePropertyType(obj: IGenericObject, name: string, type: any) {
    if (obj) {
      return Util.validateType(obj[name], type);
    }
    return false;
  }

  public static schemaTypeValidator(type: string) {
    return Util.VAL_MAP[type];
  }

  /**
   * Verify that val is any one of the basic types or executes a RegExp against the val.
   * @param val
   * @param type {String|array of string} - To contain one or more entries from VAL_MAP as a string, array of strings or entries separated by '|'.
   * @returns {boolean} Returns true if val is one of type. If type is a RegExp then tests val against the RegExp.
   */
  public static validateType(val: any, type: string | string[]) {
    let types: string[] = Array.isArray(type) ? type : [];
    if (Util.isString(type)) {
      types = (type as string).split('|');
    }
    for (const t of types) {
      const fn = Util.VAL_MAP[t];
      if (fn && fn(val)) {
        return true;
      }
    }
    return false;
  }

  public static validateProperty(
    obj: IGenericObject,
    name: string,
    type: string | string[],
    required: boolean
  ): IGenericObject | undefined {
    if (!obj[name] && required) {
      return { type: 'missing', key: name };
    } else if (obj[name] && !Util.validateType(obj[name], type)) {
      return { type: 'type', key: name };
    }
  }

  public static isTrue(val: any): boolean {
    if (typeof val === 'number') {
      return val > 0 ? true : false;
    } else if (typeof val === 'string') {
      return val.length && !REGEX.isFalse.test(val) ? true : false;
    } else if (typeof val === 'boolean') {
      return val;
    }
    return false;
  }

  public static isFalse(val: any): boolean {
    if (typeof val === 'number') {
      return val === 0 ? true : false;
    } else if (typeof val === 'string') {
      return val.length && !REGEX.isTrue.test(val) ? true : false;
    } else if (typeof val === 'boolean') {
      return val;
    }
    return false;
  }

  public static asFloat(val: any): number {
    if (typeof val === 'number') {
      return val;
    } else if (Util.isNonEmptyString(val)) {
      return parseFloat(val);
    }
    return 0;
  }

  public static asInteger(val: any): number {
    if (typeof val === 'number') {
      return Number.isInteger(val) ? val : Math.round(val);
    } else if (Util.isNonEmptyString(val)) {
      return parseInt(val, 10);
    }
    return 0;
  }

  /**
   *
   * @param n {number} number to pad with leading zeros.
   * @param width {number} total width of string (eg. 3 for '005').
   * @param [z='0'] {char} character with which to pad string.
   * @returns {String}
   */
  public static pad(n: number, width: number, z: string): string {
    z = z || '0';
    const sn = String(n);
    return sn.length >= width ? sn : new Array(width - sn.length + 1).join(z) + sn;
  }

  /**
   * Float precision that returns a set number of digits after the decimal
   * @param {number} num - number to round
   * @param {number} dec - number of digits after decimal
   * @return {number} num rounded
   */
  public static roundNumber(num: number, dec: number = 3): number {
    const factor = Math.pow(10, dec);
    return Math.round(num * factor) / factor;
  }

  /**
   * Retrieves the value in the object specified by the key path
   * @param object the object
   * @param rest {String, or array of strings, or strings} the path
   * @param [opts.throw] {boolean}
   * @param [opts.src] {String}
   * @returns {*} the value
   */
  public static getPropertyValue(object: IGenericObject, ...rest: any[]) {
    let a: string[] = [];
    let opts: any = {};
    rest.forEach(arg => {
      if (Util.isString(arg)) {
        arg = arg.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
        arg = arg.replace(/^\./, ''); // strip a leading dot
        const args = arg.split('.');
        a = [...a, ...args];
      } else if (Array.isArray(arg)) {
        a = [...a, ...arg];
      } else if (Util.isObject(arg)) {
        opts = arg;
      }
    });
    let obj = object;
    for (let i = 0, n = a.length; i < n; ++i) {
      const k = a[i];
      if (obj && k in obj) {
        obj = obj[k];
      } else {
        if (opts.throw) {
          throw new Error(
            `Property ${a.join('.')} not found in ${opts.src ? opts.src : 'object'}`
          );
        }
        return;
      }
    }
    return obj;
  }

  public static setPropertyValue(
    object: IGenericObject,
    prop: string | string[],
    value: any,
    opts = {}
  ) {
    let a: any[] = [];
    if (Util.isString(prop)) {
      prop = (prop as string).replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      prop = (prop as string).replace(/^\./, ''); // strip a leading dot
      const args = (prop as string).split('.');
      a = [...a, ...args];
    } else if (Array.isArray(prop)) {
      a = [...a, ...prop];
    }
    let obj = object;
    const n = a.length;
    for (let i = 0; i < n; ++i) {
      const k = a[i];
      if (obj) {
        if (!(k in obj)) {
          obj[k] = {};
        }
        obj = obj[k];
      }
    }
    obj = value;
  }

  public static deepCopy(a: any) {
    if (a === undefined || a === null) {
      return a;
    } else if (typeof a === 'number' || typeof a === 'string') {
      return a;
    } else if (a instanceof Date || a instanceof RegExp) {
      return a;
    } else if (Array.isArray(a)) {
      const result = [];
      for (const b of a) {
        result.push(b);
      }
      return result;
    } else if (Util.isObject(a)) {
      const result2: IGenericObject = {};
      Object.keys(a).forEach(key => {
        result2[key] = Util.deepCopy(a[key]);
      });
      return result2;
    }
    return a;
  }

  /**
   * Value comparator. Considers undefined, null, [] and {} to all be equal
   * @param a
   * @param b
   * @returns {boolean}
   */
  public static deepEquals(a: any, b: any): boolean {
    const aSet = Util.isSet(a);
    const bSet = Util.isSet(b);
    if (!aSet && !bSet) {
      return true;
    }
    if (!aSet || !bSet) {
      return false;
    }
    if (a === b || a.valueOf() === b.valueOf()) {
      return true;
    }
    if (Array.isArray(a) && a.length !== b.length) {
      return false;
    }
    // if they are dates, they must had equal valueOf
    if (a instanceof Date) {
      return false;
    }
    // if they are strictly equal, they both need to be object at least
    if (!(a instanceof Object)) {
      return false;
    }
    if (!(b instanceof Object)) {
      return false;
    }
    // recursive object equality check
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    if (kb.length === ka.length) {
      return ka.every(k => {
        return Util.deepEquals(a[k], b[k]);
      });
    }
    return false;
  }

  public static isSet(a: any): boolean {
    if (a === null || a === undefined) {
      return false;
    }
    if (Array.isArray(a) && !a.length) {
      return false;
    }
    if (a instanceof Date) {
      return true;
    }
    if (a instanceof Object && !Object.keys(a).length) {
      return false;
    }
    return true;
  }
}

// Add toJSON method to Error object
if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: () => {
      const alt: IGenericObject = {};
      // @ts-ignore
      const self = this;
      Object.getOwnPropertyNames(self).forEach((key: string) => {
        // @ts-ignore
        alt[key] = self[key];
      }, self);

      return alt;
    },
    configurable: true,
    writable: true
  });
}
