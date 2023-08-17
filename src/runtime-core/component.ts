export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type:vnode.type;
  };
  return component;
}

export function setupComponent(instance) {
  // todo
  // init props
  // init slots

  setupStatefulComponent(instance);
}
function setupStatefulComponent(instance: any) {
  const Component = instance.type;
  const { setup } = Component;
  if (setup) {
    // setup可以return function 即為render函式
    // 如果return object即會把object注入至component內
    const setupResult = setup();
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
  if(Component.render) {
    instance.render = Component.render
  }
}
