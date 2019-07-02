#!/usr/bin/env node

import * as program from "commander";
import * as abswap from "./abswap";
import version from "./version";

let path: string | undefined;
let initialize = false;

const opts: {
  mode?: "file" | "directory";
  copy?: boolean;
} = {};

program
  .name("abswap")
  .version(version)
  .option("--init", "initialize a path for a/b swap", () => (initialize = true))
  .option("--copy", "copy existing path to inactive selection on initialize", () => (opts.copy = true))
  .option("--file", "expect (or create) regular files as targets", () => (opts.mode = "file"))
  .option("--directory", "expect (or create) directory as targets", () => (opts.mode = "directory"))
  .arguments("<path>")
  .action(arg => (path = arg))
  .parse(process.argv);

if (!path) {
  console.error("abswap: Path missing. Try --help.");
  process.exit(1);
} else {
  try {
    if (initialize) {
      abswap.init({ path, ...opts });
    } else {
      abswap.swap({ path, ...opts });
    }
  } catch (err) {
    console.error(`abswap: ${err.message}`);
    process.exit(1);
  }
}
