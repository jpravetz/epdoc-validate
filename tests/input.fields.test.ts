import { IValidatorRuleParams, ValidatorType } from './../src/validator-rule';
import { Dict } from 'epdoc-util';
import { InputValidator } from '../src/input-validator';

const valRules: { [key: string]: IValidatorRuleParams } = {
  email: {
    name: 'email',
    format: 'email',
    required: true,
    max: 256,
    label: 'email address'
  },
  name: {
    name: 'name',
    format: 'fullname',
    required: true,
    min: 2,
    max: 128,
    label: 'full name'
  },
  username: {
    name: 'username',
    pattern: /^[a-z0-9]{2,}$/,
    min: 2,
    max: 32,
    default: 'undefined'
  },
  company: { name: 'company', format: 'title', default: 'undefined' },
  external_id: {
    name: 'external_id',
    label: 'External ID',
    pattern: /^.*$/,
    min: 1,
    max: 128,
    default: 'undefined'
  },
  esp_id: {
    name: 'esp_id',
    label: 'ESP ID',
    type: ValidatorType.string,
    format: 'posIntAsString',
    default: 'undefined'
  },
  privilege: {
    name: 'privilege',
    label: 'Global Permission',
    pattern: /^(none|globalView|globalAdmin)$/,
    default: 'undefined'
  }
};
const FIELDS = [
  'name',
  'email',
  'username',
  'external_id',
  'company',
  'esp_id',
  'privilege',
  'source',
  'source_other'
];

describe('input', () => {
  describe('fields', () => {
    it('pass', () => {
      let changes: Dict = {};
      let data: Dict = {
        name: 'Bob Smith',
        email: 'bob@smith.com',
        username: undefined,
        external_id: 'provider_id:123455',
        company: 'Acme',
        esp_id: null,
        privilege: null,
        source: null,
        source_other: null
      };
      let validator = new InputValidator(changes);
      FIELDS.forEach(field => {
        if (valRules[field]) {
          validator.input(data[field]).validate(valRules[field]);
        }
      });
      expect(validator.errors).toStrictEqual([]);
      expect(validator.errors.length).toBe(0);
      expect(validator.hasErrors()).toBe(false);
    });
  });
});
