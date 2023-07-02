import { effect } from "../reactivity/effect";
import { reactive } from "../reactivity/reactive";

describe("effect", () => {
  it("happy path", () => {
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);

    // update
    user.age++;
    expect(nextAge).toBe(12);
  });
  it("should return runner when call effect",()=>{
    let foo = 10;
    const runner = effect(()=>{
      foo ++
      return foo
    });
    expect(foo).toBe(11);
    const r = runner();
    expect(foo).toBe(12);
    expect(r).toBe(foo);
  });
  it("scheduler",()=>{
    //通過effect的第二個參數給定一個scheduler
    //effect第一次執行的時候會執行fn
    //當響應式對象set update不會執行fn 而是執行scheduler
    //如果當執行runner時會再次執行fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(()=>{
      run = runner;
    });
    const obj = reactive({ foo:1 });
    const runner = effect(
     ()=>{
      dummy = obj.foo;
     },{ scheduler } 
    );
    expect(scheduler).not.toHaveBeenCalled();
    expect(dummy).toBe(1);
    obj.foo++;
    expect(scheduler).toHaveBeenCalledTimes(1);
    expect(dummy).toBe(1);
    run();
    expect(dummy).toBe(2);
  })
});
