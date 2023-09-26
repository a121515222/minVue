export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue);
};

// call是什麼?
export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

// 有的時候emit的event會命名為 add-foo 需要調整成 onAddFoo 下面就是把-f轉為F
export const camelize = (str: String) => {
  // replace中有正則的話第二個參數(函式)的第一個參數是整個字串拿下一航的例子也就是等於str,第二個參數表示在replace內第一個參數(正則)所捕抓到的字符
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

// 把 emit("add")中的add變成 Add
const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

//加上on
export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
