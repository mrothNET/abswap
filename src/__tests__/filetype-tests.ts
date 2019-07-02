import { join } from "path";
import { Filetype, getFiletype } from "../filetype";

function testdir(path: string) {
  return join("./testdata", path);
}

const testData = [
  [Filetype.Directory, "/"],
  [Filetype.Directory, testdir("directory")],
  [Filetype.File, testdir("file")],
  [Filetype.Symlink, testdir("symlink")],
  [Filetype.Nonexistent, testdir("nonexistent")],
  [Filetype.Nonexistent, " "],
];

describe("getFiletype()", () => {
  test.each(testData)("returns %p for: '%s'", (expected, path) => {
    expect(typeof path).toBe("string");
    // @ts-ignore
    expect(getFiletype(join(__dirname, "../..", path))).toBe(expected);
  });

  test.each([undefined, null, "", true, false, 0, 1, {}, []])("throws an error for: %p", arg => {
    // @ts-ignore
    expect(() => getFiletype(arg)).toThrowError();
  });
});
