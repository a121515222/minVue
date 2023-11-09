import { isObject } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./helpers/component";
import { Fragment, Text } from "./vnode";
export function render(vnode, container) {
  // 調用patch
  patch(vnode, container, null);
}
function patch(vnode, container, parentComponent) {
  const { type, shapeFlag } = vnode;

  // Fragment ->只渲染所有的children 為了處理在renderSlot中外還要再包一層div
  switch (type) {
    case Fragment:
      processFragment(vnode, container, parentComponent);
      break;
    case Text:
      processText(vnode, container);
      break;
    default:
      // 處理component
      //判斷是不是element
      // to do 判斷vnode是不是element
      // processElement
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(vnode, container, parentComponent);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container, parentComponent);
      }
      break;
  }
}

function processElement(vnode: any, container: any, parentComponent) {
  mountElement(vnode, container, parentComponent);
}

function mountElement(vnode: any, container: any, parentComponent) {
  // 把所創造了element存在vnode內
  // 這裡的vnode是屬於App.js 中h函式內的"div"
  const el = (vnode.el = document.createElement(vnode.type));

  // 收到vnode是 string or array
  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode, el, parentComponent);
  }

  // props

  const { props } = vnode;
  for (const key in props) {
    const val = props[key];

    // 檢查key中有沒有註冊事件
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase();
      el.addEventListener(event, val);
    }
    el.setAttribute(key, val);
  }
  container.append(el);
}
function mountChildren(vnode, container, parentComponent) {
  vnode.children.forEach((v) => {
    patch(v, container, parentComponent);
  });
}

function processComponent(vnode: any, container: any, parentComponent) {
  mountComponent(vnode, container, parentComponent);
}

function mountComponent(initVnode: any, container, parentComponent) {
  const instance = createComponentInstance(initVnode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initVnode, container);
}
function setupRenderEffect(instance: any, initVnode, container) {
  // 下面兩行看不懂為甚麼render.call(proxy)
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  // 在 path中
  // vnode 為element > mounted element
  patch(subTree, container, instance);
  //當所有element都已經mounted的時候,把subTree的元素賦值給Component的虛擬節點
  initVnode.el = subTree.el;
}
function processFragment(vnode: any, container: any, parentComponent) {
  mountChildren(vnode, container, parentComponent);
}
function processText(vnode: any, container: any) {
  const { children } = vnode;
  const textNode = (vnode.el = document.createTextNode(children));
  container.append(textNode);
}
