import { hasChanged } from "../shared";
import { isTracking, trackEffects, triggerEffects } from "./effect";

//Impl 接口的縮寫
class RefImpl {
  private _value: any;
  public dep;
  constructor(value) {
    this._value = value;
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }
  set value(newValue) {
    if (hasChanged(newValue, this._value)) {
      this._value = newValue;
      triggerEffects(this.dep);
    }
  }
}
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

export function ref(value) {
  return new RefImpl(value);
}
