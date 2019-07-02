import { join } from "path";
import { getSelection, Selection } from "../selection";
import Names from "../names";

const testdir = "../../testdata";

describe("Selection", () => {
  test("getSelection() should return Selection.A", () => {
    const names = new Names(join(__dirname, testdir, "selection-a"));
    expect(getSelection(names)).toBe(Selection.A);
  });

  test("getSelection() should return Selection.B", () => {
    const names = new Names(join(__dirname, testdir, "selection-b"));
    expect(getSelection(names)).toBe(Selection.B);
  });

  test("getSelection() should throw", () => {
    const names = new Names(join(__dirname, testdir, "symlink"));
    expect(() => getSelection(names)).toThrowError();
  });
});
