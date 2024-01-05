import { ShapeFlags } from "../shared/shapeFlags";
export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");
export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    key:props && props.key,
    shapeFlag: getShapeFlag(type),
    // 初始化虛擬el設定為null
    el: null,
  };
  // 處理children
  if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  // 判斷是不是slot
  // component children 是object
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children === "object") {
      vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
    }
  }

  return vnode;
}
export function createTextVNode(text: string) {
  //                 申明(在vnode.ts)  props  用戶傳的text
  return createVNode(Text, {}, text);
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
