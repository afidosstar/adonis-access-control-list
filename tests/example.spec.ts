import test from "japa";
import { setup, cleanup } from "./bootstrap";

test.group("Example", (group) => {
  group.before(async () => {
    await setup();
  });

  group.after(async () => {
    await cleanup();
  });

  test("assert sum", (assert) => {
    assert.equal(2 + 2, 4);
  });
});
