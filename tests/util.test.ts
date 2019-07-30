import { Util } from '../src/lib/util';

describe('util basic', () => {
  const obj = {
    a: 'b',
    c: 'd',
    e: 4
  };

  it('Util.isString', () => {
    expect(Util.isString('string')).toBe(true);
    expect(Util.isString({ a: 'string' }, 'a')).toBe(true);
    expect(Util.isString({ a: { b: 'string' } }, 'a.b')).toBe(true);
    expect(Util.isString({ a: { b: 'string' } }, 'a.c')).toBe(false);
    expect(Util.isString(4)).toBe(false);
  });

  it('Util.isNonEmptyString', () => {
    let s = 'my string';
    expect(Util.isNonEmptyString(s)).toBe(true);
    expect(s).toEqual('my string');
    expect(Util.isNonEmptyString('')).toBe(false);
    expect(Util.isNonEmptyString(null)).toBe(false);
    expect(Util.isNonEmptyString(4)).toBe(false);
  });

  it('Util.isArray', () => {
    expect(Util.isArray(['string'])).toBe(true);
    expect(Util.isArray(4)).toBe(false);
    expect(Util.isArray({ a: 'string' })).toBe(false);
  });

  it('Util.isBoolean', () => {
    expect(Util.isBoolean(false)).toBe(true);
    expect(Util.isBoolean(undefined)).toBe(false);
  });

  it('Util.isNumber', () => {
    expect(Util.isNumber(4)).toBe(true);
    expect(Util.isNumber(NaN)).toBe(false);
    expect(Util.isNumber({})).toBe(false);
  });

  it('isPosNumber', () => {
    expect(Util.isPosNumber(4)).toBe(true);
    expect(Util.isPosNumber(NaN)).toBe(false);
    expect(Util.isPosNumber(-0.01)).toBe(false);
    expect(Util.isPosNumber(0)).toBe(false);
  });

  it('isInteger', () => {
    expect(Util.isInteger(4)).toBe(true);
    expect(Util.isInteger(NaN)).toBe(false);
    expect(Util.isInteger(0.2)).toBe(false);
    expect(Util.isInteger(0)).toBe(true);
    expect(Util.isInteger(-1)).toBe(true);
  });

  it('isFunction', () => {
    expect(Util.isFunction({})).toBe(false);
    expect(Util.isFunction(3)).toBe(false);
    expect(Util.isFunction(false)).toBe(false);
    expect(Util.isFunction(() => {})).toBe(true);
  });

  it('isNull', () => {
    expect(Util.isNull(null)).toBe(true);
    expect(Util.isNull(false)).toBe(false);
    expect(Util.isNull(() => {})).toBe(false);
  });

  it('isDefined', () => {
    expect(Util.isDefined(null)).toBe(true);
    expect(Util.isDefined(undefined)).toBe(false);
    expect(Util.isDefined(false)).toBe(true);
    expect(Util.isDefined(() => {})).toBe(true);
  });

  it('Util.hasValue', () => {
    expect(Util.hasValue('test')).toBe(true);
    expect(Util.hasValue(NaN)).toBe(true);
    expect(Util.hasValue(0.2)).toBe(true);
    expect(Util.hasValue(0)).toBe(true);
    expect(Util.hasValue(undefined)).toBe(false);
    expect(Util.hasValue(null)).toBe(false);
    expect(Util.hasValue({})).toBe(true);
  });

  it('isRegExp', () => {
    expect(Util.isRegExp(/^.*$/)).toBe(true);
    expect(Util.isRegExp({})).toBe(false);
    expect(Util.isRegExp(false)).toBe(false);
    expect(Util.isRegExp(Date.now())).toBe(false);
    expect(Util.isRegExp(() => {})).toBe(false);
  });

  it('isObject', () => {
    expect(Util.isObject(/^.*$/)).toBe(false);
    expect(Util.isObject({})).toBe(true);
    expect(Util.isObject([])).toBe(false);
    expect(Util.isObject(false)).toBe(false);
    expect(Util.isRegExp(Date.now())).toBe(false);
    expect(Util.isObject(() => {})).toBe(false);
    expect(Util.isObject(undefined)).toBe(false);
  });

  it('isDate', () => {
    expect(Util.isDate(/^.*$/)).toBe(false);
    expect(Util.isDate({})).toBe(false);
    expect(Util.isDate(false)).toBe(false);
    expect(Util.isDate(233433)).toBe(false);
    expect(Util.isDate(new Date())).toBe(true);
    expect(Util.isDate(() => {})).toBe(false);
  });

  it('isError', () => {
    expect(Util.isError(/^.*$/)).toBe(false);
    expect(Util.isError({})).toBe(false);
    expect(Util.isError(false)).toBe(false);
    expect(Util.isError(new Error())).toBe(true);
    expect(Util.isError(() => {})).toBe(false);
  });

  it('pick and deepEquals', () => {
    let result1 = Util.deepEquals(Util.pick(obj, 'a', 'e'), { a: 'b', e: 4 });
    expect(result1).toBe(true);
    let result2 = Util.deepEquals(Util.pick(obj, 'a', 'e'), { a: 'b', e: 5 });
    expect(result2).toBe(false);
    let result3 = Util.deepEquals(Util.pick(obj, ['a', 'c']), { a: 'b', c: 'd' });
    expect(result3).toBe(true);
  });

  it('omit and deepEquals', () => {
    let result1 = Util.deepEquals(Util.omit(obj, 'a', 'e'), { c: 'd' });
    expect(result1).toBe(true);
    let result2 = Util.deepEquals(Util.omit(obj, 'e'), { a: 'b', c: 'd' });
    expect(result2).toBe(true);
    let result3 = Util.deepEquals(Util.omit(obj, ['a', 'c']), { e: 4 });
    expect(result3).toBe(true);
    let result4 = Util.deepEquals(Util.omit(obj, 'e'), { a: 'b', c: 'f' });
    expect(result4).toBe(false);
  });
});
