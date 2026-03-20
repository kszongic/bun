import { expect, jest, test } from "bun:test";

test("mock function returning non-object from Reflect.construct does not crash", () => {
  const mock = jest.fn().mockReturnValue(undefined);
  // Reflect.construct calls the mock as a constructor.
  // The mock returns undefined (non-object), which must not crash.
  const result = Reflect.construct(mock, []);
  expect(result).toBeDefined();
});

test("jest.fn() with no implementation does not crash on Reflect.construct", () => {
  const mock = jest.fn();
  const result = Reflect.construct(mock, []);
  expect(result).toBeDefined();
});

test("spyOn mock does not crash on Reflect.construct", () => {
  const obj = { prop: 42 };
  using spy = jest.spyOn(obj, "prop" as any);
  const result = Reflect.construct(spy, []);
  expect(result).toBeDefined();
});

test("spyOn with numeric key does not crash on Reflect.construct", () => {
  const obj = { 128: undefined } as any;
  using spy = jest.spyOn(obj, 128 as any);
  const result = Reflect.construct(spy, []);
  expect(result).toBeDefined();
});
