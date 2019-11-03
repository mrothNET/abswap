import { readlink, remove, rename, symlink } from "fs-extra";
import { Names } from "./names";

export enum Selection {
  A = "A",
  B = "B",
}

export async function makeSelection(names: Names, select: Selection): Promise<void> {
  await remove(names.inactive);
  await safeSymlink(select === Selection.A ? names.basenameA : names.basenameB, names.active);
  await safeSymlink(select === Selection.A ? names.basenameB : names.basenameA, names.inactive);
}

export async function getSelection(names: Names): Promise<Selection> {
  const targetActive = await readlink(names.active);
  if (targetActive !== names.basenameA && targetActive !== names.basenameB) {
    throw new Error(`Symlink '${names.active}': Invalid target: '${targetActive}'.`);
  }

  const targetInactive = await readlink(names.inactive);
  if (targetInactive !== names.basenameA && targetInactive !== names.basenameB) {
    throw new Error(`Symlink '${names.inactive}': Invalid target: '${targetInactive}'.`);
  }

  if (targetActive === targetInactive) {
    throw new Error("Symlinks '${active}' and '${inactive}': Equal target: '${targetActive}'.");
  }

  return targetActive === names.basenameA ? Selection.A : Selection.B;
}

async function safeSymlink(target: string, path: string): Promise<void> {
  const temp = `${path}.___${Date.now()}___`;
  await symlink(target, temp);
  await rename(temp, path);
}
