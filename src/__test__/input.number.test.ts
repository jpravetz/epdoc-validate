import { Validator } from '../validator';
import { GenericObject } from '../lib/util';


describe('validator input', () => {

  describe('number', () => {

    const RULE = {
      number: { type: 'number', min: 5, max: 10.3 },
      integer: { type: 'integer', min: 5, max: 10 },
      integer1: { type: 'integer', min: 5, max: 100, optional: true, strict: true },
      integer2: { type: 'integer', min: 5, max: 100, strict: true },
      integer3: { type: 'integer', min: 5, max: 100, strict: true, required: true },
      number5: { type: 'number', min: 5.2, max: 100, strict: true, required: true, default: 11.3 }
    };

    it('pass', () => {
      let changes: GenericObject = {};
      let num = RULE.number.min + 3;
      let validator = new InputValidator(changes);
      validator.input(num).name('a').validate(RULE.number)
      expect(validator.hasErrors).toBe(false);
      expect(changes.a).toBe(num);
    });

    it('max fail', () => {
      let changes: GenericObject = {};
      let validator = new InputValidator(changes);
      validator.input(RULE.number.max + 42).name('a').validate(RULE.number)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'max', max: RULE.number.max });
      expect(changes.a).toBeUndefined();
    });

    it('min fail', () => {
      let changes: GenericObject = {};
      let num = RULE.number.min - 42.3;
      let validator = new InputValidator(changes);
      validator.input(num).name('a').validate(RULE.number)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'min', min: RULE.number.min });
      expect(changes.a).toBeUndefined();
    });

    it('default', () => {
      let changes: GenericObject = {};
      let num = RULE.number5.min + 3;
      let validator = new InputValidator(changes);
      validator.input(String(num)).name('a').validate(RULE.number5)
      validator.input(undefined).name('b').validate(RULE.number5)
      expect(validator.hasErrors).toBe(false);
      expect(changes.a).toBe(num);
      expect(changes.b).toBe(RULE.number5.default);
    });

    describe('integer', () => {

      it('pass', () => {
        let changes: GenericObject = {};
        let num = RULE.integer.min + 3;
        let validator = new InputValidator(changes);
        validator.input(num).name('a').validate(RULE.integer)
        expect(validator.hasErrors).toBe(false);
        expect(changes.a).toBe(num);
      });

      it('min fail', () => {
        let changes: GenericObject = {};
        let num = RULE.integer.min - 42;
        let validator = new InputValidator(changes);
        validator.input(num).name('a').validate(RULE.integer)
        expect(validator.hasErrors).toBe(true);
        expect(validator.errors.length).toBe(1);
        expect(validator.errors[0]).toEqual({ key: 'a', type: 'min', min: RULE.integer.min });
        expect(changes.a).toBeUndefined();
      });

      it('valid cast', () => {
        let changes: GenericObject = {};
        let anum = RULE.integer.min + 0.2;
        let bnum = RULE.integer.min + 0.51;
        let validator = new InputValidator(changes);
        validator.input(anum).name('a').validate(RULE.integer)
        validator.input(bnum).name('b').validate(RULE.integer)
        expect(validator.hasErrors).toBe(false);
        expect(changes.a).toBe(Math.round(anum));
        expect(changes.b).toBe(Math.round(bnum));
      });

      it('optional pass', () => {
        let changes: GenericObject = {};
        let num = RULE.integer1.min + 3;
        let validator = new InputValidator(changes);
        validator.input(num).name('a').validate(RULE.integer1)
        expect(validator.hasErrors).toBe(false);
        expect(changes.a).toBe(num);
      });

      it('strict optional fail', () => {
        let changes: GenericObject = {};
        let num = RULE.integer2.min + 3;
        let validator = new InputValidator(changes);
        validator.input(num).name('a').validate(RULE.integer2)
        expect(validator.hasErrors).toBe(true);
        expect(validator.errors.length).toBe(1);
        expect(validator.errors[0]).toEqual({ key: 'a', type: 'notAllowed' });
        expect(changes.a).toBeUndefined();
      });

      it('strict fail', () => {
        let changes: GenericObject = {};
        let num = RULE.integer3.min + 3;
        let validator = new InputValidator(changes);
        validator.input(num).name('a').validate(RULE.integer3)
        validator.input(undefined).name('b').validate(RULE.integer3)
        expect(validator.hasErrors).toBe(true);
        expect(validator.errors.length).toBe(1);
        expect(validator.errors[0]).toEqual({ key: 'b', type: 'missing' });
        expect(changes.a).toBe(num);
        expect(changes.b).toBeUndefined();
      });

    });
  });

});