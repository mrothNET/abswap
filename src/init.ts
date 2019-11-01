import { copy, ensureDir, ensureFile, rename } from "fs-extra";
import { Filetype, getFiletype } from "./filetype";
import Names from "./names";
import { InitOptions } from "./options";
import { makeSelection, Selection } from "./selection";

enum InitMode {
  Unknown,
  NonExistent,
  File,
  Directory,
}

export async function init(path: string, opts?: InitOptions): Promise<void> {
  const names = new Names(path);

  const mode = await guessInitMode(names);
  switch (mode) {
    case InitMode.NonExistent:
      return initNonexistent(names, opts);

    case InitMode.File:
    case InitMode.Directory:
      return initExisting(names, mode, opts);

    default:
      throw new Error(`Cannot initialize '${path}': Invalid path entries or combinations.`);
  }
}

async function guessInitMode(names: Names): Promise<InitMode> {
  const filetypes = await Promise.all([names.a, names.b, names.inactive].map(getFiletype));

  if (filetypes.some(ft => ft !== Filetype.Nonexistent)) {
    return InitMode.Unknown;
  }

  switch (await getFiletype(names.active)) {
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

async function initNonexistent(names: Names, opts?: InitOptions): Promise<void> {
  const ensure = opts && opts.file ? ensureFile : ensureDir;
  await Promise.all([ensure(names.a), ensure(names.b)]);
  await makeSelection(names, Selection.A);
}

async function initExisting(names: Names, mode: InitMode, opts?: InitOptions): Promise<void> {
  if (mode === InitMode.Directory && opts && opts.file) {
    throw new Error(`Directory '${names.active}': Expected to be a regular file.`);
  }

  if (mode === InitMode.File && opts && opts.directory) {
    throw new Error(`File '${names.active}': Expected to be a directory.`);
  }

  if (opts && opts.copy) {
    await copy(names.active, names.b, { overwrite: false, errorOnExist: true, preserveTimestamps: true });
  } else if (mode === InitMode.Directory) {
    await ensureDir(names.b);
  } else if (mode === InitMode.File) {
    await ensureFile(names.b);
  }

  await rename(names.active, names.a);
  await makeSelection(names, Selection.A);
}
