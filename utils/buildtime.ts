import { promises as fs } from "fs";
import path from "path";

export const readDataFile: (filePath: string) => Promise<string> = async (
  filePath
) => {
  filePath = path.join(process.cwd(), "scraping/data", filePath);
  return await fs.readFile(filePath, "utf-8");
};
