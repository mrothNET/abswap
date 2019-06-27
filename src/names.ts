import cleanpath from "./cleanpath";

type NamesResult = {
  a: string;
  b: string;
  active: string;
  inactive: string;
};

export default function names(path: string): NamesResult {
  const cleaned = cleanpath(path);

  if (cleaned === "." || cleaned === "..") {
    throw new Error("Invalid path. Need a named entry (neither '.' nor '..').");
  }

  if (cleaned === "/") {
    throw new Error("Invalid path. Root directory ('/') not possible.");
  }

  return {
    active: cleaned,
    inactive: cleaned + ".inactive",
    a: cleaned + ".a",
    b: cleaned + ".b",
  };
}
