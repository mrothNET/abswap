#!/usr/bin/env node

import * as program from "commander";
import * as abswap from "./abswap";
import version from "./version";

async function cli(argv: string[]) {
  let path: string | undefined;
  let [init, undo, file, directory, copy] = [false, false, false, false, false];

  program
    .name("abswap")
    .version(version)
    .option("--init", "initialize a path for a/b swap", () => (init = true))
    .option("--copy", "copy existing path to inactive selection on initialize", () => (copy = true))
    .option("--file", "expect (or create) regular files as targets", () => (file = true))
    .option("--directory", "expect (or create) directory as targets", () => (directory = true))
    .option("--undo", "delete a/b structure und keep active selection", () => (undo = true))
    .arguments("<path>")
    .action(arg => (path = arg))
    .parse(argv);

  if (!path) {
    console.error("abswap: Path missing. Try 'abswap --help'.");
    process.exit(1);
  } else {
    try {
      if (init) {
        await abswap.init(path, { file, directory, copy });
      } else if (undo) {
        await abswap.undo(path, { file, directory });
      } else {
        await abswap.swap(path, { file, directory });
      }
    } catch (err) {
      console.error(`abswap: ${err.message}`);
      process.exit(1);
    }
  }
}

cli(process.argv);
