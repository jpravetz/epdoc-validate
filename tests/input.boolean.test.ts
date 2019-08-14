import { InputValidator } from '../src/input-validator';
import { Dict } from 'epdoc-util';

describe('input', () => {
  describe('boolean', () => {
    it('simple', () => {
      const RULE = { type: 'boolean', sanitize: true };
      let changes: Dict = {};
      let validator = new InputValidator(changes);
      validator
        .input('short')
        .name('a')
        .validate(RULE);
      validator
        .input(false)
        .name('b')
        .validate(RULE);
      validator
        .input(3)
        .name('c')
        .validate(RULE);
      validator
        .input(0)
        .name('d')
        .validate(RULE);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'invalid' });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(false);
      expect(changes.c).toBe(true);
      expect(changes.d).toBe(false);
    });
  });
});
