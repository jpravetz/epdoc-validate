import { GenericObject } from '../src/lib/util';
import { InputValidator } from '../src/input-validator';

describe('input', () => {
  describe('string', () => {
    it('simple', () => {
      const RULE1 = { type: 'string', min: 6, max: 10 };
      const RULE2 = { type: 'string', min: 5, max: 100 };
      let i0 = 'short';
      let changes: GenericObject = {};
      let validator = new InputValidator(changes);
      validator
        .input(i0)
        .name('a')
        .validate(RULE1);
      validator
        .input(i0)
        .name('b')
        .validate(RULE2);
      expect(validator.hasErrors()).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', min: 6, type: 'lenMin' });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i0);
    });

    it('email', () => {
      const RULE = { type: 'string', format: 'email' };
      let changes: GenericObject = {};
      let i0 = 'short';
      let i1 = 'bob@test.com';
      let validator = new InputValidator(changes);
      validator
        .input(i0)
        .name('a')
        .validate(RULE);
      validator
        .input(i1)
        .name('b')
        .validate(RULE);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({
        key: 'a',
        reason: 'invalid',
        type: 'string'
      });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i1);
    });

    it('url', () => {
      const RULE = { type: 'string', format: 'url' };
      let changes: GenericObject = {};
      let i0 = 'http:/invalid.com';
      let i1 = 'http://valid.com';
      let validator = new InputValidator(changes);
      validator
        .input(i0)
        .name('a')
        .validate(RULE);
      validator
        .input(i1)
        .name('b')
        .validate(RULE);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({
        key: 'a',
        reason: 'invalid',
        type: 'string'
      });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i1);
    });

    it('username', () => {
      const RULE = { type: 'string', format: 'username' };
      let changes: GenericObject = {};
      let i1 = 'validusername';
      let validator = new InputValidator(changes);
      validator
        .input('Invalid$username')
        .name('a')
        .validate(RULE);
      validator
        .input(i1)
        .name('b')
        .validate(RULE);
      validator
        .input('x')
        .name('c')
        .validate(RULE);
      expect(validator.errors.length).toBe(2);
      expect(validator.errors[0]).toEqual({
        key: 'a',
        reason: 'invalid',
        type: 'string'
      });
      expect(validator.errors[1]).toEqual({
        key: 'c',
        reason: 'invalid',
        type: 'string'
      });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i1);
      expect(changes.c).toBeUndefined();
    });
  });
});
