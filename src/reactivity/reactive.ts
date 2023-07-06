import { track, trigger } from "./effect";


function createGetter(isReadonly = false) {
  return function get (target, key){
    const res = Reflect.get(target, key);
    // 依賴收集
    if(!isReadonly) {
      track(target, key);
    }
    return res;
  }
}

function createSetter() {
  return function set (target, key, value) {
    const res = Reflect.set(target, key, value);
      trigger(target, key);
      return res;
  }
}


export function reactive(raw) {
  return new Proxy(raw, {
    get: createGetter(),
    set: createSetter(),
  });
}

export function readonly(raw) {
  return new Proxy(raw, {
    get: createGetter(),
    set(target, key, value) {
      return true;
    },
  });
}

