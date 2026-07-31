import crypto from "node:crypto";
import fs from "node:fs/promises";

const megaUrl = "https://mega.nz/folder/vvxAULDI#sc5y3rg4VtligSwYZ0D61Q";

function parseMegaFolderUrl(url) {
  const match = url.match(/\/folder\/([^#]+)#(.+)$/);
  if (!match) throw new Error("Invalid Mega folder URL");
  return { handle: match[1], key: match[2] };
}

function base64UrlDecode(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function bufferToA32(buffer) {
  const padded = Buffer.concat([buffer, Buffer.alloc((4 - (buffer.length % 4)) % 4)]);
  const out = [];
  for (let i = 0; i < padded.length; i += 4) out.push(padded.readUInt32BE(i));
  return out;
}

function a32ToBuffer(words) {
  const buffer = Buffer.alloc(words.length * 4);
  words.forEach((word, index) => buffer.writeUInt32BE(word >>> 0, index * 4));
  return buffer;
}

function decryptAesEcb(words, keyWords) {
  const decipher = crypto.createDecipheriv("aes-128-ecb", a32ToBuffer(keyWords), null);
  decipher.setAutoPadding(false);
  const encrypted = a32ToBuffer(words);
  return bufferToA32(Buffer.concat([decipher.update(encrypted), decipher.final()]));
}

function decryptKey(encryptedWords, masterKeyWords) {
  const out = [];
  for (let i = 0; i < encryptedWords.length; i += 4) {
    out.push(...decryptAesEcb(encryptedWords.slice(i, i + 4), masterKeyWords));
  }
  return out;
}

function deriveNodeKey(words, nodeType) {
  if (nodeType === 0 && words.length >= 8) {
    return [words[0] ^ words[4], words[1] ^ words[5], words[2] ^ words[6], words[3] ^ words[7]];
  }
  return words.slice(0, 4);
}

function decryptAttributes(attribute, keyWords) {
  if (!attribute) return null;
  const encrypted = base64UrlDecode(attribute);
  const decipher = crypto.createDecipheriv("aes-128-cbc", a32ToBuffer(keyWords), Buffer.alloc(16));
  decipher.setAutoPadding(false);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8").replace(/\0+$/g, "");
  if (!plain.startsWith("MEGA")) return null;
  return JSON.parse(plain.slice(4));
}

function stripExtension(name) {
  return String(name || "").replace(/\.[a-z0-9]{2,6}$/i, "");
}

function cleanCompanyName(name) {
  return stripExtension(name)
    .replace(/^_+/, "")
    .replace(/^\d{5,12}[_\s-]+/, "")
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b(9001|14001|45001|22000|27001|27701|18788|17100|13611|13485)\b/gi, " ")
    .replace(/\b(QM|QMS|UM|EMS|OHS|OHAS|OHSAS|HACCP|ISO|BG|EN|RECA|ANNEX|CERT|CERTIFICATE|DOC|DOCX|PDF|SCAN)\b/gi, " ")
    .replace(/\b(одит|audit|сертификат|sertifikat|certificat|certificate|re-certification|recertification)\b/gi, " ")
    .replace(/[_~]+/g, " ")
    .replace(/\s*[-–]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanCompanyFolderName(name) {
  return stripExtension(name)
    .replace(/\s*[-–]\s*№\s*\d+.*$/i, "")
    .replace(/\s*№\s*\d+.*$/i, "")
    .replace(/\b(9001|14001|45001|22000|27001|27701|18788|17100|13611|13485)\b.*$/gi, "")
    .replace(/[_~]+/g, " ")
    .replace(/\s*[-–]\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isNoiseName(name) {
  const value = cleanCompanyName(name);
  if (!value || value.length < 3) return true;
  if (/^(__MACOSX|Thumbs|desktop|New Folder|Нова папка)$/i.test(value)) return true;
  if (/^[\d\s._-]+$/.test(value)) return true;
  if (/^(bg|en|pdf|doc|docx|xlsx|jpg|png|scan|image)$/i.test(value)) return true;
  return false;
}

function scoreCandidate(name, source) {
  const clean = cleanCompanyName(name);
  let score = source === "folder" ? 20 : 5;
  if (/[А-Яа-яA-Za-z]{4,}/.test(clean)) score += 5;
  if (/\b(ООД|ЕООД|АД|ЕТ|EOOD|OOD|LTD|PLC|LLC|GMBH)\b/i.test(clean)) score += 6;
  if (clean.split(" ").length >= 2) score += 2;
  if (source === "file" && clean.length > 70) score -= 4;
  return score;
}

function companyKey(name) {
  return cleanCompanyName(name)
    .toLocaleLowerCase("bg-BG")
    .replace(/\b(ооод|еоод|оод|ад|ет|eood|ood|ltd|plc|llc|gmbh)\b/gi, "")
    .replace(/[^a-zа-я0-9]+/gi, "");
}

function folderUrl(handle, key, nodeHandle) {
  return `https://mega.nz/folder/${handle}#${key}/folder/${nodeHandle}`;
}

function buildPath(node, byHandle) {
  const parts = [];
  let current = node;
  while (current) {
    if (current.name) parts.push(current.name);
    current = byHandle.get(current.parent);
  }
  return parts.reverse().join(" / ");
}

function buildPathParts(node, byHandle) {
  const parts = [];
  let current = node;
  while (current) {
    if (current.name) parts.push(current.name);
    current = byHandle.get(current.parent);
  }
  return parts.reverse();
}

const { handle, key } = parseMegaFolderUrl(megaUrl);
const masterKey = bufferToA32(base64UrlDecode(key));
const response = await fetch(`https://g.api.mega.co.nz/cs?id=${Date.now()}&n=${handle}`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify([{ a: "f", c: 1, r: 1, ca: 1 }])
});

if (!response.ok) throw new Error(`Mega API HTTP ${response.status}`);
const json = await response.json();
if (!Array.isArray(json) || !json[0]?.f) throw new Error(`Unexpected Mega response: ${JSON.stringify(json).slice(0, 300)}`);

const nodes = [];
for (const node of json[0].f) {
  const encryptedKey = String(node.k || "").split(":").pop();
  if (!encryptedKey) continue;
  const nodeWords = decryptKey(bufferToA32(base64UrlDecode(encryptedKey)), masterKey);
  const nodeKey = deriveNodeKey(nodeWords, node.t);
  const attrs = decryptAttributes(node.a, nodeKey);
  const name = stripExtension(attrs?.n || "");
  if (!name) continue;
  nodes.push({
    handle: node.h,
    parent: node.p || "",
    type: node.t === 1 ? "folder" : node.t === 0 ? "file" : "other",
    name
  });
}

const byHandle = new Map(nodes.map((node) => [node.handle, node]));
const candidates = [];
const folderCompanies = [];

for (const node of nodes) {
  const pathParts = buildPathParts(node, byHandle);
  const rootName = pathParts[0] || "";
  const companyFolder = pathParts[1] || (node.type === "folder" ? node.name : "");
  const cleanFolder = cleanCompanyFolderName(companyFolder);
  if (cleanFolder && !isNoiseName(cleanFolder) && /сертификация/i.test(rootName)) {
    folderCompanies.push({
      name: cleanFolder,
      source: "folder",
      originalName: companyFolder,
      path: pathParts.slice(0, 2).join(" / "),
      megaUrl: pathParts[1] === node.name && node.type === "folder" ? folderUrl(handle, key, node.handle) : megaUrl,
      score: 100
    });
  }

  if (node.type !== "folder" && node.type !== "file") continue;
  if (isNoiseName(node.name)) continue;
  const clean = cleanCompanyName(node.name);
  if (isNoiseName(clean)) continue;
  candidates.push({
    name: clean,
    source: node.type,
    originalName: node.name,
    path: pathParts.join(" / "),
    megaUrl: node.type === "folder" ? folderUrl(handle, key, node.handle) : megaUrl,
    score: scoreCandidate(node.name, node.type)
  });
}

const bestByKey = new Map();
for (const candidate of folderCompanies) {
  const keyName = companyKey(candidate.name);
  if (!keyName || keyName.length < 3) continue;
  const existing = bestByKey.get(keyName);
  if (!existing || candidate.score > existing.score || (candidate.score === existing.score && candidate.name.length < existing.name.length)) {
    bestByKey.set(keyName, candidate);
  }
}

const companies = [...bestByKey.values()]
  .filter((item) => !/^(система|документи|подписани|доказателства|оферта|rar)$/i.test(item.name))
  .sort((a, b) => a.name.localeCompare(b.name, "bg"))
  .map((item, index) => ({
    id: `mega-company-${String(index + 1).padStart(5, "0")}`,
    name: item.name,
    megaUrl: item.megaUrl,
    source: item.source === "folder" ? "Mega папка" : "Mega документ",
    originalName: item.originalName,
    path: item.path
  }));

await fs.writeFile("scripts/mega-companies.json", JSON.stringify(companies, null, 2), "utf8");
await fs.writeFile("scripts/mega-company-candidates.json", JSON.stringify(candidates, null, 2), "utf8");
await fs.writeFile("scripts/mega-folder-companies.json", JSON.stringify(folderCompanies, null, 2), "utf8");
await fs.writeFile("mega-companies.js", `window.AUDIT_HUB_MEGA_COMPANIES = ${JSON.stringify(companies, null, 2)};\n`, "utf8");
console.log(JSON.stringify({
  nodes: nodes.length,
  candidates: candidates.length,
  folderCompanies: folderCompanies.length,
  companies: companies.length,
  folders: companies.filter((item) => item.source === "Mega папка").length,
  samples: companies.slice(0, 25)
}, null, 2));
