import { ValidatorItem } from "./validator-item";
import { ValidatorBase } from "./validator-base";
import { GenericObject } from "./lib/util";

export class ValidatorItemOption extends ValidatorItem {

  constructor(value: any, parent?: ValidatorBase) {
    super(value, parent);
  }

}

