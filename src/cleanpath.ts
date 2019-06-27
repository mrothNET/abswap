import { join } from "path";

export default function cleanpath(path: string): string {
  if (path === "" || typeof path !== "string") {
    throw new Error("Invalid path argument");
  }
  return join(path, ".");
}
