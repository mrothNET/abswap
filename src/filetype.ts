import { lstat } from "fs-extra";

export enum Filetype {
  Unknown,
  Nonexistent,
  File,
  Directory,
  Symlink,
}

export async function getFiletype(path: string): Promise<Filetype> {
  if (path === "") {
    throw new Error("Empty path not allowed");
  }

  try {
    const stat = await lstat(path);

    if (stat.isFile()) {
      return Filetype.File;
    } else if (stat.isDirectory()) {
      return Filetype.Directory;
    } else if (stat.isFile()) {
      return Filetype.File;
    } else if (stat.isSymbolicLink()) {
      return Filetype.Symlink;
    } else {
      return Filetype.Unknown;
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      return Filetype.Nonexistent;
    } else {
      throw err;
    }
  }
}
