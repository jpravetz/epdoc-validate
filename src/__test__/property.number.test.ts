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
      a: RULE.main.properties.a.min + 3,
      d: RULE.main.properties.d.min + 27.25
    };
    const EXPECTED = {
      response: {
        a: RESPONSE.a,
        d: RESPONSE.d,
        e: RULE.main.properties.e.default
      }
    };

    it('integer strict default', () => {
      let changes: GenericObject = {};
      let validator = new Validator(changes);
      validator.response(RESPONSE).name('response').validate(RULE.main);
      expect(validator.hasErrors).toBe(false);
      expect(changes).toEqual(EXPECTED);
    });

  });
});