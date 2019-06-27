import names from "../names";

function makeTestcase(path: string, base: string) {
  return [path, { active: base, inactive: base + ".inactive", a: base + ".a", b: base + ".b" }];
}

const testcases = [
  makeTestcase("testdir", "testdir"),
  makeTestcase("dir/.", "dir"),
  makeTestcase("./dir", "dir"),
  makeTestcase("../dir", "../dir"),
  makeTestcase("a/b/..", "a"),
];

test.each(testcases)("names(%p)", (path, expected) => {
  expect(typeof path).toBe("string");
  expect(typeof expected).toBe("object");
  // @ts-ignore
  expect(names(path)).toStrictEqual(expected);
});

const illegals = ["/", ".", "..", "", "dir/..", undefined, null, false, true, 0, 1, [], {}];

test.each(illegals)("names(%p) should throw an error", arg => {
  // @ts-ignore
  expect(() => names(arg)).toThrowError();
});