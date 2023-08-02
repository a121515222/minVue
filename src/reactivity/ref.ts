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
    if (isTracking()) {
      trackEffects(this.dep);
    }
    return this._value;
  }
  set value(newValue) {
    //
    if (Object.is(newValue, this._value)) return;
    this._value = newValue;
    triggerEffects(this.dep);
  }
}
export function ref(value) {
  return new RefImpl(value);
}
