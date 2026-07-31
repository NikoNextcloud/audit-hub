import fs from "node:fs/promises";

const raw = JSON.parse(await fs.readFile("scripts/calendar-import.json", "utf8"));
const records = [...raw.planned, ...raw.auditors].map((record) => ({
  ...record,
  calendarName: record.calendarType === "planned" ? "Планирани дейности" : "Одитори"
}));

const content = `window.AUDIT_HUB_IMPORTED_CALENDARS = ${JSON.stringify(records, null, 2)};\n`;
await fs.writeFile("calendar-data.js", content, "utf8");
console.log(`Wrote ${records.length} calendar records to calendar-data.js`);
