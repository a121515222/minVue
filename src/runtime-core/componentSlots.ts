import { ShapeFlags } from "../shared/shapeFlags";

export function initSlots(instance, children) {
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance.slots);
  }
}

function normalizeObjectSlots(children: any, slots: any) {
  for (const key in children) {
    const value = children[key];
    slots[key] = (props) => normalizeSlotValue(value(props));
  }
}

function normalizeSlotValue(value) {
  // 提供使用array與不array的slot寫法
  return Array.isArray(value) ? value : [value];
}
