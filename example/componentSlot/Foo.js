import { h, renderSlots } from "../../../lib/guide-mini-vue.esm.js";
export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "foo");
    // 獲取 Foo的vnode的children 然後添加到 下行code 的children也就是this.$slots的地方
    // childer都需要是vnode
    // renderSlots

    // 指名slot
    // 1.獲取要渲染的元素 ->可以透過obj的key
    // 2.獲取要選染的位置 -> 在renderSlots增加key來判斷位置

    // 作用域slot 可以從app直接取得資料後渲染到插槽上
    //
    console.log(this.$slot);
    const age = 12;
    return h("div", {}, [
      renderSlots(this.$slots, "header", { age }),
      foo,
      renderSlots(this.$slots, "footer"),
    ]);
    // console.log(this.$slots);
    // return h("div", {}, [foo]);
  },
};
