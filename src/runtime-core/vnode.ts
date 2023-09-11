export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    // 初始化虛擬el設定為null
    el: null,
  };
  return vnode;
}
