const isObject = (val) => {
    return val !== null && typeof val === "object";
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
function setupComponent(instance) {
    // todo
    // init props
    // init slots
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    const Component = instance.type;
    // 使用proxy是為了能讓使用者能直接使用this.$el取得值
    //初始化 空的object為 context
    //get的target就是 context, key對應到 demo中的 this.msg 在App.js
    instance.proxy = new Proxy({}, {
        get(target, key) {
            //從setupState獲取值
            const { setupState } = instance;
            if (key in setupState) {
                return setupState[key];
            }
            if (key === "$el") {
                // 這裡的虛擬節點是屬於component的,不是createElement的
                return instance.vnode.el;
            }
        },
    });
    const { setup } = Component;
    if (setup) {
        // setup可以return function 即為render函式
        // 如果return object即會把object注入至component內
        const setupResult = setup();
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
    // 處理component
    //判斷是不是element
    // to do 判斷vnode是不是element
    // processElement
    if (typeof vnode.type === "string") {
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
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
    const { children } = vnode;
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
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
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, vnode, container);
}
function setupRenderEffect(instance, vnode, container) {
    // 下面兩行看不懂為甚麼render.call(proxy)
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    // 在 path中
    // vnode 為element > mounted element
    patch(subTree, container);
    //當所有element都已經mounted的時候,把subTree的元素賦值給Component的虛擬節點
    vnode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        // 初始化虛擬el設定為null
        el: null,
    };
    return vnode;
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

export { createApp, h };
