import { h, ref } from "../../../lib/guide-mini-vue.esm.js";
export const App = {
  name: "App",
  setup() {
    const count = ref(0);
    const onClick = () => {
      count.value++;
    };
    return {
      count,
      onClick,
    };
  },
  render() {
    // this.count 希望能直接獲取到值-> 使用proxyRefs
    return h("div", { id: "root" }, [
      h("div", {}, "count:" + this.count),
      h(
        "button",
        {
          onClick: this.onClick,
        },
        "click"
      ),
    ]);
  },
};
