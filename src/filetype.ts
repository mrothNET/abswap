import { lstatSync, Stats } from "fs";

const testFile = Stats.prototype.isFile;
const testDirectory = Stats.prototype.isDirectory;
const testSymlink = Stats.prototype.isSymbolicLink;

export function isMissing(path: string): boolean {
  assertPathValid(path);
  try {
    lstatSync(path);
    return false;
  } catch {
    return true;
  }
}

export function isFile(path: string): boolean {
  return testFiletype(path, testFile, true);
}

export function isDirectory(path: string): boolean {
  return testFiletype(path, testDirectory, true);
}

export function isSymlink(path: string): boolean {
  return testFiletype(path, testSymlink, true);
}

export function isFileOrMissing(path: string): boolean {
  return testFiletype(path, testFile, false);
}
export function isDirectoryOrMissing(path: string): boolean {
  return testFiletype(path, testDirectory, false);
}

export function isSymlinkOrMissing(path: string): boolean {
  return testFiletype(path, testSymlink, false);
}

function testFiletype(path: string, fn: () => boolean, required: boolean): boolean {
  assertPathValid(path);
  try {
    const stat = lstatSync(path);
    return fn.call(stat);
  } catch (err) {
    if (err.code === "ENOENT") {
      return !required;
    } else {
      throw err;
    }
  }
}

function assertPathValid(path: string): void {
  if (typeof path !== "string" || path === "") {
    throw new Error("Empty path not allowed");
  }
}
