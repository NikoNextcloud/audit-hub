import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const files = [
  {
    key: "planned",
    path: "C:/Users/User/Desktop/планирани дейности 2026.xlsx"
  },
  {
    key: "auditors",
    path: "C:/Users/User/Desktop/календар одитори 2026.xlsx"
  }
];

const result = {};

for (const file of files) {
  const input = await FileBlob.load(file.path);
  const workbook = await SpreadsheetFile.importXlsx(input);
  const overview = await workbook.inspect({
    kind: "workbook,sheet,table",
    maxChars: 16000,
    tableMaxRows: 12,
    tableMaxCols: 14,
    tableMaxCellChars: 120
  });
  result[file.key] = overview.ndjson;
}

await fs.writeFile("scripts/workbook-inspection.json", JSON.stringify(result, null, 2), "utf8");
console.log(JSON.stringify(result, null, 2));
