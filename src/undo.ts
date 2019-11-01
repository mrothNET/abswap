import { remove, rename } from "fs-extra";
import Names from "./names";
import { Options } from "./options";
import { getSelection, Selection } from "./selection";
import { verifyAB } from "./verifyAB";

export async function undo(path: string, opts?: Options): Promise<void> {
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
