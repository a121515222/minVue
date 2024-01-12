import { h, getCurrentInstance } from "../../../lib/guide-mini-vue.esm.js";
import { Foo } from "./foo.js";
export const App = {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "cuttentInstance demo"), h(Foo)]);
  },
  setup() {
    const instance = getCurrentInstance();
    console.log("App:", instance);
  },
};