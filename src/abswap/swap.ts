import { getSelection, makeSelection, Names, Options, Selection } from "../core";
import { verifyAB } from "./verify";

export type SwapOptions = Options;

export async function swap(path: string, opts?: SwapOptions): Promise<void> {
  const names = new Names(path);
  await verifyAB(names, opts);
  await makeSelection(names, (await getSelection(names)) === Selection.A ? Selection.B : Selection.A);
}
