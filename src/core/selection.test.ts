import { join } from "path";
import { Names } from "./names";
import { getSelection, Selection } from "./selection";

const testdir = "../../testdata";

describe("Selection", () => {
  test("getSelection() should return Selection.A", async () => {
    const names = new Names(join(__dirname, testdir, "selection-a"));
    expect(await getSelection(names)).toBe(Selection.A);
  });

  test("getSelection() should return Selection.B", async () => {
    const names = new Names(join(__dirname, testdir, "selection-b"));
    expect(await getSelection(names)).toBe(Selection.B);
  });

  test("getSelection() should throw", async () => {
    const names = new Names(join(__dirname, testdir, "symlink"));
    await expect(getSelection(names)).rejects.toThrowError();
  });
});
