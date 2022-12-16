import type { Department } from "./data-schema";
import { readDataFile } from "./buildtime";

const departmentCache = new Map<string, Department>();

export async function populateDepartments() {
  if (departmentCache.size > 0) {
    return;
  }
  const departmentIndex = JSON.parse(
    await readDataFile("departments.json")
  ) as Record<string, Department>;
  for (const [code, department] of Object.entries(departmentIndex)) {
    departmentCache.set(code, department);
  }
}

export function getDepartment(code: string) {
  if (!departmentCache.has(code)) {
    throw new Error(`Department not in cache: ${code}`);
  }
  return departmentCache.get(code)!;
}
