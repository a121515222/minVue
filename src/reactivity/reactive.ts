import { isObject } from "../shared/index";
import {
  mutableHandles,
  readonlyHandles,
  shallowReadonlyHandles,
} from "./baseHandler";

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadOnly",
}

export function reactive(raw) {
  return createReactiveObject(raw, mutableHandles);
}
export function shallowReadonly(raw) {
  return createReactiveObject(raw, shallowReadonlyHandles);
}

export function readonly(raw) {
  return createReactiveObject(raw, readonlyHandles);
}
export function isReactive(value) {
  return !!value[ReactiveFlags.IS_REACTIVE];
}
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY];
}
export function isProxy(value) {
  return isReactive(value) || isReadonly(value);
}

function createReactiveObject(target, baseHandler) {
  if (!isObject(target)) {
    console.warn(`target ${target} 必須是Object`);
    return target;
  }

  return new Proxy(target, baseHandler);
}
