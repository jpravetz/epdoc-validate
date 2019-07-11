# validate
Validation module

## Features

- allows defaults to be specified
- recursively handles objects with propertie
- supports pre-canned validators
- supports sanitizing
- reports on all errors, not stopping at first error
- supports comparing values against a reference document (eg. to save only changes to a document)


## Usage

```js
const RULES = {
  title: { type: 'string' },
  opacity: { type: 'number', min: 0, max: 1, default: 1 },
}
let changes = {};
let reference = { 
  title: 'old title',
  opacity: 0.5
};
let validator = new Validator(changes);
validator.reference(reference)
validator.name('title').input('new title').validate(RULES.title);
validator.name('opacity').input(0.5).validate(RULES.opacity);
console.log(changes);
# changes = { title: 'new title' };
```

## Dev

To build and watch

```sh
npm run dev
```

To run tests

```sh
npm test
```
