'use strict';

const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
// call是什麼?
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
// 有的時候emit的event會命名為 add-foo 需要調整成 onAddFoo 下面就是把-f轉為F
const camelize = (str) => {
    // replace中有正則的話第二個參數(函式)的第一個參數是整個字串拿下一航的例子也就是等於str,第二個參數表示在replace內第一個參數(正則)所捕抓到的字符
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
// 把 emit("add")中的add變成 Add
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
//加上on
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

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

function emit(instance, event, ...args) {
    console.log("emit", event);
    //取props 可以透過傳入instance取得
    const { props } = instance;
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    // 下面這行檢查handler存不存在如果存在則將..args剩餘參數給handler
    // 這個handler就是on開頭的event 例如onAdd, 可以看成handler(...args) 等於 onAdd(...args)
    handler && handler(...args);
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
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        //從setupState獲取值
        const { setupState, props } = instance;
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

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    // 提供使用array與不array的slot寫法
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => { },
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
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // todo
    // init props
    initProps(instance, instance.vnode.props);
    // init slots
    initSlots(instance, instance.vnode.children);
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
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
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
    // 判斷是不是slot
    // component children 是object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    //                 申明(在vnode.ts)  props  用戶傳的text
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ELEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function render(vnode, container) {
    // 調用patch
    patch(vnode, container);
}
function patch(vnode, container) {
    const { type, shapeFlag } = vnode;
    // Fragment ->只渲染所有的children 為了處理在renderSlot中外還要再包一層div
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
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
            break;
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
function processFragment(vnode, container) {
    mountChildren(vnode, container);
}
function processText(vnode, container) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
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

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

exports.createApp = createApp;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.renderSlots = renderSlots;
