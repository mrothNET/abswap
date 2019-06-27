import { mkdirSync, renameSync, symlinkSync } from "fs";
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
