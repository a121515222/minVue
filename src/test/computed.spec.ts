import { computed } from "../reactivity/computed";
import { reactive } from "../reactivity/reactive";

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({ age: 1 });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
    // expect(age.value).toBe(1); 想想看為甚麼要.value
    // 因為定義了一個.value的方法
  });
  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);
    // lazy
    expect(getter).not.toHaveBeenCalled();
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not computed again
    cValue.value; // get
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);
    // now it should compute
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
