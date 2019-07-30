import { Util } from '../src/lib/util';

describe('schema util', () => {
  it('validSchemaTypes', () => {
    let x = Util.validSchemaTypes;
    let result = Util.deepEquals(x, [
      'string',
      'number',
      'boolean',
      'null',
      'object',
      'array',
      'date',
      'any',
      'integer'
    ]);
    expect(result).toBe(true);
  });

  it('validateType', () => {
    expect(Util.validateType('string', 'string')).toBe(true);
    expect(Util.validateType('string', 'string|number')).toBe(true);
    expect(Util.validateType(4, 'string|number')).toBe(true);
    expect(Util.validateType({}, 'string|number')).toBe(false);
    expect(Util.validateType({}, 'object|number')).toBe(true);
    expect(Util.validateType(new Date(), 'string|date')).toBe(true);
    expect(Util.validateType(new Date(), 'string|object')).toBe(false);
    expect(Util.validateType(['a'], ['string', 'object'])).toBe(false);
    expect(Util.validateType(['a'], ['string', 'array'])).toBe(true);
    expect(Util.validateType(['a'], 'array')).toBe(true);
  });
});
