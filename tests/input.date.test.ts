import { GenericObject } from '../src/lib/util';
import { InputValidator } from '../src/input-validator';

describe('input', () => {
  describe('date', () => {
    it('sanitize', () => {
      const RULE = { type: 'date', sanitize: true };
      let i0 = new Date(2001, 1);
      let i1 = '2019-07-26T19:34:03.258Z';
      let changes: GenericObject = {};
      let validator = new InputValidator(changes);
      validator
        .input('not a date')
        .name('a')
        .validate(RULE);
      validator
        .input(i0)
        .name('b')
        .validate(RULE);
      validator
        .input(3)
        .name('c')
        .validate(RULE);
      validator
        .input(i1)
        .name('d')
        .validate(RULE);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({
        key: 'a',
        type: 'invalid'
      });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toStrictEqual(i0);
      expect(changes.c).toStrictEqual(new Date(3));
      expect(changes.d).toStrictEqual(new Date(i1));
    });
  });
});
