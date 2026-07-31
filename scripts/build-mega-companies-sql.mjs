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

const output = `begin;

create temporary table mega_company_import (
  name text not null,
  mega_url text not null,
  status text not null,
  notes text
) on commit drop;

insert into mega_company_import (name, mega_url, status, notes)
values
${rows};

update companies c
set
  mega_url = v.mega_url,
  updated_at = now()
from mega_company_import v
where lower(regexp_replace(c.name, '[^[:alnum:]]+', '', 'g')) =
      lower(regexp_replace(v.name, '[^[:alnum:]]+', '', 'g'))
  and (
    c.mega_url is null
    or btrim(c.mega_url) = ''
    or btrim(c.mega_url) = 'https://mega.nz/folder/vvxAULDI#sc5y3rg4VtligSwYZ0D61Q'
  );

insert into companies (name, mega_url, status, notes)
select v.name, v.mega_url, v.status, v.notes
from mega_company_import v
where not exists (
  select 1
  from companies c
  where lower(regexp_replace(c.name, '[^[:alnum:]]+', '', 'g')) =
        lower(regexp_replace(v.name, '[^[:alnum:]]+', '', 'g'))
);

commit;
`;

fs.writeFileSync("supabase-mega-companies.sql", output, "utf8");
console.log(`Wrote ${companies.length} companies to supabase-mega-companies.sql`);
