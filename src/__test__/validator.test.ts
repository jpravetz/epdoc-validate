import { Validator } from '../validator';

const RULE = {
  number: { type: 'number', min: 5, max: 6 }
};

describe('validator', () => {

  it('constructor', () => {
    let changes = {};
    let validator = new Validator(changes);
    validator.input(42).name('a').validate(RULE.number)
    console.log('errors',validator.errors.length,validator.errors);
    expect(validator.hasErrors).toBe(false);
    expect(changes.a).toBe(42);
  });

});