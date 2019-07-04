import { readFileSync, readlinkSync, writeFileSync, symlinkSync } from "fs";
import { ensureFileSync, mkdirSync, removeSync, ensureDirSync } from "fs-extra";
import { tmpdir } from "os";
import { join } from "path";
import { chdir, cwd } from "process";
import * as abswap from "../abswap";
import { Filetype, getFiletype } from "../filetype";

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

function expectAB(filetype: Filetype, selection: "a" | "b") {
  expect(getFiletype("test")).toBe(Filetype.Symlink);
  expect(readlinkSync("test")).toBe(selection === "a" ? "test.a" : "test.b");

  expect(getFiletype("test.inactive")).toBe(Filetype.Symlink);
  expect(readlinkSync("test.inactive")).toBe(selection === "a" ? "test.b" : "test.a");

  expect(getFiletype("test.a")).toBe(filetype);
  expect(getFiletype("test.b")).toBe(filetype);
}

describe("abswap", () => {
  test("initialize default directories is working", () => {
    abswap.init({ path: "test" });
    expectAB(Filetype.Directory, "a");
  });

  test("initialize directories is working", () => {
    abswap.init({ path: "test", mode: "directory" });
    expectAB(Filetype.Directory, "a");
  });

  test("initialize files is working", () => {
    abswap.init({ path: "test", mode: "file" });
    expectAB(Filetype.File, "a");
  });

  test("use existing directory is working", () => {
    ensureFileSync("test/marker");
    abswap.init({ path: "test" });
    expectAB(Filetype.Directory, "a");
    expect(getFiletype("test.a/marker")).toBe(Filetype.File);
    expect(getFiletype("test.b/marker")).toBe(Filetype.Nonexistent);
  });

  test("use existing file is working", () => {
    writeFileSync("test", "X");
    abswap.init({ path: "test", mode: "file" });
    expectAB(Filetype.File, "a");
    expect(getFiletype("test.a")).toBe(Filetype.File);
    expect(getFiletype("test.b")).toBe(Filetype.File);
    expect(readFileSync("test.a", "ASCII")).toBe("X");
    expect(readFileSync("test.b", "ASCII")).toBe("");
  });


  test("copy existing directory is working", () => {
    ensureFileSync("test/marker");
    abswap.init({ path: "test", copy: true });
    expectAB(Filetype.Directory, "a");
    expect(getFiletype("test.a/marker")).toBe(Filetype.File);
    expect(getFiletype("test.b/marker")).toBe(Filetype.File);
  });

  test("copy existing file is working", () => {
    writeFileSync("test", "X");
    abswap.init({ path: "test", copy: true });
    expect(getFiletype("test.a")).toBe(Filetype.File);
    expect(getFiletype("test.b")).toBe(Filetype.File);
    expect(readFileSync("test.a", "ASCII")).toBe("X");
    expect(readFileSync("test.b", "ASCII")).toBe("X");
  });

  test("swap directories is working", () => {
    abswap.init({ path: "test" });
    expectAB(Filetype.Directory, "a");
    ensureFileSync("test/markerA");
    ensureDirSync("test.inactive/markerB");

    abswap.swap({ path: "test" });
    expectAB(Filetype.Directory, "b");
    expect(getFiletype("test/markerB")).toBe(Filetype.Directory);
    expect(getFiletype("test.inactive/markerA")).toBe(Filetype.File);

    abswap.swap({ path: "test" });
    expectAB(Filetype.Directory, "a");
    expect(getFiletype("test/markerA")).toBe(Filetype.File);
    expect(getFiletype("test.inactive/markerB")).toBe(Filetype.Directory);

  });

  test("swap files is working", () => {
    abswap.init({ path: "test", mode: "file" });
    expectAB(Filetype.File, "a");
    writeFileSync("test", "A");
    writeFileSync("test.inactive", "B");

    abswap.swap({ path: "test" });
    expectAB(Filetype.File, "b");
    expect(readFileSync("test", "ASCII")).toBe("B");
    expect(readFileSync("test.inactive", "ASCII")).toBe("A");

    abswap.swap({ path: "test" });
    expectAB(Filetype.File, "a");
    expect(readFileSync("test", "ASCII")).toBe("A");
    expect(readFileSync("test.inactive", "ASCII")).toBe("B");
  });

  test("undo directory is working", () => {
    abswap.init({ path: "test" });
    ensureFileSync("test.inactive/marker");
    abswap.swap({ path: "test" });
    abswap.undo({ path: "test" });
    expect(getFiletype("test")).toBe(Filetype.Directory);
    expect(getFiletype("test/marker")).toBe(Filetype.File);
    expect(getFiletype("test.inactive")).toBe(Filetype.Nonexistent);
    expect(getFiletype("test.a")).toBe(Filetype.Nonexistent);
    expect(getFiletype("test.b")).toBe(Filetype.Nonexistent);
  });

  test("undo file is working", () => {
    abswap.init({ path: "test", mode: "file" });
    writeFileSync("test", "A");
    writeFileSync("test.inactive", "B");
    abswap.swap({ path: "test" });
    abswap.undo({ path: "test" });
    expect(getFiletype("test")).toBe(Filetype.File);
    expect(readFileSync("test", "ASCII")).toBe("B");
    expect(getFiletype("test.inactive")).toBe(Filetype.Nonexistent);
    expect(getFiletype("test.a")).toBe(Filetype.Nonexistent);
    expect(getFiletype("test.b")).toBe(Filetype.Nonexistent);
  });

  test("option --directory and existing file throws an error", () => {
    ensureFileSync("test");
    expect(() => abswap.init({ path: "test", mode: "directory" })).toThrowError();
  })

  test("option --file and existing directory throws an error", () => {
    ensureDirSync("test");
    expect(() => abswap.init({ path: "test", mode: "file" })).toThrowError();
  })

  test("missing 'active' symlink throws an error", () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.b", "test.inactive");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("missing 'inactive' symlink throws an error", () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("missing 'a' component throws an error", () => {
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("test.b", "test.inactive");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("missing 'a' component throws an error", () => {
    ensureFileSync("test.a");
    symlinkSync("test.a", "test");
    symlinkSync("test.b", "test.inactive");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("invalid 'active' symlink throws an error", () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("invalid", "test");
    symlinkSync("test.b", "test.inactive");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("invalid 'inactive' symlink throws an error", () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("invalid", "test.inactive");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("symlinks targets are equal throws an error", () => {
    ensureFileSync("test.a");
    ensureFileSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("test.a", "test.inactive");
    expect(() => abswap.swap({path:"test"})).toThrowError();
  })

  test("invalid a/b structure throws an error", () => {
    ensureFileSync("test.a");
    ensureDirSync("test.b");
    symlinkSync("test.a", "test");
    symlinkSync("test.b", "test.inactive");
    expect(() => abswap.swap({path: "test"})).toThrowError();
  })
});
