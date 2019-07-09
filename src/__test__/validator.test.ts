import { Validator } from '../validator';
import { GenericObject } from '../lib/util';

const RULE = {
  number: { type: 'number', min: 5, max: 10 }
};

describe('validator', () => {

  it('validate integer pass', () => {
    let changes: GenericObject = {};
    let validator = new Validator(changes);
    validator.input(9).name('a').validate(RULE.number)
    expect(validator.hasErrors).toBe(false);
    expect(changes.a).toBe(9);
  });

  it('validate integer max', () => {
    let changes: GenericObject = {};
    let validator = new Validator(changes);
    validator.input(42).name('a').validate(RULE.number)
    expect(validator.hasErrors).toBe(true);
    expect(validator.errors.length).toBe(1);
    expect(validator.errors[0]).toEqual({ key: 'a', type: 'max', max: 10 });
    expect(changes.a).toBeUndefined();
  });

});