import { Names } from "./names";

type TestCase = { active: string, inactive: string, a: string, b: string, basenameA: string, basenameB: string };

function makeTestcase(path: string, base: string, basename?: string) {
  return [
    path,
    {
      active: base,
      inactive: base + ".inactive",

      a: base + ".a",
      b: base + ".b",

      basenameA: (basename || base) + ".a",
      basenameB: (basename || base) + ".b",
    },
  ] as [string, TestCase];
}

const testcases = [
  makeTestcase("testdir", "testdir"),
  makeTestcase("dir/.", "dir"),
  makeTestcase("./dir", "dir"),
  makeTestcase("../dir", "../dir", "dir"),
  makeTestcase("a/b/..", "a"),
];

describe("Names", () => {
  test.each(testcases)("Names(%p)", (path, expected) => {
    expect(typeof path).toBe("string");
    expect(typeof expected).toBe("object");
    expect(new Names(path)).toMatchObject<Names>(expected);
  });

  const illegals = ["/", ".", "..", "", "dir/..", undefined, null, false, true, 0, 1, [], {}];

  test.each(illegals)("Names(%p) should throw an error", arg => {
    expect(() => new Names(arg as string)).toThrowError();
  });
});
