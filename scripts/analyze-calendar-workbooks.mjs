import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sources = [
  {
    key: "planned",
    path: "C:/Users/User/Desktop/планирани дейности 2026.xlsx"
  },
  {
    key: "auditors",
    path: "C:/Users/User/Desktop/календар одитори 2026.xlsx"
  }
];

const outputDir = "scripts/calendar-analysis";
await fs.mkdir(outputDir, { recursive: true });

const analysis = {};

for (const source of sources) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source.path));
  const sheetInfo = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 12000 });
  const sheets = sheetInfo.ndjson
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  analysis[source.key] = [];
  for (const [sheetIndex, sheetInfoItem] of sheets.entries()) {
    const sheet = workbook.worksheets.getItem(sheetInfoItem.name);
    const used = sheet.getUsedRange();
    const formulas = used.formulas;
    const values = used.values;
    const styles = await workbook.inspect({
      kind: "computedStyle",
      sheetId: sheetInfoItem.name,
      range: used.address,
      maxChars: 50000,
      options: { maxResults: 500 }
    });
    analysis[source.key].push({
      name: sheetInfoItem.name,
      address: used.address,
      values,
      formulas,
      styles: styles.ndjson
    });

    const preview = await workbook.render({
      sheetName: sheetInfoItem.name,
      autoCrop: "all",
      scale: 0.8,
      format: "png"
    });
    const previewName = `${source.key}-${String(sheetIndex + 1).padStart(2, "0")}-${sheetInfoItem.name}.png`;
    await fs.writeFile(
      path.join(outputDir, previewName),
      new Uint8Array(await preview.arrayBuffer())
    );
  }
}

await fs.writeFile(
  path.join(outputDir, "analysis.json"),
  JSON.stringify(analysis, null, 2),
  "utf8"
);

console.log(
  JSON.stringify({
    plannedSheets: analysis.planned.length,
    auditorSheets: analysis.auditors.length,
    outputDir
  })
);
