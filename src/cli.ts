#!/usr/bin/env node

import * as program from "commander";
import * as abswap from "./abswap";

async function cli(argv: string[]): Promise<number> {
  let path: string | undefined;
  let version, init, undo, file, directory, copy, verify;

  program
    .name("abswap")
    .option("-V, --version", "output the version number", () => (version = true))
    .option("--init", "initialize a path for a/b swap", () => (init = true))
    .option("--copy", "copy existing path to inactive selection on initialize", () => (copy = true))
    .option("--file", "expect (or create) regular files as targets", () => (file = true))
    .option("--directory", "expect (or create) directory as targets", () => (directory = true))
    .option("--undo", "delete a/b structure and keep active selection", () => (undo = true))
    .option("--verify", "verify a/b structure for consistence", () => (verify = true))
    .arguments("<path>")
    .action(arg => (path = arg))
    .parse(argv);

  if (version) {
    console.log(await abswap.getVersion());
    return 0;
  }

  if (!path) {
    console.error("abswap: Path missing. Try 'abswap --help'.");
    return 1;
  }

  try {
    if (verify) {
      await abswap.verify(path, { file, directory });
    } else if (init) {
      await abswap.init(path, { file, directory, copy });
    } else if (undo) {
      await abswap.undo(path, { file, directory });
    } else {
      await abswap.swap(path, { file, directory });
    }
  } catch (err) {
    console.error(`abswap: ${err.message}`);
    return 1;
  }

  return 0;
}

cli(process.argv).then(process.exit);
