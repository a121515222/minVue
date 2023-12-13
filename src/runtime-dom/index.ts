import { createRenderer } from "../runtime-core"

function createElement(type){
  return document.createElement(type)
}
function patchProp(el,key,val){

   // 檢查key中有沒有註冊事件
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLocaleLowerCase();
      el.addEventListener(event, val);
    } else{

      el.setAttribute(key, val);
    }
}
function insert(el,parent){
  parent.append(el)
}
const renderer:any = createRenderer({
  createElement,
  patchProp,
  insert
})
export function createApp(...args){
  return renderer.createApp(...args)
}
export * from "../runtime-core";