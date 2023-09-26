import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
  console.log("emit", event);

  //取props 可以透過傳入instance取得
  const { props } = instance;

  const handlerName = toHandlerKey(camelize(event));
  const handler = props[handlerName];
  // 下面這行檢查handler存不存在如果存在則將..args剩餘參數給handler
  // 這個handler就是on開頭的event 例如onAdd, 可以看成handler(...args) 等於 onAdd(...args)
  handler && handler(...args);
}
