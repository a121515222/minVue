import { createVNode } from "./vnode";

export function createAppAPI(render){
  return function createApp(rootComponent) {
    return {
      mount(rootContainer) {
        // 先轉化成虛擬節點
        // 後續的邏輯操作會基於虛擬節點做操作
        const vnode = createVNode(rootComponent);
  
        render(vnode, rootContainer);
      },
    };
  }
}


