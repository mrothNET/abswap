import {
  ensureDirSync,
  ensureFileSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  removeSync,
  symlinkSync,
  writeFileSync,
} from "fs-extra";

import { tmpdir } from "os";
import { join } from "path";
import { chdir, cwd } from "process";
import * as abswap from ".";
import { Filetype, getFiletype } from "../core/filetype";

let savedWorkingDirectory = "";
let actualWorkingDirectory = "";
let tempCounter = 0;

beforeAll(() => {
  savedWorkingDirectory = cwd();
});

beforeEach(() => {
  actualWorkingDirectory = join(tmpdir(), `abswap.test.${++tempCounter}.___${Date.now()}___`);
  mkdirSync(actualWorkingDirectory);
  chdir(actualWorkingDirectory);
});

afterEach(() => {
  chdir(savedWorkingDirectory);
  if (actualWorkingDirectory !== "") {
    removeSync(actualWorkingDirectory);
    actualWorkingDirectory = "";
  }
});

async function expectAB(filetype: Filetype, selection: "a" | "b"): Promise<void> {
  expect(await getFiletype("test")).toBe(Filetype.Symlink);
  expect(await getFiletype("test.inactive")).toBe(Filetype.Symlink);
  expect(await getFiletype("test.a")).toBe(filetype);
  expect(await getFiletype("test.b")).toBe(filetype);

  expect(readlinkSync("test")).toBe(selection === "a" ? "test.a" : "test.b");
  expect(readlinkSync("test.inactive")).toBe(selection === "a" ? "test.b" : "test.a");
}

describe("abswap", () => {
  test("initialize default directories is working", async () => {
    await abswap.init("test");
    await expectAB(Filetype.Directory, "a");
  });

  test("initialize directories is working", async () => {
    await abswap.init("test", { directory: true });
    await expectAB(Filetype.Directory, "a");
  });

  test("initialize files is working", async () => {
    await abswap.init("test", { file: true });
    await expectAB(Filetype.File, "a");
  });

  test("use existing directory is working", async () => {
    ensureFileSync("test/marker");
    await abswap.init("test");
    await expectAB(Filetype.Directory, "a");
    expect(await getFiletype("test.a/marker")).toBe(Filetype.File);
    expect(await getFiletype("test.b/marker")).toBe(Filetype.Nonexistent);
  });

  test("use existing file is working", async () => {
    writeFileSync("test", "X");
    await abswap.init("test", { file: true });
    await expectAB(Filetype.File, "a");
    expect(await getFiletype("test.a")).toBe(Filetype.File);
    expect(await getFiletype("test.b")).toBe(Filetype.File);
    expect(readFileSync("test.a", { encoding: "ascii" })).toBe("X");
    expect(readFileSync("test.b", { encoding: "ascii" })).toBe("");
  });

  test("copy existing directory is working", async () => {
    ensureFileSync("test/marker");
    await abswap.init("test", { copy: true });
    await expectAB(Filetype.Directory, "a");
    expect(await getFiletype("test.a/marker")).toBe(Filetype.File);
    expect(await getFiletype("test.b/marker")).toBe(Filetype.File);
  });

  test("copy existing file is working", async () => {
    writeFileSync("test", "X");
    await abswap.init("test", { copy: true });
    expect(await getFiletype("test.a")).toBe(Filetype.File);
    expect(await getFiletype("test.b")).toBe(Filetype.File);
    expect(readFileSync("test.a", { encoding: "ascii" })).toBe("X");
    expect(readFileSync("test.b", { encoding: "ascii" })).toBe("X");
  });

  test("swap directories is working", async () => {
    await abswap.init("test");
    await expectAB(Filetype.Directory, "a");
    ensureFileSync("test/markerA");
    ensureDirSync("test.inactive/markerB");

    await abswap.swap("test");
    await expectAB(Filetype.Directory, "b");
    expect(await getFiletype("test/markerB")).toBe(Filetype.Directory);
    expect(await getFiletype("test.inactive/markerA")).toBe(Filetype.File);

    await abswap.swap("test");
    await expectAB(Filetype.Directory, "a");
    expect(await getFiletype("test/markerA")).toBe(Filetype.File);
    expect(await getFiletype("test.inactive/markerB")).toBe(Filetype.Directory);
  });

  test("swap files is working", async () => {
    await abswap.init("test", { file: true });
    await expectAB(Filetype.File, "a");
    writeFileSync("test", "A");
    writeFileSync("test.inactive", "B");

    await abswap.swap("test");
    await expectAB(Filetype.File, "b");
    expect(readFileSync("test", { encoding: "ascii" })).toBe("B");
    expect(readFileSync("test.inactive", { encoding: "ascii" })).toBe("A");

    await abswap.swap("test");
    await expectAB(Filetype.File, "a");
    expect(readFileSync("test", { encoding: "ascii" })).toBe("A");
    expect(readFileSync("test.inactive", { encoding: "ascii" })).toBe("B");
  });

  test("undo directory is working", async () => {
    await abswap.init("test");
    ensureFileSync("test.inactive/marker");
    await abswap.swap("test");
    await abswap.undo("test");
    expect(await getFiletype("test")).toBe(Filetype.Directory);
    expect(await getFiletype("test/marker")).toBe(Filetype.File);
    expect(await getFiletype("test.inactive")).toBe(Filetype.Nonexistent);
    expect(await getFiletype("test.a")).toBe(Filetype.Nonexistent);
    expect(await getFiletype("test.b")).toBe(Filetype.Nonexistent);
  });

  test("undo file is working", async () => {
    await abswap.init("test", { file: true });
    writeFileSync("test", "A");
    writeFileSync("test.inactive", "B");
    await abswap.swap("test");
    await abswap.undo("test");
    expect(await getFiletype("test")).toBe(Filetype.File);
    expect(readFileSync("test", { encoding: "ascii" })).toBe("B");
    expect(await getFiletype("test.inactive")).toBe(Filetype.Nonexistent);
    expect(await getFiletype("test.a")).toBe(Filetype.Nonexistent);
    expect(await getFiletype("test.b")).toBe(Filetype.Nonexistent);
  });

  test("option --directory and existing file throws an error", async () => {
    ensureFileSync("test");
    await expect(abswap.init("test", { directory: true })).rejects.toThrowError();
  });

  test("option --file and existing directory throws an error", async () => {
    ensureDirSync("test");
    await expect(abswap.init("test", { file: true })).rejects.toThrowError();
  });

  test("missing 'active' symlink throws an error", async () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.b", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("missing 'inactive' symlink throws an error", async () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("missing 'a' component throws an error", async () => {
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("test.b", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("missing 'b' component throws an error", async () => {
    ensureFileSync("test.a");
    symlinkSync("test.a", "test");
    symlinkSync("test.b", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("invalid 'active' symlink throws an error", async () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("invalid", "test");
    symlinkSync("test.b", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("invalid 'inactive' symlink throws an error", async () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("invalid", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("symlinks targets are equal throws an error", async () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("test.a", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });

  test("invalid a/b structure throws an error", async () => {
    ensureFileSync("test.a");
    ensureDirSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("test.b", "test.inactive");
    await expect(abswap.swap("test")).rejects.toThrowError();
  });
});
