import { getCurrentInstance } from "./component";

export function provide(key, value) {
  // save
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent.provides;
    // 重新把provides指向父層的provide,同時也是初始化所以只能執行一次
    // 一開始的時候provides與parentProvides的值會相同，初始化之後provides被賦值後會與parentProvides不同
    if (provides === parentProvides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
export function inject(key, defaultValue) {
  //read
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;

    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
