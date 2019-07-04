import { copySync, ensureDirSync, ensureFileSync, removeSync, renameSync } from "fs-extra";
import { Filetype, getFiletype } from "./filetype";
import Names from "./names";
import { getSelection, makeSelection, Selection } from "./selection";

export type Arguments = {
  path: string;
  mode?: "file" | "directory";
  copy?: boolean;
};

enum InitMode {
  Unknown,
  NonExistent,
  File,
  Directory,
}

export function init(args: Arguments): void {
  const names = new Names(args.path);

  const mode = guessInitMode(names);
  switch (mode) {
    case InitMode.NonExistent:
      initNonexistent(names, args);
      break;

    case InitMode.File:
    case InitMode.Directory:
      initExisting(names, args, mode);
      break;

    default:
      throw new Error(`Cannot initialize '${args.path}': Invalid path entries or combinations.`);
      break;
  }
}

function guessInitMode(names: Names): InitMode {
  if (
    getFiletype(names.a) !== Filetype.Nonexistent ||
    getFiletype(names.b) !== Filetype.Nonexistent ||
    getFiletype(names.inactive) !== Filetype.Nonexistent
  ) {
    return InitMode.Unknown;
  }

  switch (getFiletype(names.active)) {
    case Filetype.Nonexistent:
      return InitMode.NonExistent;

    case Filetype.File:
      return InitMode.File;

    case Filetype.Directory:
      return InitMode.Directory;

    default:
      return InitMode.Unknown;
  }
}

function initNonexistent(names: Names, args: Arguments): void {
  if (args.mode === "file") {
    ensureFileSync(names.a);
    ensureFileSync(names.b);
  } else {
    ensureDirSync(names.a);
    ensureDirSync(names.b);
  }

  makeSelection(names, Selection.A);
}

function initExisting(names: Names, args: Arguments, mode: InitMode): void {
  if (mode === InitMode.Directory && args.mode === "file") {
    throw new Error(`Directory '${names.active}': Expected to be a regular file.`);
  }

  if (mode === InitMode.File && args.mode === "directory") {
    throw new Error(`File '${names.active}': Expected to be a directory.`);
  }

  if (args.copy) {
    copySync(names.active, names.b, { overwrite: false, errorOnExist: true, preserveTimestamps: true });
  } else if (mode === InitMode.Directory) {
    ensureDirSync(names.b);
  } else if (mode === InitMode.File) {
    ensureFileSync(names.b);
  }

  renameSync(names.active, names.a);
  makeSelection(names, Selection.A);
}

export function undo(args: Arguments): void {
  const names = new Names(args.path);
  verifyAB(names, args.mode);
  const selection = getSelection(names);

  removeSync(names.inactive);
  removeSync(selection === Selection.A ? names.b : names.a);
  removeSync(names.active);
  renameSync(selection === Selection.A ? names.a : names.b, names.active);
}

export function swap(args: Arguments): void {
  const names = new Names(args.path);
  verifyAB(names, args.mode);
  makeSelection(names, getSelection(names) === Selection.A ? Selection.B : Selection.A);
}

function verifyAB(names: Names, mode: "file" | "directory" | undefined): void {
  switch (mode) {
    case "file":
      verifyRequiredFile(names.a);
      verifyRequiredFile(names.b);
      break;

    case "directory":
      verifyRequiredDirectory(names.a);
      verifyRequiredDirectory(names.b);
      break;

    default:
      verifyRequiredPath(names.a);
      verifyRequiredPath(names.b);
  }
}

function verifyRequiredPath(path: string): void {
  if (getFiletype(path) === Filetype.Nonexistent) {
    throw new Error(`Required path '${path}': Missing.`);
  }
}

function verifyRequiredFile(path: string): void {
  const ft = getFiletype(path);
  if (ft !== Filetype.File) {
    throw new Error(
      `Required regular file '${path}': ${ft === Filetype.Nonexistent ? "Missing" : "Not a regular file"}.`,
    );
  }
}

function verifyRequiredDirectory(path: string): void {
  const ft = getFiletype(path);
  if (getFiletype(path) !== Filetype.Directory) {
    throw new Error(`Required directory '${path}': ${ft === Filetype.Nonexistent ? "Missing" : "Not a directory"}.`);
  }
}
