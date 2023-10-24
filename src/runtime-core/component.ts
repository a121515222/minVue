import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: {},
    emit: () => {},
  };
  // 為了使用者能夠直接傳入event不用傳入整個instance
  //有了emit.bind(null, component)相當於emit固定綁定了component
  //所以在componentEmit內的emit(instance,event)看起來是這樣子的emit(component,event)第一個的參數已經被綁成component了，
  //所以在一半情況下使用emit("XXX"),XXX都為第二的參數event,可以參考下面的例子
  //function add(a, b) {
  //   return a + b;
  // }
  // const addFive = add.bind(null, "5") ;
  //console.log(addFive(3)) ////"53"
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // todo
  // init props
  initProps(instance, instance.vnode.props);
  // init slots
  initSlots(instance, instance.vnode.children);

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
    currentInstance = instance;
    // setup可以return function 即為render函式
    // 如果return object即會把object注入至component內
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    currentInstance = null;
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

let currentInstance = null;

export function getCurrentInstance() {
  return currentInstance;
}
