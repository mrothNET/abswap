import { basename, join } from "path";

export class Names {
  public readonly active: string;
  public readonly inactive: string;

  public readonly a: string;
  public readonly b: string;

  public readonly basenameA: string;
  public readonly basenameB: string;

  constructor(path: string) {
    const cleaned = cleanpath(path);

    if (cleaned === "." || cleaned === "..") {
      throw new Error("Invalid path. Need a named entry (neither '.' nor '..').");
    }

    if (cleaned === "/") {
      throw new Error("Invalid path. Root directory ('/') not possible.");
    }

    this.active = cleaned;
    this.inactive = cleaned + ".inactive";

    this.a = cleaned + ".a";
    this.b = cleaned + ".b";

    this.basenameA = basename(this.a);
    this.basenameB = basename(this.b);
  }
}

export function cleanpath(path: string): string {
  if (path === "" || typeof path !== "string") {
    throw new Error("Invalid path argument");
  }
  return join(path, ".");
}
