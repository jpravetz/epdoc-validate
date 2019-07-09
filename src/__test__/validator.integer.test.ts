import { Validator } from '../validator';
import { GenericObject } from '../lib/util';


describe('validator number', () => {

  describe('input', () => {

    const RULE = {
      number: { type: 'number', min: 5, max: 10.3 },
      integer: { type: 'integer', min: 5, max: 10 },
      integer1: { type: 'integer', min: 5, max: 100, optional: true, strict: true },
      integer2: { type: 'integer', min: 5, max: 100, strict: true },
      integer3: { type: 'integer', min: 5, max: 100, strict: true, required: true },
      number5: { type: 'number', min: 5, max: 100, strict: true, required: true, default: 11.3 }
    };

    it('pass', () => {
      let changes: GenericObject = {};
      let num = RULE.number.min + 3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.number)
      expect(validator.hasErrors).toBe(false);
      expect(changes.a).toBe(num);
    });

    it('max fail', () => {
      let changes: GenericObject = {};
      let validator = new Validator(changes);
      validator.input(RULE.number.max + 42).name('a').validate(RULE.number)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'max', max: RULE.number.max });
      expect(changes.a).toBeUndefined();
    });

    it('min fail', () => {
      let changes: GenericObject = {};
      let num = RULE.number.min - 42.3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.number)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'min', min: RULE.number.min });
      expect(changes.a).toBeUndefined();
    });

    it('integer pass', () => {
      let changes: GenericObject = {};
      let num = RULE.integer.min + 3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.integer)
      expect(validator.hasErrors).toBe(false);
      expect(changes.a).toBe(num);
    });

    it('integer min fail', () => {
      let changes: GenericObject = {};
      let num = RULE.integer.min - 42;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.integer)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'min', min: RULE.integer.min });
      expect(changes.a).toBeUndefined();
    });

    it('integer invalid fail', () => {
      let changes: GenericObject = {};
      let num = 3.2;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.integer)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'invalid' });
      expect(changes.a).toBeUndefined();
    });

    it('integer optional pass', () => {
      let changes: GenericObject = {};
      let num = RULE.integer1.min + 3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.integer1)
      expect(validator.hasErrors).toBe(false);
      expect(changes.a).toBe(num);
    });

    it('integer strict optional fail', () => {
      let changes: GenericObject = {};
      let num = RULE.integer2.min + 3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.integer2)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'a', type: 'notAllowed' });
      expect(changes.a).toBeUndefined();
    });

    it('integer strict fail', () => {
      let changes: GenericObject = {};
      let num = RULE.integer3.min + 3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.integer3)
      validator.input(undefined).name('b').validate(RULE.integer3)
      expect(validator.hasErrors).toBe(true);
      expect(validator.errors.length).toBe(1);
      expect(validator.errors[0]).toEqual({ key: 'b', type: 'missing or invalid' });
      expect(changes.a).toBe(num);
      expect(changes.b).toBeUndefined();
    });

    it('integer strict default', () => {
      let changes: GenericObject = {};
      let num = RULE.number5.min + 3;
      let validator = new Validator(changes);
      validator.input(num).name('a').validate(RULE.number5)
      validator.input(undefined).name('b').validate(RULE.number5)
      expect(validator.hasErrors).toBe(false);
      expect(changes.a).toBe(num);
      expect(changes.b).toBe(String(RULE.number5.default));
    });
  });

  describe('property', () => {

    const RULE = {
      main: {
        type: 'object',
        properties: {
          a: { type: 'integer', min: 5, max: 10 },
          b: { type: 'integer', min: 5, max: 100, optional: true, strict: true },
          c: { type: 'integer', min: 5, max: 100, strict: true },
          d: { type: 'integer', min: 5, max: 100, strict: true, required: true },
          e: { type: 'number', min: 5, max: 100, strict: true, required: true, default: 11.3 }
        }
      },
    };
    const RESPONSE = {
      a: RULE.main.properties.a.min + 3
    };
    const EXPECTED = {
      a: RULE.main.properties.a.min + 3,
      e: RULE.main.properties.e.default
    };

    it('integer strict default', () => {
      let changes: GenericObject = {};
      let num = RULE.main.properties.a.min + 3;
      let validator = new Validator(changes);
      validator.response(RESPONSE).validate(RULE.main);
      expect(validator.errors[0]).toEqual({ key: 'b', type: 'missing or invalid' });
      expect(validator.hasErrors).toBe(false);
      expect(changes).toEqual(EXPECTED);
    });

  });
});