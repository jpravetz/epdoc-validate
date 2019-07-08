import {
  validSchemaTypes, validateType, deepEquals
} from '../util';

describe('schema util', () => {

  it('validSchemaTypes', () => {
    let x = validSchemaTypes;
    let result = deepEquals(x, ['string', 'number', 'boolean', 'null', 'object', 'array', 'date', 'any', 'integer']);
    expect(result).toBe(true);
  });


  it('validateType', () => {
    expect(validateType('string', 'string')).toBe(true);
    expect(validateType('string', 'string|number')).toBe(true);
    expect(validateType(4, 'string|number')).toBe(true);
    expect(validateType({}, 'string|number')).toBe(false);
    expect(validateType({}, 'object|number')).toBe(true);
    expect(validateType(new Date(), 'string|date')).toBe(true);
    expect(validateType(new Date(), 'string|object')).toBe(false);
    expect(validateType(['a'], ['string', 'object'])).toBe(false);
    expect(validateType(['a'], ['string', 'array'])).toBe(true);
    expect(validateType(['a'], 'array')).toBe(true);
  });

});