import { renameSync, symlinkSync } from "fs-extra";
import { isMissing } from "./filetype";

export function symlink(target: string, path: string): void {
  const temp = `${path}.tmp.${Date.now().toString()}`;
  if (!isMissing(temp)) {
    throw new Error(`Temporary path '${temp}': Already existing.`);
  }

  symlinkSync(target, temp);
  renameSync(temp, path);
}
