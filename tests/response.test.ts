import { ValidatorType } from './../src/validator-rule';
import { ResponseValidator } from '../src/response-validator';
import { Dict } from 'epdoc-util';
import * as fs from 'fs';

type TestResult = {
  response?: any;
  expected?: any;
  errors?: any[];
  description?: string;
};

type TestItem = TestResult & {
  description: string;
  rule: any;
};

function getTestData(): [string, TestItem][] {
  let result: [string, TestItem][] = [];
  let files = fs.readdirSync('./tests/response');
  files.forEach(file => {
    let parts = file.split('.');
    if (parts && parts.length >= 2 && parts[parts.length - 1] === 'json') {
      let item = readJson('./tests/response/' + file);
      if (Array.isArray(item.results)) {
        item.results.forEach((i: Dict) => {
          let testItem: TestItem = {
            description: [item.description, i.description].join(' '),
            rule: item.rule,
            response: i.response,
            expected: i.expected,
            errors: i.errors
          };
          result.push([testItem.description, testItem]);
        });
      } else {
        let testItem: TestItem = item;
        result.push([testItem.description, testItem]);
      }
    }
  });
  return result;
}

function readJson(path: string): any {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

describe('response', () => {
  describe('primitive', () => {
    describe('number', () => {
      test('number pass', () => {
        const RULE = {
          type: ValidatorType.number,
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

      test('int', () => {
        const RULE = {
          type: ValidatorType.number,
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

  describe('iterate', () => {
    let items: [string, TestItem][] = getTestData();

    test.each(items)('%s', (description, item: TestItem) => {
      if (item.rule && item.response) {
        if (!item.expected) {
          item.expected = item.response;
        }
        let validator = new ResponseValidator();
        validator.input(item.response).validate(item.rule);
        expect(validator.errors).toEqual(item.errors);
        expect(validator.output).toEqual(item.expected);
      }
    });
  });
});
