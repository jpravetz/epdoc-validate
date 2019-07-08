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

export type GenericObject = { [key: string]: any };

if (!('toJSON' in Error.prototype)) {
  Object.defineProperty(Error.prototype, 'toJSON', {
    value: function () {
      let alt = {};

      Object.getOwnPropertyNames(this).forEach(function (key) {
        alt[key] = this[key];
      }, this);

      return alt;
    },
    configurable: true,
    writable: true
  });
}

export function isNumber(val: any) {
  return typeof val === 'number' && !isNaN(val);
}

export function isPosNumber(val: any) {
  return typeof val === 'number' && !isNaN(val) && val > 0;
}

export function isInteger(val: any) {
  return isNumber(val) && Number.isInteger(val);
}

/**
 * Is 1,2,3,4,...
 * @param {Number} val
 */
export function isPosInteger(val: any) {
  return isNumber(val) && Number.isInteger(val) && val > 0;
}

export function notString(val: any) {
  return typeof val !== 'string' || val.length === 0;
}

export function isNonEmptyString(val: any, path?: string) {
  let s = path ? getPropertyValue(val, path) : val;
  return isString(s) && s.length;
}

export function isString(val: any, path?: string) {
  let s = path ? getPropertyValue(val, path) : val;
  return typeof s === 'string';
}

export function isBoolean(val: any) {
  return typeof val === 'boolean';
}

export function isFunction(val: any) {
  return typeof val === 'function';
}

export function isRegExp(val: any) {
  return val instanceof RegExp;
}

export function isNonEmptyArray(val: any, path?: string) {
  let a = path ? getPropertyValue(val, path) : val;
  return Array.isArray(a) && a.length;
}

export function isEmpty(obj: GenericObject) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function isError(val: any) {
  return val instanceof Error;
}

export function isDate(val: any) {
  return val instanceof Date;
}

export function isArray(val: any) {
  return Array.isArray(val);
}

export function asError(...args) {
  let err;
  let msg = [];
  if (args.length) {
    args.forEach(arg => {
      if (arg instanceof Error) {
        if (!err) {
          err = arg;
        }
        msg.push(err.message);
      } else if (isString(arg)) {
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
  return err;
}

/**
 * An Object and NOT an array or Date
 * @param obj
 * @returns {boolean}
 */
export function isObject(obj: *, path?: string) {
  let val = path ? getPropertyValue(obj, path) : obj;
  return val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date);
}

/**
 * Is not undefined or null.
 * @param {*} obj
 */
export function hasValue(obj) {
  return obj !== null && obj !== undefined;
}


/**
 * Careful using this method on minimized code where the name of the class might be changed
 * @param obj
 * @param name
 * @returns {*|boolean}
 */
export function isClass(obj, name) {
  return isObject(obj) && obj.constructor.name === name;
}

export function isEventAggregator(ea) {
  return isObject(ea) && isObject(ea.eventLookup) && Array.isArray(ea.messageHandlers);
}

export function pick(obj: object, ...args) {   // eslint-disable-line no-extend-native
  let result = {};
  if (Array.isArray(args[0])) {
    args = args[0];
  }
  args.forEach((key) => {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit(obj, ...args) {
  if (Array.isArray(args[0])) {
    args = args[0];
  }
  let keys = Object.keys(obj).filter((key) => args.indexOf(key) < 0);
  let newObj = {};
  keys.forEach(k => {
    newObj[k] = obj[k];
  });
  return newObj;
}

export function validatePropertyType(obj, name, type) {
  if (obj) {
    return validateType(obj[name], type)
  }
  return false;
}

/**
* Verify that val is any one of the basic types or executes a RegExp against the val.
* @param val
* @param type {String} One of 'string', 'array', 'number', 'integer', 'boolean', 'object' or a RegExp/
* @returns {boolean} Returns true if val is one of type. If type is a RegExp then tests val against the RegExp.
*/
export function validateType(val, type) {
  if (isRegExp(type)) {
    return type.test(val);
  } else {
    let types = Array.isArray(type) ? type : [];
    if (isString(type)) {
      types = type.split('|');
    }
    for (let tdx = 0; tdx < types.length; tdx++) {
      let t = types[tdx];
      let fn = VAL_MAP[t];
      if (fn && fn(val, t)) {
        return true;
      }
    }
  }
  return false;
}

export function validateProperty(obj, name, type, required) {
  if (!obj[name] && required) {
    return { type: 'missing', key: name };
  } else if (obj[name] && !validateType(obj, name, type)) {
    return { type: 'type', key: name };
  }
}

export function validateObject(obj, rules) {
  let result = {};
  let errors = [];
  if (rules.required) {
    Object.keys(rules.required).forEach(key => {
      let err = validateProperty(obj, key, rules.required[key], true);
      if (err) {
        errors.push(err);
      } else {
        result[key] = obj[key];
      }
    });
  }
  if (rules.optional) {
    Object.keys(rules.optional).forEach(key => {
      let err = validateProperty(obj, key, rules.optional[key], false);
      if (err) {
        errors.push(err);
      } else {
        result[key] = obj[key];
      }
    });
  }
  if (rules.strict) {
    Object.keys(obj).forEach(key => {
      let allowed = (rules.required && rules.required[key] || rules.optional && rules.optional[key]);
      if (!allowed) {
        errors.push({ type: 'invalid', key: key });
      }
    });
  }
  return { data: result, errors: errors };
}

export function validateErrorToString(errors, i18n, trRoot) {
  if (errors && errors.length) {
    let msg = errors.map(item => {
      return i18n.tr(trRoot + '.' + item.type, item);
    }).join(', ');
    return msg;
  }
}

export function tr(s, i18n) {
  if (s) {
    let m = s.match(REGEX.tr);
    if (m) {
      return i18n.tr(m[1]);
    }
    return s;
  }
}

export function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function getQueryStringParam(name) {
  let results = new RegExp('[\?&]' + name + '=([^&#]*)')
    .exec(window.location.href);
  return results ? results[1] : undefined;
}

export function isTrue(val) {
  if (typeof val === 'number') {
    return (val > 0) ? true : false;
  } else if (typeof val === 'string') {
    return (val.length && !REGEX.isFalse.test(val)) ? true : false;
  } else if (typeof val === 'boolean') {
    return val;
  }
  return false;
}

export function isFalse(val) {
  if (typeof val === 'number') {
    return (val === 0) ? true : false;
  } else if (typeof val === 'string') {
    return (val.length && !REGEX.isTrue.test(val)) ? true : false;
  } else if (typeof val === 'boolean') {
    return val;
  }
  return false;
}

export function asFloat(val) {
  if (typeof val === 'number') {
    return val;
  } else if (isNonEmptyString(val)) {
    return parseFloat(val, 10);
  }
  return 0;
}

export function asInteger(val) {
  if (typeof val === 'number') {
    return val;
  } else if (isNonEmptyString(val)) {
    return parseInt(val, 10);
  }
  return 0;
}

export function calcCtor(open, click, opts = {}) {
  if (typeof open === 'number' && open >= 1) {
    if (typeof click === 'number' && click >= 1) {
      return click / open;
    }
    return 0;
  }
  return opts.ifInvalid !== undefined ? opts.ifInvalid : '';
}

export function calcPct(val, total) {
  if (typeof total === 'number' && total > 0) {
    if (typeof val === 'number' && val > 0) {
      return val / total;
    }
    return 0;
  }
}

export function camelToDash(str) {
  return str
    .replace(REGEX.firstUppercase, ([first]) => first.toLowerCase())
    .replace(REGEX.allUppercase, ([letter]) => `-${letter.toLowerCase()}`);
}

export function classToUrn(str) {
  return str
    .replace(REGEX.customElement, '')
    .replace(REGEX.firstUppercase, ([first]) => first.toLowerCase())
    .replace(REGEX.allUppercase, ([letter]) => `.${letter.toLowerCase()}`);
}

/**
 *
 * @param n {number} number to pad with leading zeros.
 * @param width {number} total width of string (eg. 3 for '005').
 * @param [z='0'] {char} character with which to pad string.
 * @returns {String}
 */
export function pad(n, width, z) {
  z = z || '0';
  n = String(n);
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/**
 * Float precision that returns a set number of digits after the decimal
 * @param {number} num - number to round
 * @param {number} dec - number of digits after decimal
 * @return {number} num rounded
 */
export function roundNumber(num, dec = 3) {
  let factor = Math.pow(10, dec);
  return Math.round(num * factor) / factor;
}

const MS_DEFAULTS = {
  precision: 3,
  h: 'h',
  m: 'm',
  s: 's',
  decimal: '.',
  show: {}
};

export function fpsRound(t, fps) {
  return Math.round(t * fps) / fps;
}

/**
 * Formats a duration into a string of the form 3:03:22.333 or 3.123, with as few leading numbers
 * as is necessary to display the time.
 * NOTE: needs to be verified at precision values other than 3
 * @param ms {number} Time duration in milliseconds
 * @param options {Object}
 * @param [options.h='h'] {string}
 * @param [options.m='m'] {string}
 * @param [options.s='s'] {string}
 * @param [options.decimal='.'] {string}
 * @param [opts.show.h] {Number|boolean} If number, then always show this many digits of hours
 * @param [opts.show.m] {Number|boolean} If number, then always show this many digits of minutes
 * @param [opts.precision=3] {Number} Number of decimal seconds to display
 * @returns {string}
 */
export function formatMS(milliseconds, options = {}) {
  let opts = Object.assign({}, MS_DEFAULTS, options);
  let neg = '';
  let ms = Math.round(milliseconds * 1000) / 1000;
  if (ms < 0) {
    ms = 0 - ms;
    neg = '-';
  }
  let m = opts.format ? opts.format.match(/^([s]+)\.([m]+)s$/) : false;
  if (m && m.length) {
    opts.precision = m[2].length;
    opts.show.h = false;
    opts.show.m = false;
    opts.show.s = m[1].length;
    opts.s = 's';
  }

  let seconds = Math.floor(ms / 1000);
  let minutes;
  let hours;
  if (opts.show.m) {
    seconds = seconds % 60;
    minutes = Math.floor(ms / (60 * 1000));
    if (opts.show.h) {
      minutes = minutes % 60;
      hours = Math.floor(ms / (60 * 60 * 1000));
    }
  }
  let res = '';
  if (opts.precision) {
    res = msToPrecision(ms, opts);
  }
  if (hours) {
    return neg + hours + opts.h + pad(minutes, 2) + opts.m + pad(seconds, 2) + res + opts.s;
  } else if (minutes || opts.show.h) {
    if (isNumber(opts.show.h) && opts.show.h) {
      return neg + pad(hours, opts.show.h) + opts.h + pad(minutes, 2) + opts.m + pad(seconds, 2) + res + opts.s;
    }
    return neg + minutes + opts.m + pad(seconds, 2) + res + opts.s;
  } else if (isNumber(opts.show.m) && opts.show.m) {
    return neg + pad(minutes, opts.show.m) + opts.m + pad(seconds, 2) + res + opts.s;
  }
  return neg + seconds + res + opts.s;
}

function msToPrecision(ms, opts) {
  let milli = 1000 * roundNumber((ms % 1000) / 1000, opts.precision);
  return opts.decimal + pad(milli, opts.precision);
}

export function styleFromDict(dict) {
  let result = '';
  Object.keys(dict).forEach(key => {
    result += `${key}: ${dict[key]}; `;
  });
  return result;
}

export function addMonthsUTCBroken(date, count) {
  if (date && count) {
    let d0 = new Date(+date).getUTCDate();
    let d1 = new Date(+date).getUTCDate();
    d0.setUTCMonth(d0.getUTCMonth() + count, 1);
    let m = d0.getUTCMonth();
    d0.setUTCDate(d1);
    if (d0.getUTCMonth() !== m) {
      d0.setUTCDate(0);
    }
    return d0;
  }
}

export function addMonthsUTC(date, count = 1) {
  if (date && count) {
    let d = new Date(date);
    let result = d.setMonth(d.getMonth() + count);
    return result;
  }
  return date;
}

const MONTH = {
  'Jan': 0,
  'Feb': 1,
  'Mar': 2,
  'Apr': 3,
  'May': 4,
  'Jun': 5,
  'Jul': 6,
  'Aug': 7,
  'Sep': 8,
  'Oct': 9,
  'Nov': 10,
  'Dec': 11
};

const dateRange = /^(\d\d)([a-zA-Z]{3})(\d\d\d\d)\-(\d\d)([a-zA-Z]{3})(\d\d\d\d)$/;

export function parseDateRange(s) {
  if (typeof s === 'string') {
    let p = s.match(dateRange);
    if (p && p.length && MONTH[p[2]] !== undefined && MONTH[p[5]] !== undefined) {
      let dEnd = new Date(Date.UTC(p[6], MONTH[p[5]], p[4]));
      return [new Date(Date.UTC(p[3], MONTH[p[2]], p[1])), new Date(dEnd.getTime())];
    }
  }
}

export function compare(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  }
  return 0;
}

export function compareDwell(a, b) {
  return compare(parseInt(a, 10), parseInt(b, 10));
}

/**
 * Retrieves the value in the object specified by the key path
 * @param object the object
 * @param rest {String, or array of strings, or strings} the path
 * @param [opts.throw] {boolean}
 * @param [opts.src] {String}
 * @returns {*} the value
 */
export function getPropertyValue(object, ...rest) {
  let a = [];
  let opts = {};
  rest.forEach(arg => {
    if (isString(arg)) {
      arg = arg.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
      arg = arg.replace(/^\./, '');           // strip a leading dot
      let args = arg.split('.');
      a = [...a, ...args];
    } else if (Array.isArray(arg)) {
      a = [...a, ...arg];
    } else if (isObject(arg)) {
      opts = arg;
    }
  });
  let obj = object;
  for (let i = 0, n = a.length; i < n; ++i) {
    let k = a[i];
    if (obj && k in obj) {
      obj = obj[k];
    } else {
      if (opts.throw) {
        throw new Error(`Property ${a.join('.')} not found in ${opts.src ? opts.src : 'object'}`);
      }
      return;
    }
  }
  return obj;
}

export function setPropertyValue(object, prop, value, opts = {}) {
  let a = [];
  if (isString(prop)) {
    prop = prop.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    prop = prop.replace(/^\./, '');           // strip a leading dot
    let args = prop.split('.');
    a = [...a, ...args];
  } else if (Array.isArray(prop)) {
    a = [...a, ...prop];
  }
  let obj = object;
  let n = a.length;
  for (let i = 0; i < n; ++i) {
    let k = a[i];
    if (obj) {
      if (!(k in obj)) {
        obj[k] = {};
      }
      obj = obj[k];
    }
  }
  obj = value;
}

export function deepCopy(a) {
  if (a === undefined || a === null) {
    return a;
  } else if (typeof a === 'number' || typeof a === 'string') {
    return a;
  } else if (a instanceof Date || a instanceof RegExp) {
    return a;
  } else if (Array.isArray(a)) {
    let result = [];
    for (let adx = 0; adx < a.length; adx++) {
      result.push(a[adx]);
    }
    return result;
  } else if (isObject(a)) {
    let result2 = {};
    Object.keys(a).forEach(key => {
      result2[key] = deepCopy(a[key]);
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
export function deepEquals(a, b) {
  let aSet = isSet(a);
  let bSet = isSet(b);
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
  let ka = Object.keys(a);
  let kb = Object.keys(b);
  if (kb.length === ka.length) {
    return ka.every(k => {
      return deepEquals(a[k], b[k]);
    });
  }
  return false;
}

/**
 * Compares two arrays of strings and returns a list of those strings that are
 * in arr1 but missing from arr2 (missing) and those strings that are in arr2
 * but missing from arr1 (extra).
 * @param {Array} arr1 - Array of strings
 * @param {Array} arr2 - Array of strings
 * @return { missing: [], extra: [] } - List of strings in arr1 that are missing
 * and extra to arr2.
 */
export function compareArray(arr1, arr2) {
  if (Array.isArray(arr1) && Array.isArray(arr2)) {
    return {
      missing: arr1.filter(val1 => {
        return arr2.includes(val1) ? false : true;
      }),
      extra: arr2.filter(val2 => {
        return arr1.includes(val2) ? false : true;
      })
    };
  } else if (Array.isArray(arr1)) {
    return { missing: [...arr1], extra: [] };
  } else if (Array.isArray(arr2)) {
    return { missing: [], extra: [...arr2] };
  }
  return { missing: [], extra: [] };
}

export function isSet(a) {
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
