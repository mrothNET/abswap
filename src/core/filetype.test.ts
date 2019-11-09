import { join } from "path";
import { Filetype, getFiletype } from "./filetype";

function testdir(path: string) {
  return join("./testdata", path);
}

const testData: Array<[Filetype, string]> = [
  [Filetype.Directory, "/"],
  [Filetype.Directory, testdir("directory")],
  [Filetype.File, testdir("file")],
  [Filetype.Symlink, testdir("symlink")],
  [Filetype.Nonexistent, testdir("nonexistent")],
  [Filetype.Nonexistent, " "],
];

describe("getFiletype()", () => {
  test.each(testData)("returns %p for: '%s'", async (expected, path) => {
    expect(typeof path).toBe("string");
    await expect(getFiletype(join(__dirname, "../..", path))).resolves.toBe(expected);
  });

  test.each([undefined, null, "", true, false, 0, 1, {}, []])("throws an error for: %p", async arg => {
    await expect(getFiletype(arg as string)).rejects.toThrowError();
  });
});
