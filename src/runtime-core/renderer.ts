import { createComponentInstance, setupComponent } from "./component";
export function render(vnode, container) {
  // 調用patch
  patch(vnode, container);
}
function patch(vnode, container) {
  // 處理component
  //判斷是不是element
  // to do 判斷vnode是不是element
  // processElement
  processComponent(vnode, container);
}

function processComponent(vnode: any, container: any): void {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}
function setupRenderEffect(instance: any, container) {
  const subTree = instance.render();
  // 在 path中
  // vnode 為element > mounted element
  patch(subTree, container);
}
