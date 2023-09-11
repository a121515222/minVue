import { isObject } from "../shared/index";
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
  if (typeof vnode.type === "string") {
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
  const el = document.createElement(vnode.type);

  // 收到vnode是 string or array
  const { children } = vnode;
  if (typeof children === "string") {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el);
  }

  // props
  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}
function mountChildren(vnode, container) {
  vnode.children.forEach((v) => {
    patch(v, container);
  });
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
  // 下面兩行看不懂為甚麼render.call(proxy)
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  // 在 path中
  // vnode 為element > mounted element
  patch(subTree, container);
}
