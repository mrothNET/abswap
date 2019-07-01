import { mkdirSync, renameSync, symlinkSync, unlinkSync, writeFileSync } from "fs";
import { dirname } from "path";
import { isMissing } from "./filetype";

export function mkdirp(path: string): void {
  if (isMissing(path)) {
    mkdirSync(path, { recursive: true });
  }
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

export function touch(path: string): void {
  mkdirp(dirname(path));
  writeFileSync(path, "");
}
