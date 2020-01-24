import { readFile } from "fs-extra";
import { join } from "path";

let version: string | undefined;

export async function getVersion(): Promise<string> {
  if (!version) {
    const path = join(__dirname, "../../package.json");
    const json = await readFile(path, { encoding: "utf-8" });
    version = JSON.parse(json).version;
  }
  if (!version) {
    throw new Error("Version of abswap unknown.");
  }
  return version;
}
