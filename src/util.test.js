import {isString} from '../src/lib/util';

describe('util', () => {

  it('isString', () => {
    expect(isString('string')).toBe(true);
    expect(isString(4)).toBe(false);
  });


});