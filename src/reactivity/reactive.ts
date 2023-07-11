import { mutableHandles, readonlyHandles } from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandles);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandles);
}
function createReactiveObject(raw, baseHandler) {
  return new Proxy(raw, baseHandler)
}
export function isReactive(value){
  return value[ReactiveFlags.IS_REACTIVE]
}

