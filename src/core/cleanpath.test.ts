import { cleanpath } from "./names";

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

describe("Cleanpath", () => {
  test.each(testcases)("cleanpath(%p) should return %p", (path, expected) => {
    expect(typeof path).toBe("string");
    expect(typeof expected).toBe("string");
    expect(cleanpath(path)).toBe(expected);
  });

  test.each([undefined, null, "", false, true, 0, 1, [], {}])("cleanpath(%p) should throw an error", arg => {
    expect(() => cleanpath(arg as string)).toThrowError();
  });
});
