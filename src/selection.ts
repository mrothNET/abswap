import { readlinkSync, removeSync } from "fs-extra";
import { symlink } from "./filesystem";
import Names from "./names";

export enum Selection {
  A = "A",
  B = "B",
}

export function makeSelection(names: Names, select: Selection): void {
  removeSync(names.inactive);
  symlink(select === Selection.A ? names.basenameA : names.basenameB, names.active);
  symlink(select === Selection.A ? names.basenameB : names.basenameA, names.inactive);
}

export function getSelection(names: Names): Selection {
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
