import { readlinkSync, unlinkSync } from "fs";
import { mkdirp, symlink } from "./filesystem";
import { isDirectory, isDirectoryOrMissing, isSymlink, isSymlinkOrMissing } from "./filetype";
import Names from "./names";

enum Selection {
  A = "A",
  B = "B",
}

export function init(path: string): void {
  const names = new Names(path);

  verifyExistingPath(isSymlinkOrMissing, names.active);
  verifyExistingPath(isSymlinkOrMissing, names.inactive);
  verifyExistingPath(isDirectoryOrMissing, names.a);
  verifyExistingPath(isDirectoryOrMissing, names.b);

  mkdirp(names.a);
  mkdirp(names.b);

  symlink(names.basenameA, names.active);
  symlink(names.basenameB, names.inactive);
}

export function swap(path: string): void {
  const names = new Names(path);

  verifyRequiredPath(isSymlink, names.active);
  verifyRequiredPath(isSymlink, names.inactive);
  verifyRequiredPath(isDirectory, names.a);
  verifyRequiredPath(isDirectory, names.b);

  switch (currentSelection(names)) {
    case Selection.A:
      unlinkSync(names.inactive);
      symlink(names.basenameB, names.active);
      symlink(names.basenameA, names.inactive);
      break;

    case Selection.B:
      unlinkSync(names.inactive);
      symlink(names.basenameA, names.active);
      symlink(names.basenameB, names.inactive);
      break;
  }
}

function verifyExistingPath(pathTest: (path: string) => boolean, path: string): void {
  if (!pathTest(path)) {
    throw new Error(`Existing path '${path}': Invalid file type.`);
  }
}

function verifyRequiredPath(pathTest: (path: string) => boolean, path: string): void {
  if (!pathTest(path)) {
    throw new Error(`Required path '${path}': Missing.`);
  }
}

function currentSelection(names: Names): Selection {
  const targetActive = readlinkSync(names.active);
  if (targetActive !== names.basenameA && targetActive !== names.basenameB) {
    throw new Error(`Symlink '${names.active}': Invalid target: '${targetActive}'.`);
  }

  const targetInactive = readlinkSync(names.inactive);
  if (targetInactive !== names.basenameA && targetInactive !== names.basenameB) {
    throw new Error(`Symlink '${names.inactive}': Invalid target: '${targetInactive}'.`);
  }

  if (targetActive === targetInactive) {
    throw new Error("Symlinks '${active}' and '${inactive}': Equal target: '${targetActive}'.");
  }

  return targetActive === names.basenameA ? Selection.A : Selection.B;
}
