import { mkdirSync, renameSync, symlinkSync, unlinkSync } from "fs";
import { isMissing } from "./filetype";

export function mkdirp(path: string): void {
  mkdirSync(path, { recursive: true });
}

export function symlink(target: string, path: string): void {
  const temp = `${path}.tmp.${Date.now().toString()}`;
  if (!isMissing(temp)) {
    throw new Error(`Temporary path '${temp}': Already existing.`);
  }

  symlinkSync(target, temp);
  renameSync(temp, path);
}

export function remove(path: string): void {
  try {
    unlinkSync(path);
  } catch (err) {
    if (err.code !== "ENOENT") {
      throw err;
    }
  }
}
