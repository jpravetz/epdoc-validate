'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class IValidatorErrorItem {
  constructor(key, type, params = {}) {
    this.key = key;
    this.type = type;
    Object.assign(this, params);
  }
  get message() {
    return this.toString();
  }
}
exports.IValidatorErrorItem = IValidatorErrorItem;
//# sourceMappingURL=validator-error.js.map
