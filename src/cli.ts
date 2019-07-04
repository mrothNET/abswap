#!/usr/bin/env node

import * as program from "commander";
import * as abswap from "./abswap";
import version from "./version";

let path: string | undefined;
let initialize = false;
let undo = false;

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
  .option("--undo", "delete a/b structure und keep active selection", () => (undo = true))
  .arguments("<path>")
  .action(arg => (path = arg))
  .parse(process.argv);

if (!path) {
  console.error("abswap: Path missing. Try 'abswap --help'.");
  process.exit(1);
} else {
  try {
    const args = { path, ...opts };

    if (initialize) {
      abswap.init(args);
    } else if (undo) {
      abswap.undo(args);
    } else {
      abswap.swap(args);
    }
  } catch (err) {
    console.error(`abswap: ${err.message}`);
    process.exit(1);
  }
}
