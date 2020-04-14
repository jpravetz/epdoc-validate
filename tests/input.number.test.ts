import { ValidatorType, ValidatorRule } from './../src/validator-rule';
import { InputValidator } from '../src/input-validator';
import { Dict } from 'epdoc-util';

describe('input', () => {
  describe('number', () => {
    const RULE = {
      number: { type: ValidatorType.number, min: 5, max: 10.3 },
      integer: { type: ValidatorType.integer, min: 5, max: 10 },
      integer1: {
        type: ValidatorType.integer,
        min: 5,
        max: 100,
        optional: true,
        strict: true
      },
      integer2: { type: ValidatorType.integer, min: 5, max: 100, strict: true },
      integer3: {
        type: ValidatorType.integer,
        min: 5,
        max: 100,
        strict: true,
        required: true
      },
      integer4: {
        name: 'f',
        type: ValidatorType.integer,
        strict: true,
        required: true,
        sanitize: (val: any, rule: ValidatorRule) => {
          return val === true || val === 'true' ? 1 : 0;
        }
      },
      number5: {
        type: ValidatorType.number,
        min: 5.2,
        max: 100,
        strict: true,
        required: true,
        default: 11.3
      }
    };

    it('pass', () => {
      let changes: Dict = {};
      let num = RULE.number.min + 3;
      let validator = new InputValidator(changes);
      validator
        .input(num)
        .name('a')
        .validate(RULE.number);
      expect(validator.hasErrors()).toBe(false);
      expect(changes.a).toBe(num);
    });

    it('max fail', () => {
      let changes: Dict = {};
      let validator = new InputValidator(changes);
      validator
        .input(RULE.number.max + 42)
        .name('a')
        .validate(RULE.number);
      expect(validator.hasErrors()).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({
        key: 'a',
        type: 'max',
        params: { max: RULE.number.max }
      });
      expect(changes.a).toBeUndefined();
    });

    it('min fail', () => {
      let changes: Dict = {};
      let num = RULE.number.min - 42.3;
      let validator = new InputValidator(changes);
      validator
        .input(num)
        .name('a')
        .validate(RULE.number);
      expect(validator.hasErrors()).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({
        key: 'a',
        type: 'min',
        params: { min: RULE.number.min }
      });
      expect(changes.a).toBeUndefined();
    });

    it('default', () => {
      let changes: Dict = {};
      let num = RULE.number5.min + 3;
      let validator = new InputValidator(changes);
      validator
        .input(String(num))
        .name('a')
        .validate(RULE.number5);
      validator
        .input(undefined)
        .name('b')
        .validate(RULE.number5);
      expect(validator.hasErrors()).toBe(false);
      expect(changes.a).toBe(num);
      expect(changes.b).toBe(RULE.number5.default);
    });

    describe('integer', () => {
      it('pass', () => {
        let changes: Dict = {};
        let num = RULE.integer.min + 3;
        let validator = new InputValidator(changes);
        validator
          .input(num)
          .name('a')
          .validate(RULE.integer);
        expect(validator.hasErrors()).toBe(false);
        expect(changes.a).toBe(num);
      });

      it('min fail', () => {
        let changes: Dict = {};
        let num = RULE.integer.min - 42;
        let validator = new InputValidator(changes);
        validator
          .input(num)
          .name('a')
          .validate(RULE.integer);
        expect(validator.hasErrors()).toBe(true);
        expect(validator.errors.length).toBe(1);
        expect(validator.errors[0]).toEqual({
          key: 'a',
          type: 'min',
          params: { min: RULE.integer.min }
        });
        expect(changes.a).toBeUndefined();
      });

      it('valid cast', () => {
        let changes: Dict = {};
        let anum = RULE.integer.min + 0.2;
        let bnum = RULE.integer.min + 0.51;
        let validator = new InputValidator(changes);
        validator
          .input(anum)
          .name('a')
          .validate(RULE.integer);
        validator
          .input(bnum)
          .name('b')
          .validate(RULE.integer);
        expect(validator.hasErrors()).toBe(false);
        expect(changes.a).toBe(Math.round(anum));
        expect(changes.b).toBe(Math.round(bnum));
      });

      it('valid sanitize', () => {
        let changes: Dict = {};
        let anum = 'true';
        let bnum = true;
        let cnum = 'false';
        let dnum = false;
        let fnum = 'whatever';
        let validator = new InputValidator(changes);
        validator
          .input(anum)
          .name('a')
          .validate(RULE.integer4);
        validator
          .input(bnum)
          .name('b')
          .validate(RULE.integer4);
        validator
          .input(cnum)
          .name('c')
          .validate(RULE.integer4);
        validator
          .input(dnum)
          .name('d')
          .validate(RULE.integer4);
        validator.input(fnum).validate(RULE.integer4);
        expect(validator.hasErrors()).toBe(false);
        expect(changes.a).toBe(1);
        expect(changes.b).toBe(1);
        expect(changes.c).toBe(0);
        expect(changes.d).toBe(0);
        expect(changes.f).toBe(0);
      });

      it('optional pass', () => {
        let changes: Dict = {};
        let num = RULE.integer1.min + 3;
        let validator = new InputValidator(changes);
        validator
          .input(num)
          .name('a')
          .validate(RULE.integer1);
        expect(validator.hasErrors()).toBe(false);
        expect(changes.a).toBe(num);
      });

      it('strict optional fail', () => {
        let changes: Dict = {};
        let num = RULE.integer2.min + 3;
        let validator = new InputValidator(changes);
        validator
          .input(num)
          .name('a')
          .validate(RULE.integer2);
        expect(validator.hasErrors()).toBe(true);
        expect(validator.errors.length).toBe(1);
        expect(validator.errors[0]).toEqual({ key: 'a', type: 'notAllowed' });
        expect(changes.a).toBeUndefined();
      });

      it('strict fail', () => {
        let changes: Dict = {};
        let num = RULE.integer3.min + 3;
        let validator = new InputValidator(changes);
        validator
          .input(num)
          .name('a')
          .validate(RULE.integer3);
        validator
          .input(undefined)
          .name('b')
          .validate(RULE.integer3);
        expect(validator.hasErrors()).toBe(true);
        expect(validator.errors.length).toBe(1);
        expect(validator.errors[0]).toEqual({ key: 'b', type: 'missing' });
        expect(changes.a).toBe(num);
        expect(changes.b).toBeUndefined();
      });
    });
  });
});
