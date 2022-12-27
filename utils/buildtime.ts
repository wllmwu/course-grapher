import { promises as fs } from "fs";
import path from "path";

export const slugifyCourseFile: (code: string) => string = (code) =>
  code.replaceAll(" ", "_").replaceAll("\u2013", "-");

/**
 * Reads the contents of the specified file in the `scraping/data` directory.
 * Uses the `fs` Promises API--see documentation below:
 *
 * https://nodejs.org/api/fs.html#fspromisesreadfilepath-options
 *
 * @param filePath The path to the file relative to `scraping/data`
 * @returns A `Promise` which resolves to the file's contents, as a string
 */
export const readDataFile: (filePath: string) => Promise<string> = async (
  filePath
) => {
  filePath = path.join(process.cwd(), "scraping/data", filePath);
  return await fs.readFile(filePath, "utf-8");
};

/**
 * Reads the data directory and extracts all course codes
 *
 * @returns A `Promise` which resolves to a string array containing all
 * slugified course codes in the data set
 */
export const getCourseCodeSlugs: () => Promise<string[]> = async () => {
  const slugs = await readDataDirectory();
  let index = slugs.indexOf("departments.json");
  if (index != -1) {
    slugs.splice(index, 1);
  }
  index = slugs.indexOf("statistics.json");
  if (index != -1) {
    slugs.splice(index, 1);
  }
  return slugs.map((slug) => slug.slice(0, -5)); // remove ".json"
};

/**
 * Reads the contents of the `scraping/data` directory. Uses the `fs` Promises
 * API--see documentation below:
 *
 * https://nodejs.org/api/fs.html#fspromisesreaddirpath-options
 *
 * @returns A `Promise` which resolves to a string array containing the names of
 * all files in the data directory
 */
export const readDataDirectory: () => Promise<string[]> = async () => {
  const dirPath = path.join(process.cwd(), "scraping/data");
  return await fs.readdir(dirPath);
};
