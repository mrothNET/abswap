import { readFileSync } from "fs";
import { join } from "path";

const path = join(__dirname, "../package.json")
const { version } = JSON.parse(readFileSync(path, {encoding: "utf-8"}));

export default version;
