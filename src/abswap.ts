import { copy, ensureDir, ensureFile, remove, rename } from "fs-extra";
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

export async function init(args: Arguments): Promise<void> {
  const names = new Names(args.path);

  const mode = await guessInitMode(names);
  switch (mode) {
    case InitMode.NonExistent:
      return initNonexistent(names, args);

    case InitMode.File:
    case InitMode.Directory:
      return initExisting(names, args, mode);

    default:
      throw new Error(`Cannot initialize '${args.path}': Invalid path entries or combinations.`);
  }
}

async function guessInitMode(names: Names): Promise<InitMode> {
  if (
    (await getFiletype(names.a)) !== Filetype.Nonexistent ||
    (await getFiletype(names.b)) !== Filetype.Nonexistent ||
    (await getFiletype(names.inactive)) !== Filetype.Nonexistent
  ) {
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

async function initNonexistent(names: Names, args: Arguments): Promise<void> {
  const ensure = args.mode === "file" ? ensureFile : ensureDir;
  await Promise.all([ensure(names.a), ensure(names.b)]);
  return makeSelection(names, Selection.A);
}

async function initExisting(names: Names, args: Arguments, mode: InitMode): Promise<void> {
  if (mode === InitMode.Directory && args.mode === "file") {
    throw new Error(`Directory '${names.active}': Expected to be a regular file.`);
  }

  if (mode === InitMode.File && args.mode === "directory") {
    throw new Error(`File '${names.active}': Expected to be a directory.`);
  }

  if (args.copy) {
    await copy(names.active, names.b, { overwrite: false, errorOnExist: true, preserveTimestamps: true });
  } else if (mode === InitMode.Directory) {
    await ensureDir(names.b);
  } else if (mode === InitMode.File) {
    await ensureFile(names.b);
  }

  await rename(names.active, names.a);
  return makeSelection(names, Selection.A);
}

export async function undo(args: Arguments): Promise<void> {
  const names = new Names(args.path);
  await verifyAB(names, args.mode);

  const selection = await getSelection(names);

  await Promise.all([
    remove(names.inactive),
    remove(selection === Selection.A ? names.b : names.a),
    remove(names.active),
  ]);

  return rename(selection === Selection.A ? names.a : names.b, names.active);
}

export async function swap(args: Arguments): Promise<void> {
  const names = new Names(args.path);
  await verifyAB(names, args.mode);
  return makeSelection(names, (await getSelection(names)) === Selection.A ? Selection.B : Selection.A);
}

async function verifyAB(names: Names, mode: "file" | "directory" | undefined): Promise<void> {
  switch (mode) {
    case "file":
      await Promise.all([verifyRequiredFile(names.a), verifyRequiredFile(names.b)]);
      break;

    case "directory":
      await Promise.all([verifyRequiredDirectory(names.a), verifyRequiredDirectory(names.b)]);
      break;

    default:
      await Promise.all([verifyRequiredPath(names.a), verifyRequiredPath(names.b)]);
      const [typeA, typeB] = await Promise.all([getFiletype(names.a), getFiletype(names.b)]);
      if (typeA !== typeB) {
        throw new Error(`Path '${names.a}' and '${names.b}': Different file types`);
      }
  }
}

async function verifyRequiredPath(path: string): Promise<void> {
  if ((await getFiletype(path)) === Filetype.Nonexistent) {
    throw new Error(`Required path '${path}': Missing.`);
  }
}

async function verifyRequiredFile(path: string): Promise<void> {
  const ft = await getFiletype(path);
  if (ft !== Filetype.File) {
    throw new Error(
      `Required regular file '${path}': ${ft === Filetype.Nonexistent ? "Missing" : "Not a regular file"}.`,
    );
  }
}

async function verifyRequiredDirectory(path: string): Promise<void> {
  const ft = await getFiletype(path);
  if (ft !== Filetype.Directory) {
    throw new Error(`Required directory '${path}': ${ft === Filetype.Nonexistent ? "Missing" : "Not a directory"}.`);
  }
}
