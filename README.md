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
- Output is built that onlyu contains changed values

## Sample Usage

## Usage

There are two main ways to use the validate module.

- To validate an object, for example a server response or any object with properties
  - Use `ResponseValidator` class
- To validate individual UI input values and add them to a changes object that
  may be sent to a server to update a document
  - Use `InputValidator` class
  - Input strings are trimmed of leading and trailing whitespace

### Example - Validating Server Response

```js
// To be written
const RULES = {
  type: ValidatorType.object,
  properties: {
    id: { type: ValidatorType.string, required: true },
    name: { type: ValidatorType.string, required: true }
  }
};
let validator = new ResponseValidator();
validator.input(resp).validate(RULES);
if (validator.errors) {
}
```

### Example - Validating UI Input

```js
const RULES = {
  title: { type: ValidatorType.string },
  opacity: { type: ValidatorType.number, min: 0, max: 1, default: 1, sanitize: true },
}
let changes = {};
let reference = {
  title: 'old title',
  opacity: 0.5
};
let validator = new InputValidator(changes);
validator.reference(reference)
validator.name('title').input('new title').validate(RULES.title);
validator.name('opacity').input(0.5).validate(RULES.opacity);
console.log(changes);
# changes = { title: 'new title' };
```

## InputValidator Methods

- `constructor(changes)` -
- `reference(doc)` - Sets a comparison document.
- `name(string)` - Sets the property name.
- `input(value)` - Set the value that is to be validated.
- `validate(rule|rules)` - a rule or an array of rules. See _Rule Options_ below.
  - `value` must match the rule or one of the rules in the array. If used, the
    properties `default`, `strict`, `required` and `optional` should be set in
    the last entry in the rule array.

## ResponseValidator Methods

- `constructor()`
- `name(string)` - Sets the property name.
- `validate(rule|rules)` - a rule or an array of rules.
  - Rules are generic objects that are then used to create a `ValidatorRule`
    object.
  - The value must match the rule or one of the rules in the array. If used, the
    properties `default`, `strict`, `required` and `optional` should be used in
    the last entry in the rule array.

## Rule options

Rules are generic objects with the following options. This generic object is
converted into a `ValidatorRule` object internally within this module.

- `name` string - required for InputValidation, but can be specified via the
  name method
- `label` string - (_optional_), defaults to `name` and is used in errors to
  describe the input
- `type` ValidatorType or array of ValidatorType or strings separated by '|', (_required_). Defaults to `string` if pattern is a RegExp.
  must be one of the primitive types listed below
- `format` string - (_optional_) can be used to specify a predefined format
- `pattern` RegExp or Function - (_optional_) used to validate value. If a pattern is set to RegExp then type is assumed to be `string`.
- `sanitize` Function, boolean or string - See below for more details
- `default` (_optional_) default value to use if value is undefined, null, an empty string or missing
- `min` number - (_optional_) minimum string length or minimum number value
- `max` number - (_optional_) maximum string length or maximum number value
- `required` boolean - (_optional_) for objects indicates if the value is
  required to be set
- `optional` boolean - (_optional_) for objects indicates if the value is
  optional (relevant only when `strict` is true)
- `strict` boolean - (_optional_) for objects use strict testing
- `isMissing` Function | array of any - (_optional_) customize a callback test to see if value is missing.
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

#### strict, required, optional, only

- When setting `strict`, only those properties that are marked as `required` or
  `optional` are allowed on an object
  - As an example, if `strict` is true and no default is set, and the value is
    not set, then a _missing property_ error will be registered.
- When setting `only`, only those properties that are listed are allowed on an object
- `strict` takes precedence over `only`, so it does not make sense to use these
  together.

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
npm run build
```

To run tests

```sh
npm test
```

Note that js and map files are put in the dist folder, while declaration files
are output to the root folder. Refer to [this blog
post](https://v4.chriskrycho.com/2018/how-to-bundle-typescript-type-definitions.html)
for details.

To contribute, please install prettier globally and run prettier to format
files. If using vscode, install the prettier extension, disable other
formatters, and enable prettier for this project.

```
npm install -g prettier
```
