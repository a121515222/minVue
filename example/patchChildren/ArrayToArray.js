import { ref, h } from "../../lib/guide-mini-vue.esm.js";

//原有是array
//新的是array

// 1.左側的對比
//(a b) c
//(a b) d e

// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { Key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { Key: "B" }, "B"),
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
// ];
// 2.右側的對比
//a (b c)
//d e (b c)
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { Key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [
//   h("p", { key: "D" }, "D"),
//   h("p", { key: "E" }, "E"),
//   h("p", { key: "B" }, "B"),
//   h("p", { Key: "C" }, "C"),
// ];

//3.新的比老的長
//左側
//(a b)
//(a b) c
// i =2, el = 1, e2 = 2
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { Key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { Key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];

// 右側
//(a b)
//c (a b)
// i =0, el = -1, e2 = 0
// const prevChildren = [h("p", { key: "A" }, "A"), h("p", { Key: "B" }, "B")];
// const nextChildren = [
//   h("p", { key: "C" }, "C"),
//   h("p", { key: "A" }, "A"),
//   h("p", { Key: "B" }, "B"),
// ];

//4.老的比新的長
//左側
// (a b) c
// (a b)
// (i = 2), (el = 2), (e2 = 1);
// const prevChildren = [
//   h("p", { key: "A" }, "A"),
//   h("p", { Key: "B" }, "B"),
//   h("p", { key: "C" }, "C"),
// ];
// const nextChildren = [h("p", { key: "B" }, "B"), h("p", { Key: "C" }, "C")];

// 右側
//c (a b)
//(a b)
// i =0, el = 0, e2 = -1
const prevChildren = [
  h("p", { key: "C" }, "C"),
  h("p", { key: "A" }, "A"),
  h("p", { Key: "B" }, "B"),
];
const nextChildren = [h("p", { key: "A" }, "A"), h("p", { Key: "B" }, "B")];

//5.對比中見的部分
//  1.創建新的(在老的裡面不存在，新的裡面存在)
//  2.刪除老的(在老的裡面存在，新的裡面不存在)
//  3.移動(節點存在於新和老的裡面，但位置變了)
//    使用長子序列優化
export default {
  name: "ArrayToArray",
  setup() {
    const isChange = ref(false);
    window.isChange = isChange;
    return {
      isChange,
    };
  },
  render() {
    const self = this;
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, prevChildren);
  },
};
