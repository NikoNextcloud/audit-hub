import fs from "node:fs";

const companies = JSON.parse(fs.readFileSync("scripts/mega-companies.json", "utf8"));

function sql(value) {
  if (!value) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const rows = companies
  .map((company) => {
    const notes = `Импорт от ${company.source || "Mega"}. Път: ${company.path || company.originalName || "Mega папка"}`;
    return `  (${sql(company.name)}, ${sql(company.megaUrl)}, 'active', ${sql(notes)})`;
  })
  .join(",\n");

const output = `insert into companies (name, mega_url, status, notes)
select v.name, v.mega_url, v.status, v.notes
from (values
${rows}
) as v(name, mega_url, status, notes)
where not exists (
  select 1
  from companies c
  where lower(regexp_replace(c.name, '[^[:alnum:]]+', '', 'g')) =
        lower(regexp_replace(v.name, '[^[:alnum:]]+', '', 'g'))
);
`;

fs.writeFileSync("supabase-mega-companies.sql", output, "utf8");
console.log(`Wrote ${companies.length} companies to supabase-mega-companies.sql`);
