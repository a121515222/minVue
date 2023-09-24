export function initProps(instance, rawProps) {
  // initProps
  //1. 接手setup 內的props
  //2. 在render()內可以透過this取到某一個key的值 以APP的範例來說就是this.count
  //3. props是一個shallowReadonly
  instance.props = rawProps || {};
  // attrs
}
