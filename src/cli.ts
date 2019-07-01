#!/usr/bin/env node

import * as program from "commander";
import * as abswap from "./abswap";
import version from "./version";

let mode;
let initialize = false;
let path = "";

program
  .name("abswap")
  .version(version)
  .option("--init", "initialize a path for a/b swap", () => (initialize = true))
  .option("--file", "expect (or creates) regular files as targets", () => (mode = abswap.Mode.File))
  .option("--directory", "expect (or creates) directory as targets", () => (mode = abswap.Mode.Directory))
  .arguments("<path>")
  .action(arg => {
    path = arg;
  })
  .parse(process.argv);

if (path === "") {
  console.error("abswap: Path argument missing.");
  process.exit(1);
}

try {
  if (initialize) {
    abswap.init(path, mode);
  } else {
    abswap.swap(path);
  }
} catch (err) {
  console.error(`abswap: ${err.message}`);
  process.exit(1);
}
