import { h } from "../../../lib/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";
// import { Foo } from "./Foo.js";
window.self = null;
export const App = {
  name: "App",
  render() {
    // 不懂window.slef是什麼?  this 表示的是component
    window.self = this;
    return h(
      //emit
      "div",
      {},
      [
        h("div", {}, "hi" + this.msg),
        h(Foo, {
          onAdd(a, b) {
            console.log("onAdd", a, b);
          },
          onAddFoo() {
            console.log("onAddFoo");
          },
        }),
      ]
    );
  },
  setup() {
    return {};
  },
};
