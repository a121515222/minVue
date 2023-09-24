import { shallowReadonly } from "../reactivity/reactive";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };
  return component;
}

export function setupComponent(instance) {
  // todo
  // init props
  initProps(instance, instance.vnode.props);
  // init slots

  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  // 使用proxy是為了能讓使用者能直接使用this.$el取得值
  //初始化 空的object為 context
  //get的target就是 context, key對應到 demo中的 this.msg 在App.js
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = Component;
  if (setup) {
    // setup可以return function 即為render函式
    // 如果return object即會把object注入至component內
    const setupResult = setup(shallowReadonly(instance.props));
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult: any) {
  //to do function
  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  //保證render component是有值的
  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  // if (Component.render) {
  //   instance.render = Component.render;
  // }
  instance.render = Component.render;
}
