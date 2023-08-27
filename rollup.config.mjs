import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    // output 可以多個 cjs commonjs與esm
    { format: "cjs", file: "lib/guide-mini-vue.cjs.js" },
    { format: "es", file: "lib/guide-mini-vue.esm.js" },
  ],
  // 需要
  plugins: [typescript()],
};
