import { Validator } from '../validator';
import { GenericObject } from '../lib/util';


describe('validator property', () => {

  describe('number', () => {

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