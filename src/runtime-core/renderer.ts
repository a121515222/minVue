import { effect } from "../reactivity/effect";
import { isObject,EMPTY_OBJ } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createAppAPI } from "./createApp";
import { createComponentInstance, setupComponent } from "./helpers/component";
import { Fragment, Text } from "./vnode";

export function createRenderer(options){
  const {
    createElement: hostCreateElement,
    patchProp: hostPatchProp,
    insert: hostInsert,
    remove:hostRemove,
    setElementText:hostSetElementText
  } = options

function render(vnode, container, ) {
  // 調用patch
  patch(null,vnode, container, null, null);
}
// n1->舊虛擬節點 n2->新的虛擬節點
function patch(n1,n2, container, parentComponent,anchor) {
  const { type, shapeFlag } = n2;

  // Fragment ->只渲染所有的children 為了處理在renderSlot中外還要再包一層div
  switch (type) {
    case Fragment:
      processFragment(n1,n2, container, parentComponent, anchor);
      break;
    case Text:
      processText(n1,n2, container);
      break;
    default:
      // 處理component
      //判斷是不是element
      // to do 判斷vnode是不是element
      // processElement
      if (shapeFlag & ShapeFlags.ELEMENT) {
        processElement(n1,n2, container, parentComponent, anchor);
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(n1,n2, container, parentComponent, anchor);
      }
      break;
  }
}

function processElement(n1,n2: any, container: any, parentComponent, anchor) {
  if(!n1){
    mountElement(n2, container, parentComponent, anchor);
  }else{
    patchElement(n1, n2, container, parentComponent, anchor);
  }
}
function patchElement(n1, n2, container, parentComponent, anchor){
  console.log("patchElement")
  console.log("n1",n1)
  console.log("n2",n2)
  //對比props,
  const oldProps = n1.props || EMPTY_OBJ;
  const newProps = n2.props || EMPTY_OBJ;

  const el = (n2.el = n1.el);
  patchChildren(n1, n2, el, parentComponent, anchor);
  patchProps(el,oldProps,newProps);

  
  //對比children
}
function patchChildren(n1, n2, container, parentComponent, anchor){
  const prevShapeFlag = n1.shapeFlag;
  const c1 = n1.children;
  const { shapeFlag } = n2;
  const c2 = n2.children;
  if(shapeFlag & ShapeFlags.TEXT_CHILDREN){
    if(prevShapeFlag & ShapeFlags.ARRAY_CHILDREN){
      //1.把原有children清空
      unmountChildren(n1.children);
      //2.設至新的text
      hostSetElementText(container, c2);
    } 
    if(c1 !==c2){
      hostSetElementText(container, c2);
    }
  }else {
    if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN){
      //先清空原本的text
      hostSetElementText(container, "");
      mountChildren(c2, container, parentComponent, anchor);
    } else {
      // array diff array
      patchKeyChildren(c1, c2, container, parentComponent, anchor)
    }
  }
}
function patchKeyChildren(c1,c2,container, parentComponent, parentAnchor){
  const l2 = c2.length
  let i = 0;
  let e1 = c1.length-1;
  let e2 = l2-1;


  function isSomeVNodeType(n1,n2){
    //type
    //key
    console.log("n1",n1)
    console.log("n2",n2)
    return n1.type === n2.type && n1.key === n2.key;
  }

  // 左側
  while(i<= e1 && i <= e2){
    const n1 = c1[i];
    const n2 = c2[i]
    if(isSomeVNodeType(n1,n2)){
      patch(n1, n2, container, parentComponent, parentAnchor)
    } else {
      break
    }
    i++;
  }
  // 右側
  while(i<= e1 && i <= e2){
    const n1 = c1[e1];
    const n2 = c2[e2];
    if(isSomeVNodeType(n1,n2)){
      patch(n1, n2, container, parentComponent, parentAnchor);
    } else {
      break
    }
    e1--;
    e2--;
  }
// 新的比老的多 創建
if(i > e1){
  if(i <= e2){
    const nextPos = e2+1;
    const anchor = nextPos < l2?  c2[nextPos].el:null;
    while(i<=e2){
    patch(null,c2[i],container,parentComponent, anchor);
    i++;
  }
    }
  } else if(i > e2){
    while(i<=e1){
      hostRemove(c1[i].el)
      i++;
    }
  } else {
    //中間對比
    let s1 = i;
    let s2 = i;
    const toBePatched = e2-s2 +1 //因為是index所以要加1才是長度(總數)
    let patched = 0;
    const keyToNewIndexMap = new Map();
    //建立一個最長遞增函數的映射表，建立一個定長的array最省資源
    const newIndexToOldIndexMap = new Array(toBePatched);

    let moved = false;
    let maxNewIndexSoFar = 0;
    //初始化newIndexToOldIndexMap
    for(let i = 0; i< patched;i++) newIndexToOldIndexMap[i] = 0
    newIndexToOldIndexMap[i]=0


    // 建立映射表(新節點)
    for (let i = s2; i <=e2; i++) {
      const nextChild = c2[i];
      console.log("nextChild",nextChild)
      keyToNewIndexMap.set(nextChild.key,i);
    }
    for(let i = s1; i <= e1; i++){
      const prevChild = c1[i];
      
      // 如果新的節點處理完，還有舊節點，代表舊節的的東西是多餘的可以直接刪除
      if(patched >= toBePatched){
        hostRemove(prevChild.el);
        continue;
      }

      let newIndex;
      //prevChild為null與undefined都會認為舊結點是存在的.
      if(prevChild.key != null){
        newIndex = keyToNewIndexMap.get(prevChild.key)
      }else {
        for (let j = s2; j< e2; j++){
          if(isSomeVNodeType(prevChild,c2[j])){
            newIndex = j;
            break;
          }
        }
      }
      // 如果新的節點裡沒有舊的就刪除
      if(newIndex === undefined){
        hostRemove(prevChild.el);
      } else{

        if(newIndex >= maxNewIndexSoFar){
          maxNewIndexSoFar = newIndex
        } else {
          moved = true
        }

        newIndexToOldIndexMap[newIndex - s2] = i + 1 ;// 不讓i為0，因為i為0的話代表映射關係還沒建立，代表新的節點在
        // 老的節點裡是不存在的

        // 有的話就繼續實現節點
        patch(prevChild,c2[newIndex], container, parentComponent,null)
        //處理完一個新節點patched就+1
        patched ++
      }
    }
    const increasingNewIndexSequence = moved? getSequence(newIndexToOldIndexMap):[] ;
    let j = increasingNewIndexSequence.length - 1;//最長遞增子序列的指針
    // 從已經確定的節點插入移動的節點
    for(let i = toBePatched - 1 ; i>= 0; i--){

      const nextIndex = i + s2;
      const nextChild = c2[nextIndex]
      const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el:null;
      if(newIndexToOldIndexMap[i]===0){
        patch(null, nextChild, container, parentComponent, anchor);
      }
      if(moved){
        if(j<0 || i !== increasingNewIndexSequence[j]){
          hostInsert(nextChild.el, container, anchor)
        } else {
          j--;
        }
      }
      
    }

  }
}
function unmountChildren(children){
  for (let i = 0; i< children.length; i++) {
    const el = children[i].el;
    //remove 
    hostRemove(el)
  }
}
function patchProps(el,oldProps,newProps){
  if(oldProps !== newProps){
    for (const key in newProps) {
      const prevProp = oldProps[key];
      const nextProp = newProps[key];
        if(prevProp !== nextProp){
          hostPatchProp(el,key,prevProp,nextProp);
        }
      }

    if(oldProps !== EMPTY_OBJ){
      for (const key in oldProps) {
        if(!(key in newProps)){
          hostPatchProp(el,key,oldProps[key],null);
        }
      } 
    }  
  }
  
  }
function mountElement(vnode: any, container: any, parentComponent, anchor) {
  // canvas
  //new Element()
  // 把所創造了element存在vnode內
  // 這裡的vnode是屬於App.js 中h函式內的"div"
  const el = (vnode.el = hostCreateElement(vnode.type));

  // 收到vnode是 string or array
  const { children, shapeFlag } = vnode;
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(vnode.children, el, parentComponent, anchor);
  }

  // props

  const { props } = vnode;
  for (const key in props) {
    const val = props[key];
    hostPatchProp(el,key,null,val)
  }

  // canvas
  //el.x

  // container.append(el);
  hostInsert(el, container, anchor)
}
function mountChildren(children, container, parentComponent, anchor) {
  children.forEach((v) => {
    patch(null,v, container, parentComponent, anchor);
  });
}

function processComponent(n1,n2: any, container: any, parentComponent, anchor) {
  mountComponent(n2, container, parentComponent, anchor);
}

function mountComponent(initialVNode: any, container, parentComponent, anchor) {
  const instance = createComponentInstance(initialVNode, parentComponent);
  setupComponent(instance);
  setupRenderEffect(instance, initialVNode, container, anchor);
}
// function setupRenderEffect(instance: any, initialVNode, container) {

//   //利用effect做依賴收集
//   effect(()=>{
//     if(!instance.isMounted){
//       console.log("init")
//       // 下面兩行看不懂為甚麼render.call(proxy)
//       const { proxy } = instance;
//       const subTree = (instance.subTree =instance.render.call(proxy));


//       // 在 path中
//       // vnode 為element > mounted element
//       patch(subTree, container, instance);
//       //當所有element都已經mounted的時候,把subTree的元素賦值給Component的虛擬節點
//       initialVNode.el = subTree.el;
//       instance.isMounted = true
//     }else{
//       console.log("update")
//       const { proxy } = instance;
//       const subTree = instance.render.call(proxy);
//       const prevSubTree=instance.subTree
//       instance.subTree = subTree
//   });
// }
function setupRenderEffect(instance: any, initialVNode, container, anchor) {

  // 利用 effect 做依賴收集
  effect(() => {
    if (!instance.isMounted) {
      // 下面兩行看不懂為甚麼 render.call(proxy)
      const { proxy } = instance;
      const subTree = (instance.subTree = instance.render.call(proxy));

      // 在 path 中
      // vnode 為 element > mounted element
      // Missing implementation for the patch function
      patch(null,subTree, container, instance, anchor);
      // 當所有 element 都已經 mounted 的時候,把 subTree 的元素賦值給 Component 的虛擬節點
      initialVNode.el = subTree.el;
      instance.isMounted = true;
    } else {
      const { proxy } = instance;
      const subTree = instance.render.call(proxy);
      const prevSubTree = instance.subTree;
      instance.subTree = subTree;
      patch(prevSubTree,subTree, container, instance, anchor);
      // Missing closing parenthesis for the else block
    }
  });
}
function processFragment(n1,n2: any, container: any, parentComponent, anchor) {
  mountChildren(n2.children, container, parentComponent, anchor);
}
function processText(n1,n2: any, container: any) {
  const { children } = n2;
  const textNode = (n2.el = document.createTextNode(children));
  container.append(textNode);
}

return{
  createApp:createAppAPI(render)
}
}


function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}