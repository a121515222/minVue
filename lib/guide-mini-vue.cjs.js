'use strict';

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
// call是什麼?
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);

const targetMap = new Map();
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadOnly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandles = {
    get,
    set,
};
const readonlyHandles = {
    get: readonlyGet,
    set(target, key, value) {
        console.warn(`key:${key} set failed because target is readonly`, target);
        return true;
    },
};
const shallowReadonlyHandles = extend({}, readonlyHandles, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    return createReactiveObject(raw, mutableHandles);
}
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandles);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandles);
}
function createReactiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn(`target ${target} 必須是Object`);
        return target;
    }
    return new Proxy(target, baseHandler);
}

function initProps(instance, rawProps) {
    // initProps
    //1. 接手setup 內的props
    //2. 在render()內可以透過this取到某一個key的值 以APP的範例來說就是this.count
    //3. props是一個shallowReadonly
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //從setupState獲取值
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
        // 還可以增加$data
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
    };
    return component;
}
function setupComponent(instance) {
    // todo
    // init props
    initProps(instance, instance.vnode.props);
    // init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
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
function handleSetupResult(instance, setupResult) {
    //to do function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    //保證render component是有值的
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    // if (Component.render) {
    //   instance.render = Component.render;
    // }
    instance.render = Component.render;
}

function render(vnode, container) {
    // 調用patch
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    // 處理component
    //判斷是不是element
    // to do 判斷vnode是不是element
    // processElement
    if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // 把所創造了element存在vnode內
    // 這裡的vnode是屬於App.js 中h函式內的"div"
    const el = (vnode.el = document.createElement(vnode.type));
    // 收到vnode是 string or array
    const { children, shapeFlag } = vnode;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        const val = props[key];
        // 檢查key中有沒有註冊事件
        const isOn = (key) => /^on[A-Z]/.test(key);
        if (isOn(key)) {
            const event = key.slice(2).toLocaleLowerCase();
            el.addEventListener(event, val);
        }
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        patch(v, container);
    });
}
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(initVnode, container) {
    const instance = createComponentInstance(initVnode);
    setupComponent(instance);
    setupRenderEffect(instance, initVnode, container);
}
function setupRenderEffect(instance, initVnode, container) {
    // 下面兩行看不懂為甚麼render.call(proxy)
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // 在 path中
    // vnode 為element > mounted element
    patch(subTree, container);
    //當所有element都已經mounted的時候,把subTree的元素賦值給Component的虛擬節點
    initVnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        // 初始化虛擬el設定為null
        el: null,
    };
    // 處理children
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // 先轉化成虛擬節點
            // 後續的邏輯操作會基於虛擬節點做操作
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
