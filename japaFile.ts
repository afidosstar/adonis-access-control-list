import "reflect-metadata";
import { configure } from "japa";
import sourceMapSupport from "source-map-support";
import { setup, setupApplication } from "./test-helpers";

sourceMapSupport.install({ handleUncaughtExceptions: false });

configure({
  files: ["tests/**/*.spec.ts"],
  before: [
    async () => {
      const app = await setupApplication();
      global[Symbol.for("__TEST_APP__")] = app;
      await setup(app);
    },
  ],
});
