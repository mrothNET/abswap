import { renameSync } from "fs";
import { mkdirp, touch } from "./filesystem";
import { isDirectory, isFile, isMissing } from "./filetype";
import Names from "./names";
import { getSelection, makeSelection, Selection } from "./selection";

export enum Mode {
  File = "File",
  Directory = "Directory",
}

export function init(path: string, mode?: Mode): void {
  const names = new Names(path);

  if (testAllNonexistent(names)) {
    if (mode === Mode.File) {
      touch(names.a);
      touch(names.b);
    } else {
      // Default: directory
      mkdirp(names.a);
      mkdirp(names.b);
    }
  } else if (testActiveIsDirectory(names)) {
    if (mode === Mode.File) {
      throw new Error(`Directory '${path}': Expected to be a regular file.`);
    }
    mkdirp(names.b);
    renameSync(names.active, names.a);
  } else if (testActiveIsFile(names)) {
    if (mode === Mode.Directory) {
      throw new Error(`File '${path}': Expected to be a directory.`);
    }
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
