#!/usr/bin/env node

import * as program from "commander";
import * as abswap from "./abswap";
import version from "./version";

let initialize = false;
let path = "";

program
  .name("abswap")
  .version(version)
  .option("--init", "initialize a path for a/b swap", () => (initialize = true))
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
    abswap.init(path);
  } else {
    abswap.swap(path);
  }
} catch (err) {
  console.error(`abswap: ${err.message}`);
  process.exit(1);
}
