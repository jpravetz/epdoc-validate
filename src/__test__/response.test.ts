import { ResponseValidator } from '../response-validator';
import { GenericObject } from '../lib/util';


describe('response', () => {

  describe('primitive', () => {
    describe('number', () => {

      it('number pass', () => {
        const RULE = {
          type: 'number', min: 5, max: 10
        };
        const RESPONSE = 8.2;
        const EXPECTED = 8.2;
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(RULE);
        expect(validator.hasErrors()).toBe(false);
        expect(validator.output.toEqual(EXPECTED));
      });

      it('int', () => {
        const RULE = {
          type: 'number', min: 5, max: 10
        };
        const RESPONSE = 8;
        const EXPECTED = 8;
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(RULE);
        expect(validator.hasErrors()).toBe(false);
        expect(validator.output()).toEqual(EXPECTED);
      });

    });
  });

  describe('object', () => {
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
        d: RULE.main.properties.d.min + 27
      };
      const EXPECTED = {
        response: {
          a: RESPONSE.a,
          d: RESPONSE.d,
          e: RULE.main.properties.e.default
        }
      };

      it('integer strict default', () => {
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(RULE.main);
        expect(validator.hasErrors).toBe(false);
        expect(validator.output()).toEqual(EXPECTED);
      });

    });
  });
});