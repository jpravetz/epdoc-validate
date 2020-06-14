import { Dict } from 'epdoc-util';
import { InputValidator } from '../src/input-validator';
import { ValidatorRuleLibrary, ValidatorType } from './../src/validator-rule';

const externalLibrary: ValidatorRuleLibrary = {
  username: { type: ValidatorType.string, pattern: /^[a-z0-9]{2,}$/ }
};

describe('input', () => {
  describe('string', () => {
    it('simple', () => {
      const RULE1 = { type: ValidatorType.string, min: 6, max: 10 };
      const RULE2 = { type: ValidatorType.string, min: 5, max: 100 };
      let i0 = 'short';
      let changes: Dict = {};
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
      expect(validator.errors[0]).toEqual({
        key: 'a',
        params: { min: 6 },
        type: 'lenMin'
      });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i0);
    });

    it('null', () => {
      const RULE1 = [{ type: ValidatorType.string }];
      let i0 = null;
      let i1 = 'a string ';
      let changes: Dict = {};
      let validator = new InputValidator(changes);
      validator
        .input(i0)
        .name('a')
        .validate(RULE1);
      validator
        .input(i1)
        .name('b')
        .validate(RULE1);
      expect(validator.hasErrors()).toBe(false);
      expect(changes.a).toBe(undefined);
      expect(changes.b).toBe(i1.trim());
    });
    it('email', () => {
      const RULE = { type: ValidatorType.string, format: 'email' };
      let changes: Dict = {};
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
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'invalid' });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i1);
    });

    it('url', () => {
      const RULE = { type: ValidatorType.string, format: 'url' };
      let changes: Dict = {};
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
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'invalid' });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i1);
    });

    it('username', () => {
      const RULE = { type: ValidatorType.string, format: 'username' };
      let changes: Dict = {};
      let i1 = 'validusername';
      let validator = new InputValidator(changes);
      validator.addRuleLibrary(externalLibrary);
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
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'invalid' });
      expect(validator.errors[1]).toEqual({ key: 'c', type: 'invalid' });
      expect(changes.a).toBeUndefined();
      expect(changes.b).toBe(i1);
      expect(changes.c).toBeUndefined();
    });
  });
});
