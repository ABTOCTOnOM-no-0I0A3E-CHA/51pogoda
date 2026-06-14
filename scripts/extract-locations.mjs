import fs from "node:fs";

const UA = "Mozilla/5.0 (compatible; PogodaZapolyarya/1.0; +mailto:contact@example.com)";
const YR_UA = "PogodaZapolyarya/1.0 contact@example.com";
const BASE = "https://pogoda51.ru";

/* Чисто статьи/справочники без прогноза — у них нет yr.no ID, но отсечём заранее */
const ARTICLE = /район\.|^климат|геолог|географ|топоним|виды твердых|статья|яковлев|^\s*$/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

async function getCookie() {
  const html = await fetch(`${BASE}/`, { headers: { "User-Agent": UA } }).then((r) => r.text());
  const m = html.match(/bpc=([a-f0-9]+)/i);
  return m ? `bpc=${m[1]}` : "";
}

async function getList(cookie) {
  const html = await fetch(`${BASE}/`, { headers: { "User-Agent": UA, Cookie: cookie } }).then((r) => r.text());
  const re = /<a[^>]+href="\/([a-z0-9_-]+)\/?"[^>]*>\s*([^<]{1,60}?)\s*<\/a>/gi;
  const seen = new Set();
  const pairs = [];
  let m;
  while ((m = re.exec(html))) {
    const slug = m[1];
    const name = decode(m[2]);
    if (!name || seen.has(slug) || ARTICLE.test(name)) continue;
    seen.add(slug);
    pairs.push({ slug, name });
  }
  return pairs;
}

const cookie = await getCookie();
const pairs = await getList(cookie);
const list = [{ slug: "murmansk", name: "Мурманск" }, ...pairs.filter((p) => p.slug !== "murmansk")];

console.error(`Точек к обработке: ${list.length}`);

const out = [];
const failed = [];

for (const [i, c] of list.entries()) {
  try {
    const page = await fetch(`${BASE}/${c.slug}`, { headers: { "User-Agent": UA, Cookie: cookie } }).then((r) => r.text());
    const idMatch = page.match(/content\/(2-\d{4,9})/);
    if (!idMatch) {
      failed.push(`${c.slug}: нет yr.no ID`);
      continue;
    }
    const yrId = idMatch[1];

    const meta = await fetch(`https://www.yr.no/api/v0/locations/${yrId}`, {
      headers: { "User-Agent": YR_UA, Accept: "application/json" },
    }).then((r) => (r.ok ? r.json() : null));

    if (!meta?.position) {
      failed.push(`${c.slug}: нет позиции (${yrId})`);
      continue;
    }

    out.push({
      slug: c.slug,
      name: c.name,
      yrId,
      lat: Number(meta.position.lat.toFixed(4)),
      lon: Number(meta.position.lon.toFixed(4)),
      category: meta.category?.name ?? "",
      categoryId: meta.category?.id ?? "",
    });

    if (i % 25 === 0) console.error(`  ${i}/${list.length} ok=${out.length}`);
  } catch (e) {
    failed.push(`${c.slug}: ${e.message}`);
  }
  await sleep(110);
}

fs.writeFileSync(new URL("../locations.json", import.meta.url), JSON.stringify(out, null, 2));
console.error(`Готово: ${out.length} точек, без прогноза/ошибок: ${failed.length}`);
if (failed.length) console.error("SKIPPED:\n" + failed.join("\n"));
