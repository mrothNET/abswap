import { join } from "path";
import {
  isDirectory,
  isDirectoryOrMissing,
  isFile,
  isFileOrMissing,
  isMissing,
  isSymlink,
  isSymlinkOrMissing,
} from "../filetype";

function testdir(path: string) {
  return join("./testdata", path);
}

const ROOT = "/";
const FILE = testdir("file");
const DIRECTORY = testdir("directory");
const SYMLINK = testdir("symlink");
const NONEXISTENT = testdir("nonexistent");

function makeTestData(fn: (path: string) => boolean, truthies: string[], falsies: string[]) {
  return [fn.name, fn, truthies, falsies];
}

const allTests = [
  makeTestData(isMissing, [NONEXISTENT], [ROOT, FILE, DIRECTORY, SYMLINK]),

  makeTestData(isFile, [FILE], [ROOT, DIRECTORY, SYMLINK, NONEXISTENT]),
  makeTestData(isDirectory, [ROOT, DIRECTORY], [FILE, SYMLINK, NONEXISTENT]),
  makeTestData(isSymlink, [SYMLINK], [ROOT, FILE, DIRECTORY, NONEXISTENT]),

  makeTestData(isFileOrMissing, [FILE, NONEXISTENT], [ROOT, DIRECTORY, SYMLINK]),
  makeTestData(isDirectoryOrMissing, [ROOT, DIRECTORY, NONEXISTENT], [FILE, SYMLINK]),
  makeTestData(isSymlinkOrMissing, [SYMLINK, NONEXISTENT], [ROOT, FILE, DIRECTORY]),
];

describe.each(allTests)("%s():", (fname, isXyz, truthies, falsies) => {
  expect(typeof isXyz).toBe("function");

  describe.each([[true, truthies], [false, falsies]])("returns %p for:", (expected, paths) => {
    expect(typeof expected).toBe("boolean");

    // @ts-ignore
    test.each(paths)('"%s"', path => {
      expect(typeof path).toBe("string");

      // @ts-ignore
      expect(isXyz(join(__dirname, "../..", path))).toBe(expected);
    });
  });

  describe("throws an error for:", () => {
    test.each([undefined, null, "", true, false, 0, 1, {}, []])("%p", arg => {
      // @ts-ignore
      expect(() => isXyz(arg)).toThrowError();
    });
  });
});
