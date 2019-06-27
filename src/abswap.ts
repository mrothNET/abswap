import { readlinkSync, unlinkSync } from "fs";
import { basename } from "path";
import { mkdirp, symlink } from "./filesystem";
import { isDirectory, isDirectoryOrMissing, isSymlink, isSymlinkOrMissing } from "./filetype";
import names from "./names";

enum Selection {
  A = "A",
  B = "B",
}

export function init(path: string): void {
  const { a, b, active, inactive } = names(path);

  verifyExistingPath(isSymlinkOrMissing, active);
  verifyExistingPath(isSymlinkOrMissing, inactive);
  verifyExistingPath(isDirectoryOrMissing, a);
  verifyExistingPath(isDirectoryOrMissing, b);

  mkdirp(a);
  mkdirp(b);

  symlink(basename(a), active);
  symlink(basename(b), inactive);
}

export function swap(path: string): void {
  const { a, b, active, inactive } = names(path);

  verifyRequiredPath(isSymlink, active);
  verifyRequiredPath(isSymlink, inactive);
  verifyRequiredPath(isDirectory, a);
  verifyRequiredPath(isDirectory, b);

  switch (currentSelection(path)) {
    case Selection.A:
      unlinkSync(inactive);
      symlink(basename(b), active);
      symlink(basename(a), inactive);
      break;

    case Selection.B:
      unlinkSync(inactive);
      symlink(basename(a), active);
      symlink(basename(b), inactive);
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

function currentSelection(path: string): Selection {
  const { a, b, active, inactive } = names(path);

  const basenameA = basename(a);
  const basenameB = basename(b);

  const targetActive = readlinkSync(active);
  if (targetActive !== basenameA && targetActive !== basenameB) {
    throw new Error(`Symlink '${active}': Invalid target: '${targetActive}'.`);
  }

  const targetInactive = readlinkSync(inactive);
  if (targetInactive !== basenameA && targetInactive !== basenameB) {
    throw new Error(`Symlink '${inactive}': Invalid target: '${targetInactive}'.`);
  }

  if (targetActive === targetInactive) {
    throw new Error("Symlinks '${active}' and '${inactive}': Equal target: '${targetActive}'.");
  }

  return targetActive === basenameA ? Selection.A : Selection.B;
}
