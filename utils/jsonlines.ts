export const parseJSONLines: (jsonLines: string) => object[] = (jsonLines) => {
  const objects: object[] = [];
  for (const jsonString of jsonLines.split("\n")) {
    if (jsonString.length === 0) {
      continue;
    }
    objects.push(JSON.parse(jsonString)); // JSON.parse throws if invalid syntax
  }
  return objects;
};
