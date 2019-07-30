import { Util } from '../src/lib/util';
import { ResponseValidator } from '../src/response-validator';

describe('response', () => {
  describe('primitive', () => {
    describe('number', () => {
      it('number pass', () => {
        const RULE = {
          type: 'number',
          min: 5,
          max: 10
        };
        const RESPONSE = 8.2;
        const EXPECTED = 8.2;
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(RULE);
        expect(validator.hasErrors()).toBe(false);
        expect(validator.output).toEqual(EXPECTED);
      });

      it('int', () => {
        const RULE = {
          type: 'number',
          min: 5,
          max: 10
        };
        const RESPONSE = 8;
        const EXPECTED = 8;
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(RULE);
        expect(validator.hasErrors()).toBe(false);
        expect(validator.output).toEqual(EXPECTED);
      });
    });
  });

  describe('object', () => {
    describe('number', () => {
      const RULE = {
        type: 'object',
        properties: {
          a: { type: 'integer', min: 5, max: 10 },
          b: { type: 'integer', min: 5, max: 100, optional: true, strict: true },
          c: { type: 'integer', min: 5, max: 100, strict: true },
          d: { type: 'integer', min: 5, max: 100, strict: true, required: true },
          e: {
            type: 'number',
            min: 5,
            max: 100,
            strict: true,
            required: true,
            default: 11.3
          }
        }
      };
      const RESPONSE = {
        a: RULE.properties.a.min + 3,
        d: RULE.properties.d.min + 27
      };
      const EXPECTED = {
        a: RESPONSE.a,
        d: RESPONSE.d,
        e: RULE.properties.e.default
      };

      it('integer strict default', () => {
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(RULE);
        expect(validator.hasErrors()).toBe(false);
        expect(validator.output).toEqual(EXPECTED);
      });

      it('integer strict required no default', () => {
        let rule = Util.deepCopy(RULE);
        rule.properties.e.default = undefined;
        let expected = Util.deepCopy(EXPECTED);
        expected.e = undefined;
        let validator = new ResponseValidator();
        validator.input(RESPONSE).validate(rule);
        expect(validator.errors.length).toBe(1);
        expect(validator.output).toEqual(expected);
      });
    });
  });
});
