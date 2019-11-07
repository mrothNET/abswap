import { Filetype, getFiletype, Names, Options } from "../core";

export type VerifyOptions = Options;

export async function verify(path: string, opts: VerifyOptions): Promise<void> {
  const names = new Names(path);
  await verifyAB(names, opts);
}

export async function verifyAB(names: Names, opts?: VerifyOptions): Promise<void> {
  if (opts?.file) {
    await Promise.all([verifyRequiredFile(names.a), verifyRequiredFile(names.b)]);
  } else if (opts?.directory) {
    await Promise.all([verifyRequiredDirectory(names.a), verifyRequiredDirectory(names.b)]);
  } else {
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
