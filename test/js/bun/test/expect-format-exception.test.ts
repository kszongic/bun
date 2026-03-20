import { test, expect } from "bun:test";
import { bunEnv, bunExe } from "harness";

test("expect error formatting does not crash when formatting throws", async () => {
  // When expect() receives a non-mock value and the error formatter encounters
  // a JS exception while formatting the value, it should throw a proper error
  // instead of crashing with an assertion failure in releaseAssertNoException.
  await using proc = Bun.spawn({
    cmd: [
      bunExe(),
      "-e",
      `
      delete globalThis.Loader;
      const v1 = Bun.jest();
      const v2 = v1.expect(Bun);
      try { v2.nthCalledWith(Bun, v2, v2, Bun, v2); } catch (e) {}
      console.log("ok");
      `,
    ],
    env: bunEnv,
    stdout: "pipe",
    stderr: "pipe",
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    proc.stdout.text(),
    proc.stderr.text(),
    proc.exited,
  ]);

  expect(stdout).toBe("ok\n");
  expect(exitCode).toBe(0);
});
