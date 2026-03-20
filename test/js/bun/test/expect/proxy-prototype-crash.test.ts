import { expect, test } from "bun:test";
import { bunEnv, bunExe } from "harness";

// Regression test: forEachProperty crashed with null deref when an object's
// prototype was replaced with a Proxy, and then the object was formatted
// as part of an expect error message.
test("expect does not crash when object prototype is a Proxy", async () => {
  await using proc = Bun.spawn({
    cmd: [
      bunExe(),
      "-e",
      `
      const v = Bun.jest().expect();
      const origProto = Object.getPrototypeOf(v);
      const newProto = new Proxy(origProto, {
        get(target, key, receiver) { return Reflect.get(target, key, receiver); },
        set(target, key, value, receiver) { return Reflect.set(target, key, value, receiver); },
        has(target, key) { return Reflect.has(target, key); },
      });
      Object.setPrototypeOf(v, newProto);
      try { v.toContainValue(v); } catch(e) {}
      console.log("OK");
      `,
    ],
    env: bunEnv,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([proc.stdout.text(), proc.stderr.text(), proc.exited]);

  expect(stdout).toContain("OK");
  expect(exitCode).toBe(0);
});
