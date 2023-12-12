import { h } from "../../lib/guide-mini-vue.esm.js";
export const Foo = {
  setup(props, { emit }) {
    // props.count
    // setup 第二個參數是放emit，要放在object內

    const emitAdd = () => {
      console.log("emit add");
      emit("add", 1, 2);
      emit("add-foo");
    };
    return {
      emitAdd,
    };
    console.log(props);
    // props readonly
  },
  render() {
    const btn = h(
      "button",
      {
        onClick: this.emitAdd,
      },
      "emitAdd"
    );
    const foo = h("p", {}, "foo");
    return h("div", {}, [foo, btn]);
  },
};
