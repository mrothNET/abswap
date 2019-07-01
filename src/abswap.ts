import { renameSync } from "fs";
import { mkdirp, touch } from "./filesystem";
import { isDirectory, isFile, isMissing } from "./filetype";
import Names from "./names";
import { getSelection, makeSelection, Selection } from "./selection";

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
