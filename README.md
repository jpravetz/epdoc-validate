# validate

Validation module validates individual values or properties of an object.

## Features

- Allows default values to be specified and used if a value has an error or is missing
- Options for `strict` checking, with `required` and `optional` properties
- Recursively handles objects with properties
- Supports pre-canned validators for url, email, etc
- Supports a sanitizer callback function
- Reports on all errors, not stopping at first error
- Attempts to build output even if errors are encountered
- Supports comparing values against a reference document (eg. to save only
  changes to a document)

## Sample Usage

## Usage

There are two main ways to use the validate module.

- To validate an object, for example a server response
  - Uses `ResponseValidator` class
- To validate individual UI input values and add them to an update object that
  will be sent to a server to update a document
  - Uses `InputValidator` class
  - All values will be cast to strings and trimmed of leading and trailing whitespace

### Example - Validating Server Response

```js
// To be written
```

### Example - Validating UI Input

```js
const RULES = {
  title: { type: 'string' },
  opacity: { type: 'number', min: 0, max: 1, default: 1, sanitize: true },
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

## Rule options

Rules will have the following options:

- `name` string - required for InputValidation, but can be specified via the
  name method
- `label` string - (_optional_), defaults to `name` and is used in errors to
  describe the input
- `type` string or array of strings or strings separated by '|', (_required_)
  must be one of the primitive types listed below
- `format` string - (_optional_) can be used to specify a predefined format
- `pattern` RegExp or Function - (_optional_) used to validate value
- `sanitize` Function, boolean or string - See below for more details
- `default` (_optional_) default value to use if value is invalid or missing
- `min` number - (_optional_) minimum string length or minimum number value
- `max` number - (_optional_) maximum string length or maximum number value
- `required` boolean - (_optional_) for objects indicates if the value is
  required to be set
- `optional` boolean - (_optional_) for objects indicates if the value is
  optional (relevant only when `strict` is true)
- `strict` boolean - (_optional_) for objects use strict testing
- `properties` GenericObject - (_optional_) a dictionary of properties that
  should recursively be checked on the value

Experimental Values (may be deprecated):

- `sanitize` any
- `arrayType` any // if an array, the entries must be of this type
- appendToArray boolean // for arrays
- `fromView` Callback // hook to allow value to be manipulated, eg converting
  0/1 to false/true XXX use sanitize instead

### Option Notes

#### type, format, pattern

- Type must be one of the following primitive types
  - `string`
  - `boolean`
  - `number`
  - `int` or `integer` - a number that is not a float
  - `date`
  - `null`
  - `object`
  - `array`
  - `any`
- Format must be one of the following predefined formats
  - `url`
  - `email`
  - `filename`
  - `username`
  - TODO: allow users to add their own predefined types
- If a predefined type, rule options set by the caller are merged with rule
  options set for the pre-defined rule
- Predefined rules often use the `pattern` option to specify _RegExp_
  expresssions or a function to use to validate string inputs

#### name, label

- `name` is the attribute name
- When using `InputValidator`
  - `name` is used as the name of the attribute that is set on output
  - `label` is used as the name of the property in error messages
  - if `label` is not set, `name` is used as the property name in error messages
- When using `ResponseValidator`
  - `name` is the name of properties of the response being validated
  - `name` is used as the name of the property in error messages
  - `label` is not used

#### default

- When a `default` value is provided:
  - the default value will be used if the value is missing or invalid
  - `strict`, `required` and `optional` are ignored
  - `default` can be
    - a value
    - a function that is called with value, `ValidatorRule`

#### strict, required, optional

- When setting `strict`, only those properties that are marked as `required` or
  `optional` are allowed on an object
  - As an example, if `strict` is true and no default is set, and the value is
    not set, then a _missing property_ error will be registered.

### sanitize

The `sanitize` option can be one of

- function - called with value, `ValidatorRule`, returns the new value
- boolean - if true will cast or otherwise munge the input value to type
- string - can be one of:
  - boolean - will attempt to munge the input value into a boolean

Because input is from UI and is assumed to be a string, `sanitize` _should_ be
set to `true` for all `type` values other than 'string' when using
`InputValidator`.

## Dev

To build and watch

```sh
npm run dev
```

To run tests

```sh
npm test
```

To contribute, please install prettier globally and run prettier to format
files. If using vscode, install the prettier extension, disable other
formatters, and enable prettier for this project.

```
npm install -g prettier
```
