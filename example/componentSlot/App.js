import { h, createTextVNode } from "../../../lib/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";
export const App = {
  name: "App",
  render() {
    const app = h("div", {}, "App");
    // const foo = h(Foo, {}, h("p", {}, "123"));
    // const foo = h(Foo, {}, [h("p", {}, "render me"), h("p", {}, "456")]);
    // const foo = h(Foo, {}, h("p", {}, "123"));

    const foo = h(
      Foo,
      {},
      {
        // 函式化主要是為了實縣作用域SLOT也就是能把AGE傳給SLOT
        // element 需要是 div p 等... 但是text node沒有標籤需要特殊處理
        header: ({ age }) => [
          h("p", {}, "header" + age),
          createTextVNode("我是text node"),
        ],
        footer: () => h("p", {}, "footer"),
      }
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {};
  },
};
