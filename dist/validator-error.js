'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class ValidatorErrorItem {
  constructor(key, type, params = {}) {
    this.key = key;
    this.type = type;
    Object.assign(this, params);
  }
  get message() {
    return this.toString();
  }
}
exports.ValidatorErrorItem = ValidatorErrorItem;
//# sourceMappingURL=validator-error.js.map
