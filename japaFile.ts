import "reflect-metadata";
import { configure } from "japa";
import sourceMapSupport from "source-map-support";

sourceMapSupport.install({ handleUncaughtExceptions: false });

configure({
  files: ["tests/**/*.spec.ts"],
});
