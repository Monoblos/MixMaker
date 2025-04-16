import { mkdir, writeFile } from "node:fs/promises";
import { drugs } from "./src/data/drug";
import { EfficientMapper } from "./src/drupmapper/efficientmapper";
import path from "node:path";

const RECIPE_FOLDER = "./public/recipes"

try {
  await mkdir(RECIPE_FOLDER);
} catch (e) {
  console.log("Recipe folder already exists.");
  // Already exists, don't care.
}

const writeOps: Promise<void>[] = [];
const mapper = new EfficientMapper();
for (const [drugName, drug] of Object.entries(drugs)) {
  console.log("Building drug " + drugName);
  mapper.init(8, false, drug());
  writeOps.push(writeFile(path.join(RECIPE_FOLDER, drugName), mapper.compressArray()));
}

await Promise.all(writeOps);