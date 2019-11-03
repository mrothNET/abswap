import { remove, rename } from "fs-extra";
import { getSelection, Names, Selection } from "./core";
import { Options } from "./options";
import { verifyAB } from "./verifyAB";

export type UndoOptions = Options;

export async function undo(path: string, opts?: UndoOptions): Promise<void> {
  const names = new Names(path);
  await verifyAB(names, opts);

  const selection = await getSelection(names);

  await Promise.all([
    remove(names.inactive),
    remove(selection === Selection.A ? names.b : names.a),
    remove(names.active),
  ]);

  await rename(selection === Selection.A ? names.a : names.b, names.active);
}
