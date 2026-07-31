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

const monthNames = [
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
];

const calendarYear = 2026;
const weeksPerSheet = 6;
const firstDayColumnIndex = 1;
const daysPerWeek = 7;

function cleanText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizedText(value) {
  return cleanText(value)
    .toLocaleLowerCase("bg-BG")
    .replace(/[–—]/g, "-")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function excelSerialToIso(serial) {
  const utcDays = Math.floor(Number(serial) - 25569);
  return new Date(utcDays * 86400 * 1000).toISOString().slice(0, 10);
}

function calendarStart(monthIndex) {
  const first = new Date(Date.UTC(calendarYear, monthIndex, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  first.setUTCDate(first.getUTCDate() - mondayOffset);
  return first;
}

function dateForCell(monthIndex, weekIndex, dayIndex) {
  const date = calendarStart(monthIndex);
  date.setUTCDate(date.getUTCDate() + weekIndex * daysPerWeek + dayIndex);
  return date;
}

function monthMatchesDate(sheetName, date) {
  return monthNames[date.getUTCMonth()] === sheetName;
}

function sourceCell(rowIndex, colIndex) {
  return `${rowIndex + 1}:${colIndex + 1}`;
}

function columnName(columnNumber) {
  let result = "";
  let current = columnNumber;
  while (current > 0) {
    current -= 1;
    result = String.fromCharCode(65 + (current % 26)) + result;
    current = Math.floor(current / 26);
  }
  return result;
}

function a1Cell(rowIndex, colIndex) {
  return `${columnName(colIndex + 1)}${rowIndex + 1}`;
}

function isCalendarText(text) {
  const normalized = normalizedText(text);
  return Boolean(
    text &&
    text !== "#NAME?" &&
    ![
      "бележки",
      "сертификация",
      "консултации",
      "служба трудова медицина",
      "георги георгиев одитор",
      "екатерина георгиева одитор"
    ].includes(normalized)
  );
}

function auditorForOffset(offset) {
  if (offset === 1) return "Георги Георгиев - одитор";
  if (offset === 2) return "Екатерина Георгиева - одитор";
  return "";
}

function auditorColor(auditor) {
  if (auditor.startsWith("Георги Георгиев")) return "green";
  if (auditor.startsWith("Екатерина Георгиева")) return "red";
  return "neutral";
}

function colorValue(value) {
  return String(value || "").toUpperCase();
}

function plannedVisual(style) {
  const fill = colorValue(style?.fill?.color?.value);
  const font = colorValue(style?.font?.fill?.color?.value);

  if (fill === "FF0000" || font === "FF0000") {
    return { category: "occupational_medicine", color: "red" };
  }
  if (fill === "92D050" || fill === "00B050" || fill === "THEME:9") {
    return { category: "consulting", color: "green" };
  }
  if (fill === "00B0F0") {
    return { category: "certification", color: "blue" };
  }
  if (fill === "FFFF00") {
    return { category: "", color: "yellow" };
  }
  return { category: "", color: "neutral" };
}

function eventKey(record) {
  return [
    record.calendarType,
    record.date,
    normalizedText(record.title),
    normalizedText(record.auditor)
  ].join("|");
}

function preferRecord(current, candidate) {
  const currentMatches = monthMatchesDate(current.sourceSheet, new Date(`${current.date}T00:00:00Z`));
  const candidateMatches = monthMatchesDate(candidate.sourceSheet, new Date(`${candidate.date}T00:00:00Z`));
  if (candidateMatches && !currentMatches) return candidate;
  return current;
}

async function extractSource(source) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source.path));
  const sheetInfo = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 12000 });
  const availableSheets = new Set(
    sheetInfo.ndjson
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line).name)
  );

  const rawRecords = [];
  let verifiedDateCells = 0;

  for (const [monthIndex, sheetName] of monthNames.entries()) {
    if (!availableSheets.has(sheetName)) {
      throw new Error(`Липсва лист "${sheetName}" във файла ${source.path}`);
    }
    const sheet = workbook.worksheets.getItem(sheetName);
    const usedRange = sheet.getUsedRange();
    const values = usedRange.values;
    const formulas = usedRange.formulas;
    const styleByCell = new Map();
    if (source.key === "planned") {
      const styles = await workbook.inspect({
        kind: "computedStyle",
        sheetId: sheetName,
        range: usedRange.address,
        maxChars: 120000,
        options: { maxResults: 1000 }
      });
      styles.ndjson
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .forEach((item) => styleByCell.set(item.for, item.style));
    }
    const formulaDateRows = formulas
      .map((row, rowIndex) => ({ rowIndex, formula: String(row?.[firstDayColumnIndex] || "") }))
      .filter(({ formula }) => formula.includes("ДниИСемици") && formula.includes("DATE(КалендарнаГодина"))
      .map(({ rowIndex }) => rowIndex);
    const dateRowIndexes =
      source.key === "planned"
        ? Array.from({ length: weeksPerSheet }, (_, weekIndex) => 3 + weekIndex * 4)
        : formulaDateRows;

    if (dateRowIndexes.length !== weeksPerSheet) {
      throw new Error(
        `Очаквани са ${weeksPerSheet} седмици в лист "${sheetName}", намерени: ${dateRowIndexes.length}`
      );
    }

    for (const [weekIndex, dateRowIndex] of dateRowIndexes.entries()) {
      for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex += 1) {
        const colIndex = firstDayColumnIndex + dayIndex;
        const displayedDate = values[dateRowIndex]?.[colIndex];
        if (typeof displayedDate !== "number" || displayedDate < 45000 || displayedDate > 47000) continue;
        const expectedDate = toIsoDate(dateForCell(monthIndex, weekIndex, dayIndex));
        const sourceDate = excelSerialToIso(displayedDate);
        if (sourceDate !== expectedDate) {
          throw new Error(
            `Разминаване на дата в ${sheetName}!${sourceCell(dateRowIndex, colIndex)}: ${sourceDate} вместо ${expectedDate}`
          );
        }
        verifiedDateCells += 1;
      }

      const nextDateRowIndex = dateRowIndexes[weekIndex + 1] ?? dateRowIndex + 4;
      const eventRowEnd = Math.min(nextDateRowIndex, dateRowIndex + 4);
      for (let rowIndex = dateRowIndex + 1; rowIndex < eventRowEnd; rowIndex += 1) {
        const offset = rowIndex - dateRowIndex;
        const row = values[rowIndex] || [];
        for (let dayIndex = 0; dayIndex < daysPerWeek; dayIndex += 1) {
          const colIndex = firstDayColumnIndex + dayIndex;
          const title = cleanText(row[colIndex]);
          if (!isCalendarText(title)) continue;

          const dateObject = dateForCell(monthIndex, weekIndex, dayIndex);
          if (dateObject.getUTCFullYear() !== calendarYear) continue;
          const date = toIsoDate(dateObject);
          const auditor = source.key === "auditors" ? auditorForOffset(offset) : "";
          const visual =
            source.key === "planned"
              ? plannedVisual(styleByCell.get(a1Cell(rowIndex, colIndex)))
              : { category: "", color: auditorColor(auditor) };

          rawRecords.push({
            id: `${source.key}-${date}-${rowIndex}-${colIndex}`,
            calendarType: source.key,
            calendarName: source.name,
            date,
            title,
            auditor,
            category: visual.category,
            color: visual.color,
            status: "upcoming",
            priority: "normal",
            sourceSheet: sheetName,
            sourceCell: sourceCell(rowIndex, colIndex),
            notes:
              source.key === "auditors" && offset === 3
                ? "Бележка от оригиналния календар без зададен одитор."
                : ""
          });
        }
      }
    }
  }

  const deduplicated = new Map();
  for (const record of rawRecords) {
    const key = eventKey(record);
    const existing = deduplicated.get(key);
    deduplicated.set(key, existing ? preferRecord(existing, record) : record);
  }

  const records = [...deduplicated.values()].sort((a, b) =>
    `${a.date}|${a.auditor}|${a.title}`.localeCompare(
      `${b.date}|${b.auditor}|${b.title}`,
      "bg"
    )
  );

  return {
    records,
    audit: {
      sourceRows: rawRecords.length,
      importedRows: records.length,
      duplicateRowsRemoved: rawRecords.length - records.length,
      verifiedDateCells,
      byMonth: Object.fromEntries(
        monthNames.map((month, monthIndex) => [
          month,
          records.filter((record) => new Date(`${record.date}T00:00:00Z`).getUTCMonth() === monthIndex).length
        ])
      ),
      byCategory: Object.fromEntries(
        ["certification", "consulting", "occupational_medicine", "uncategorized"].map((category) => [
          category,
          records.filter((record) => (record.category || "uncategorized") === category).length
        ])
      )
    }
  };
}

const output = {};
const audit = {};
for (const source of sources) {
  const extracted = await extractSource(source);
  output[source.key] = extracted.records;
  audit[source.key] = extracted.audit;
}

await fs.writeFile("scripts/calendar-import.json", JSON.stringify(output, null, 2), "utf8");
await fs.writeFile("scripts/calendar-import-audit.json", JSON.stringify(audit, null, 2), "utf8");

console.log(
  JSON.stringify({
    planned: audit.planned,
    auditors: audit.auditors
  }, null, 2)
);
