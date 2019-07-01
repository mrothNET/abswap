import { readlinkSync, renameSync } from "fs";
import { mkdirp, remove, symlink, touch } from "./filesystem";
import { isDirectory, isFile, isMissing } from "./filetype";
import Names from "./names";

enum Selection {
  A = "A",
  B = "B",
}

export function init(path: string): void {
  const names = new Names(path);

  if (testAllNonexistent(names)) {
    mkdirp(names.a);
    mkdirp(names.b);
  } else if (testActiveIsDirectory(names)) {
    mkdirp(names.b);
    renameSync(names.active, names.a);
  } else if (testActiveIsFile(names)) {
    touch(names.b);
    renameSync(names.active, names.a);
  } else {
    throw new Error(`Cannot initialize '${path}': Invalid path entries or combinations.`);
  }

  makeSelection(names, Selection.A);
}

export function swap(path: string): void {
  const names = new Names(path);

  verifyRequiredPath(names.a);
  verifyRequiredPath(names.b);

  makeSelection(names, getSelection(names) === Selection.A ? Selection.B : Selection.A);
}

function testAllNonexistent(names: Names): boolean {
  return isMissing(names.a) && isMissing(names.b) && isMissing(names.active) && isMissing(names.inactive);
}

function testActiveIsDirectory(names: Names): boolean {
  return isMissing(names.a) && isMissing(names.b) && isDirectory(names.active) && isMissing(names.inactive);
}

function testActiveIsFile(names: Names): boolean {
  return isMissing(names.a) && isMissing(names.b) && isFile(names.active) && isMissing(names.inactive);
}

function verifyRequiredPath(path: string): void {
  if (isMissing(path)) {
    throw new Error(`Required path '${path}': Missing.`);
  }
}

function getSelection(names: Names): Selection {
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

function makeSelection(names: Names, select: Selection): void {
  remove(names.inactive);
  symlink(select === Selection.A ? names.basenameA : names.basenameB, names.active);
  symlink(select === Selection.A ? names.basenameB : names.basenameA, names.inactive);
}
