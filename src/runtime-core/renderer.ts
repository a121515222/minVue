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
  // 把所創造了element存在vnode內
  // 這裡的vnode是屬於App.js 中h函式內的"div"
  const el = (vnode.el = document.createElement(vnode.type));

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

function mountComponent(initVnode: any, container) {
  const instance = createComponentInstance(initVnode);
  setupComponent(instance);
  setupRenderEffect(instance, initVnode, container);
}
function setupRenderEffect(instance: any, initVnode, container) {
  // 下面兩行看不懂為甚麼render.call(proxy)
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  // 在 path中
  // vnode 為element > mounted element
  patch(subTree, container);
  //當所有element都已經mounted的時候,把subTree的元素賦值給Component的虛擬節點
  initVnode.el = subTree.el;
}
