import { copy, ensureDir, ensureFile, rename } from "fs-extra";
import { Filetype, getFiletype, makeSelection, Names, Selection } from "../core";
import { Options } from "./options";

export interface InitOptions extends Options {
  copy?: boolean;
}

enum InitMode {
  NonExistent,
  File,
  Directory,
}

export async function init(path: string, opts?: InitOptions): Promise<void> {
  const names = new Names(path);
  const initMode = await guessInitMode(names);

  if (initMode === InitMode.NonExistent) {
    await initNonexistent(names, opts);
  } else {
    await initExisting(names, initMode, opts);
  }
}

async function guessInitMode(names: Names): Promise<InitMode> {
  const filetypes = await Promise.all([names.a, names.b, names.inactive].map(getFiletype));

  if (filetypes.some(ft => ft !== Filetype.Nonexistent)) {
    throw new Error("File or directory to create already exists.");
  }

  switch (await getFiletype(names.active)) {
    case Filetype.Nonexistent:
      return InitMode.NonExistent;

    case Filetype.File:
      return InitMode.File;

    case Filetype.Directory:
      return InitMode.Directory;

    default:
      throw new Error(`Path '${names.active}': Unknown filetype.`);
  }
}

async function initNonexistent(names: Names, opts?: InitOptions): Promise<void> {
  const ensurePath = opts?.file ? ensureFile : ensureDir;
  await Promise.all([ensurePath(names.a), ensurePath(names.b)]);
  await makeSelection(names, Selection.A);
}

async function initExisting(names: Names, initMode: InitMode, opts?: InitOptions): Promise<void> {
  if (initMode === InitMode.Directory && opts?.file) {
    throw new Error(`Directory '${names.active}': Expected to be a regular file.`);
  }

  if (initMode === InitMode.File && opts?.directory) {
    throw new Error(`File '${names.active}': Expected to be a directory.`);
  }

  if (opts?.copy) {
    await copy(names.active, names.b, { overwrite: false, errorOnExist: true, preserveTimestamps: true });
  } else if (initMode === InitMode.Directory) {
    await ensureDir(names.b);
  } else if (initMode === InitMode.File) {
    await ensureFile(names.b);
  }

  await rename(names.active, names.a);
  await makeSelection(names, Selection.A);
}
