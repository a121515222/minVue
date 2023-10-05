import { hasOwn } from "../shared/index";

const publicPropertiesMap = {
  $el: (i) => i.vnode.el,
  $slots: (i) => i.slots,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    //從setupState獲取值

    const { setupState, props } = instance;
    // 怎麼多了下面
    // if (key in setupState) {
    //   return setupState[key];
    // }

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
    // 還可以增加$data
  },
};
