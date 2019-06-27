import cleanpath from "../cleanpath";

const testcases = [
  ["/", "/"],
  ["/..", "/"],
  ["/../", "/"],
  ["/..//", "/"],
  ["/../..", "/"],
  ["/../../", "/"],
  ["/../..//", "/"],

  ["/.", "/"],
  ["/./.", "/"],
  ["/././", "/"],
  ["/././/", "/"],
  ["/././..", "/"],
  ["/././../", "/"],
  ["/././..//", "/"],
  ["/././../..", "/"],
  ["/././../../", "/"],
  ["/././../..//", "/"],

  ["/dir", "/dir"],
  ["/dir/", "/dir"],
  ["/dir//", "/dir"],
  ["/dir/..", "/"],
  ["/dir/../", "/"],
  ["/dir/..//", "/"],
  ["/dir/../..", "/"],
  ["/dir/../../", "/"],
  ["/dir/../..//", "/"],

  ["/dir/.", "/dir"],
  ["/dir/./.", "/dir"],
  ["/dir/././", "/dir"],
  ["/dir/././/", "/dir"],
  ["/dir/././..", "/"],
  ["/dir/././../", "/"],
  ["/dir/././..//", "/"],
  ["/dir/././../..", "/"],
  ["/dir/././../../", "/"],
  ["/dir/././../..//", "/"],

  ["dir", "dir"],
  ["dir/", "dir"],
  ["dir//", "dir"],
  ["dir/..", "."],
  ["dir/../", "."],
  ["dir/..//", "."],
  ["dir/../..", ".."],
  ["dir/../../", ".."],
  ["dir/../..//", ".."],
  ["dir/../../..", "../.."],
  ["dir/../../../", "../.."],
  ["dir/../../..//", "../.."],

  ["dir/.", "dir"],
  ["dir/./.", "dir"],
  ["dir/././", "dir"],
  ["dir/././/", "dir"],
  ["dir/././..", "."],
  ["dir/././../", "."],
  ["dir/././..//", "."],
  ["dir/././../..", ".."],
  ["dir/././../../", ".."],
  ["dir/././../..//", ".."],
];

test.each(testcases)("cleanpath(%p) should return %p", (path, expected) => {
  expect(typeof path).toBe("string");
  expect(typeof expected).toBe("string");
  // @ts-ignore
  expect(cleanpath(path)).toBe(expected);
});

test.each([undefined, null, "", false, true, 0, 1, [], {}])("cleanpath(%p) should throw an error", arg => {
  // @ts-ignore
  expect(() => cleanpath(arg)).toThrowError();
});
