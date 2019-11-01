import Names from "./names";
import { Options } from "./options";
import { getSelection, makeSelection, Selection } from "./selection";
import { verifyAB } from "./verifyAB";

export async function swap(path: string, opts?: Options): Promise<void> {
  const names = new Names(path);
  await verifyAB(names, opts);
  await makeSelection(names, (await getSelection(names)) === Selection.A ? Selection.B : Selection.A);
}
