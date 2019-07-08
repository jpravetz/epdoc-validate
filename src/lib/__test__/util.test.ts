import {
  isString, isNonEmptyString, isBoolean, isArray, isInteger, isNumber, isPosNumber,
  isFunction, isRegExp, isObject, isDate, isNull, isDefined, isError, hasValue,
  omit, pick, deepEquals
} from '../util';

describe('util basic', () => {

  const obj = {
    a: 'b',
    c: 'd',
    e: 4
  }

  it('isString', () => {
    expect(isString('string')).toBe(true);
    expect(isString({ a: 'string' }, 'a')).toBe(true);
    expect(isString({ a: { b: 'string' } }, 'a.b')).toBe(true);
    expect(isString({ a: { b: 'string' } }, 'a.c')).toBe(false);
    expect(isString(4)).toBe(false);
  });

  it('isNonEmptyString', () => {
    let s = 'my string'
    expect(isNonEmptyString(s)).toBe(true);
    expect(s).toEqual('my string');
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(4)).toBe(false);
  });

  it('isArray', () => {
    expect(isArray(['string'])).toBe(true);
    expect(isArray(4)).toBe(false);
  });

  it('isBoolean', () => {
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(undefined)).toBe(false);
  });

  it('isNumber', () => {
    expect(isNumber(4)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber({})).toBe(false);
  });

  it('isPosNumber', () => {
    expect(isPosNumber(4)).toBe(true);
    expect(isPosNumber(NaN)).toBe(false);
    expect(isPosNumber(-.01)).toBe(false);
    expect(isPosNumber(0)).toBe(false);
  });

  it('isInteger', () => {
    expect(isInteger(4)).toBe(true);
    expect(isInteger(NaN)).toBe(false);
    expect(isInteger(.2)).toBe(false);
    expect(isInteger(0)).toBe(true);
    expect(isInteger(-1)).toBe(true);
  });

  it('isFunction', () => {
    expect(isFunction(false)).toBe(false);
    expect(isFunction(() => { })).toBe(true);
  });

  it('isNull', () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(false)).toBe(false);
    expect(isNull(() => { })).toBe(false);
  });

  it('isDefined', () => {
    expect(isDefined(null)).toBe(true);
    expect(isDefined(undefined)).toBe(false);
    expect(isDefined(false)).toBe(true);
    expect(isDefined(() => { })).toBe(true);
  });

  it('hasValue', () => {
    expect(hasValue('test')).toBe(true);
    expect(hasValue(NaN)).toBe(true);
    expect(hasValue(.2)).toBe(true);
    expect(hasValue(0)).toBe(true);
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue(null)).toBe(false);
    expect(hasValue({})).toBe(true);
  });

  it('isRegExp', () => {
    expect(isRegExp(/^.*$/)).toBe(true);
    expect(isRegExp({})).toBe(false);
    expect(isRegExp(false)).toBe(false);
    expect(isRegExp(Date.now())).toBe(false);
    expect(isRegExp(() => { })).toBe(false);
  });

  it('isObject', () => {
    expect(isObject(/^.*$/)).toBe(false);
    expect(isObject({})).toBe(true);
    expect(isObject(false)).toBe(false);
    expect(isRegExp(Date.now())).toBe(false);
    expect(isObject(() => { })).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });

  it('isDate', () => {
    expect(isDate(/^.*$/)).toBe(false);
    expect(isDate({})).toBe(false);
    expect(isDate(false)).toBe(false);
    expect(isDate(new Date())).toBe(true);
    expect(isDate(() => { })).toBe(false);
  });

  it('isError', () => {
    expect(isError(/^.*$/)).toBe(false);
    expect(isError({})).toBe(false);
    expect(isError(false)).toBe(false);
    expect(isError(new Error())).toBe(true);
    expect(isError(() => { })).toBe(false);
  });

  it('pick and deepEquals', () => {
    let result1 = deepEquals(pick(obj, 'a', 'e'), { a: 'b', e: 4 });
    expect(result1).toBe(true);
    let result2 = deepEquals(pick(obj, 'a', 'e'), { a: 'b', e: 5 });
    expect(result2).toBe(false);
    let result3 = deepEquals(pick(obj, ['a', 'c']), { a: 'b', c: 'd' });
    expect(result3).toBe(true);
  });

  it('omit and deepEquals', () => {
    let result1 = deepEquals(omit(obj, 'a', 'e'), { c: 'd' });
    expect(result1).toBe(true);
    let result2 = deepEquals(omit(obj, 'e'), { a: 'b', c: 'd' });
    expect(result2).toBe(true);
    let result3 = deepEquals(omit(obj, ['a', 'c']), { e: 4 });
    expect(result3).toBe(true);
    let result4 = deepEquals(omit(obj, 'e'), { a: 'b', c: 'f' });
    expect(result4).toBe(false);
  });

});