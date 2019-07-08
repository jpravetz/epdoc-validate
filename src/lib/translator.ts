import { GenericObject } from './lib/util';
let i18n;

export class Translator {
  constructor (path: string, params?: GenericObject = {}) {
    this.i18n = i18n;
    this._path = path;
    this._params = params;
  }

  static configure (obj: GenericObject) {
    i18n = obj ? obj.i18n : undefined;
  }

  exists () {
    return (this.i18n && this.i18n.i18next && this.i18n.i18next.exists) ? this.i18n.i18next.exists(this._path) : false;
  }

  tr () {
    return this.i18n.tr(this._path, this._params);
  }

  trIfExists () {
    if (this.exists()) {
      return this.tr();
    } else {
      return JSON.stringify(params);
    }
  }

  params (params) {
    this._params = params;
    return this;
  }
}
