import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const sources = [
  {
    key: "planned",
    name: "Планирани дейности",
    path: "C:/Users/User/Desktop/планирани дейности 2026.xlsx"
  },
  {
    key: "auditors",
    name: "Одитори",
    path: "C:/Users/User/Desktop/календар одитори 2026.xlsx"
  }
];

const monthNames = new Set([
  "Януари",
  "Февруари",
  "Март",
  "Април",
  "Май",
  "Юни",
  "Юли",
  "Август",
  "Септември",
  "Октомври",
  "Ноември",
  "Декември"
]);

function excelSerialToIso(serial) {
  const utcDays = Math.floor(Number(serial) - 25569);
  return new Date(utcDays * 86400 * 1000).toISOString().slice(0, 10);
}

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function looksLikeMeta(text) {
  return (
    !text ||
    text === "#NAME?" ||
    text === " " ||
    text === "Бележки" ||
    text === "Настройки на календара" ||
    text === "Година" ||
    text === "Начало на седмицата:" ||
    text === "Сертификация" ||
    text === "Консултации" ||
    text === "Служба Трудова Медицина" ||
    text.toLowerCase() === "понеделник" ||
    text.toLowerCase().includes("одитор")
  );
}

async function extractSource(source) {
  const input = await FileBlob.load(source.path);
  const workbook = await SpreadsheetFile.importXlsx(input);
  const sheetInfo = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 10000 });
  const sheets = sheetInfo.ndjson
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((sheet) => monthNames.has(sheet.name));

  const records = [];

  for (const sheet of sheets) {
    const tableInfo = await workbook.inspect({
      kind: "table",
      sheetId: sheet.name,
      tableMaxRows: 80,
      tableMaxCols: 16,
      tableMaxCellChars: 400,
      maxChars: 120000
    });
    const tableLine = tableInfo.ndjson
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((item) => item.kind === "table");
    const values = tableLine?.values || [];

    for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
      const row = values[rowIndex] || [];
      const numericDateCols = row
        .map((value, colIndex) => ({ value, colIndex }))
        .filter(({ value }) => typeof value === "number" && value >= 45000 && value <= 47000);
      if (!numericDateCols.length) continue;

      for (let colIndex = 1; colIndex <= 7; colIndex += 1) {
        const nearest = numericDateCols.reduce((best, current) => {
          const bestDistance = Math.abs(best.colIndex - colIndex);
          const currentDistance = Math.abs(current.colIndex - colIndex);
          return currentDistance < bestDistance ? current : best;
        }, numericDateCols[0]);
        const serial = Number(nearest.value) + (colIndex - nearest.colIndex);
        if (serial < 45000 || serial > 47000) continue;
        const date = excelSerialToIso(serial);

        for (let scanRow = rowIndex + 1; scanRow <= Math.min(rowIndex + 3, values.length - 1); scanRow += 1) {
          const text = cleanText(values[scanRow]?.[colIndex]);
          if (looksLikeMeta(text)) continue;
          const auditor =
            source.key === "auditors"
              ? scanRow - rowIndex === 1
                ? "Георги"
                : scanRow - rowIndex === 2
                  ? "Катя"
                  : ""
              : "";
          records.push({
            id: `${source.key}-${date}-${scanRow}-${colIndex}`,
            calendarType: source.key,
            calendarName: source.name,
            date,
            title: text,
            auditor,
            status: "upcoming",
            priority: "normal",
            sourceSheet: sheet.name,
            sourceCell: `${scanRow + 1}:${colIndex + 1}`,
            notes: ""
          });
        }
      }
    }
  }

  return records;
}

const output = {};
for (const source of sources) {
  output[source.key] = await extractSource(source);
}

await fs.writeFile("scripts/calendar-import.json", JSON.stringify(output, null, 2), "utf8");
console.log(
  JSON.stringify(
    {
      planned: output.planned.length,
      auditors: output.auditors.length,
      samples: {
        planned: output.planned.slice(0, 5),
        auditors: output.auditors.slice(0, 5)
      }
    },
    null,
    2
  )
);
