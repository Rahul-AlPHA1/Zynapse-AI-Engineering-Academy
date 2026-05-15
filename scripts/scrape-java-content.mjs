/**
 * Scrapes Java tutorial content from TpointTech, GeeksForGeeks, and Tutorialspoint.
 * Reads javaOfflineCatalog.ts for topic URLs, fetches pages, extracts clean content.
 * Saves to src/data/generated/scraped/{topicId}.json
 * Creates src/data/generated/javaScrapedIndex.json
 *
 * Usage:
 *   node scripts/scrape-java-content.mjs                    # all topics
 *   node scripts/scrape-java-content.mjs --topic what-is-java
 *   node scripts/scrape-java-content.mjs --limit 10
 *   node scripts/scrape-java-content.mjs --resume           # skip already scraped
 */

import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { load as cheerioLoad } from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SCRAPED_DIR = path.join(ROOT, "src/data/generated/scraped");
const CATALOG_FILE = path.join(ROOT, "src/data/generated/javaOfflineCatalog.ts");
const INDEX_FILE = path.join(ROOT, "src/data/generated/javaScrapedIndex.json");

const DELAY_MS = 1200; // polite delay between requests
const TIMEOUT_MS = 20000;

// CLI args
const args = process.argv.slice(2);
const onlyTopic = args.includes("--topic") ? args[args.indexOf("--topic") + 1] : null;
const limitArg = args.includes("--limit") ? parseInt(args[args.indexOf("--limit") + 1]) : null;
const resume = args.includes("--resume");

// ---------------------------------------------------------------------------
// Fetch utilities
// ---------------------------------------------------------------------------

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function fetchUrl(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) return reject(new Error("Too many redirects"));
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Cache-Control": "no-cache",
      },
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith("http")
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        resolve(fetchUrl(next, redirects + 1));
        return;
      }
      if (res.statusCode === 429 || res.statusCode === 403) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.setTimeout(TIMEOUT_MS, () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
  });
}

// ---------------------------------------------------------------------------
// HTML → structured content extractors per site
// ---------------------------------------------------------------------------

/** Returns { title, sections: [{heading, paragraphs[], code[]}] } */

function extractTpointTech(html) {
  const $ = cheerioLoad(html);

  // Remove unwanted elements
  $("script, style, noscript, .bottomnextup, .bottomnextdown, #bottomnextup, #bottomnextdown, nav, .navbar, .sidebar, .ads, [class*='ad-'], [id*='ad-'], [class*='google'], .pagination, footer, .footer, .social-share, .comments").remove();

  const title = $("h1.h1").first().text().trim() || $("h1").first().text().trim();

  // Main content is in #city
  const cityEl = $("#city");
  const container = cityEl.length ? cityEl : $(".overview");

  if (!container.length) return null;

  const sections = [];
  let currentSection = { heading: "", paragraphs: [], code: [] };

  container.children().each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    const text = $(el).text().trim();

    if (!tag || !text) return;

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      if (currentSection.paragraphs.length > 0 || currentSection.code.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: text, paragraphs: [], code: [] };
    } else if (tag === "p") {
      if (text) currentSection.paragraphs.push(text);
    } else if (tag === "ul" || tag === "ol") {
      const items = [];
      $(el).find("li").each((_, li) => {
        const t = $(li).text().trim();
        if (t) items.push("• " + t);
      });
      if (items.length) currentSection.paragraphs.push(items.join("\n"));
    } else if (tag === "pre" || tag === "code" || $(el).hasClass("codeblock")) {
      const code = $(el).text().trim();
      if (code) currentSection.code.push(code);
    } else if (tag === "div") {
      // Handle code blocks inside divs
      const codeEl = $(el).find("pre, code").first();
      if (codeEl.length) {
        const code = codeEl.text().trim();
        if (code) currentSection.code.push(code);
      } else {
        // Try to get text content
        const divText = $(el).text().trim();
        if (divText && divText.length > 30 && divText.length < 2000) {
          currentSection.paragraphs.push(divText);
        }
      }
    } else if (tag === "table") {
      // Extract table as text
      const rows = [];
      $(el).find("tr").each((_, tr) => {
        const cells = [];
        $(tr).find("th, td").each((_, td) => cells.push($(td).text().trim()));
        if (cells.length) rows.push(cells.join(" | "));
      });
      if (rows.length) currentSection.paragraphs.push(rows.join("\n"));
    }
  });

  if (currentSection.paragraphs.length > 0 || currentSection.code.length > 0) {
    sections.push(currentSection);
  }

  return { title, sections: sections.filter(s => s.paragraphs.length > 0 || s.code.length > 0) };
}

function extractGeeksForGeeks(html) {
  const $ = cheerioLoad(html);

  // Check for 404/gone pages - check title or h1, not body text (body has "404" in scripts)
  const pageTitle = $("title").text();
  const h1Text = $("h1").first().text();
  if (pageTitle.includes("Page not found") || h1Text.includes("Whoops") || h1Text.includes("Page Not Found")) {
    return null;
  }

  $("script, style, noscript, [class*='ad'], [id*='AD'], .GFG_AD, nav, header, footer, .leftBar, .article--viewer_rightbar, .article--viewer_bottom, .discuss-button, .article-meta-data-container").remove();

  const title = $("h1").first().text().trim();

  // GFG content is in div.text > div.html-chunk
  const htmlChunk = $(".html-chunk").first();
  const textDiv = $(".text").first();
  const container = htmlChunk.length ? htmlChunk : (textDiv.length ? textDiv : $(".article--container_start-content, #main-content, .content"));

  if (!container.length) return null;

  const sections = [];
  let currentSection = { heading: "", paragraphs: [], code: [] };

  const processNode = (el) => {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;

    const text = $(el).text().trim();

    if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4") {
      if (currentSection.paragraphs.length > 0 || currentSection.code.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: text, paragraphs: [], code: [] };
    } else if (tag === "p") {
      if (text) currentSection.paragraphs.push(text);
    } else if (tag === "ul" || tag === "ol") {
      const items = [];
      $(el).find("> li").each((_, li) => {
        const t = $(li).clone().children("ul,ol").remove().end().text().trim();
        if (t) items.push("• " + t);
      });
      if (items.length) currentSection.paragraphs.push(items.join("\n"));
    } else if (tag === "pre" || $(el).hasClass("highlight")) {
      const code = $(el).text().trim();
      if (code && code.length < 5000) currentSection.code.push(code);
    } else if (tag === "table") {
      const rows = [];
      $(el).find("tr").each((_, tr) => {
        const cells = [];
        $(tr).find("th, td").each((_, td) => cells.push($(td).text().trim()));
        if (cells.length) rows.push(cells.join(" | "));
      });
      if (rows.length) currentSection.paragraphs.push(rows.join("\n"));
    } else if (tag === "div") {
      $(el).children().each((_, child) => processNode(child));
    }
  };

  container.children().each((_, el) => processNode(el));

  if (currentSection.paragraphs.length > 0 || currentSection.code.length > 0) {
    sections.push(currentSection);
  }

  return { title, sections: sections.filter(s => s.paragraphs.length > 0 || s.code.length > 0) };
}

function extractTutorialspoint(html) {
  const $ = cheerioLoad(html);

  $("script, style, noscript, [class*='adp'], [data-aaad], [data-aa-adunit], nav, header, footer, .library-page-top-nav, .library-page-bottom-nav, .pre-btn, .nxt-btn, .page-cta, .tp-cta, hr, .explore-categories, .tp-similar-articles, .tutorial-qa").remove();

  const title = $("h1").first().text().trim();

  // Tutorialspoint uses div.tutorial-content#mainContent
  const container = $(".tutorial-content, #mainContent").first();

  if (!container.length) return null;

  const sections = [];
  let currentSection = { heading: "", paragraphs: [], code: [] };

  container.children().each((_, el) => {
    const tag = el.tagName?.toLowerCase();
    if (!tag) return;

    const text = $(el).text().trim();

    if (tag === "h1") return; // skip main title, already captured

    if (tag === "h2" || tag === "h3" || tag === "h4") {
      if (currentSection.paragraphs.length > 0 || currentSection.code.length > 0) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: text, paragraphs: [], code: [] };
    } else if (tag === "p") {
      if (text && text.length > 5) currentSection.paragraphs.push(text);
    } else if (tag === "ul" || tag === "ol") {
      const items = [];
      $(el).find("> li").each((_, li) => {
        const t = $(li).clone().children("ul,ol").remove().end().text().trim();
        if (t) items.push("• " + t);
      });
      if (items.length) currentSection.paragraphs.push(items.join("\n"));
    } else if (tag === "pre") {
      const code = $(el).text().trim();
      if (code) currentSection.code.push(code);
    } else if (tag === "div") {
      const preEl = $(el).find("pre").first();
      if (preEl.length) {
        const code = preEl.text().trim();
        if (code) currentSection.code.push(code);
      } else {
        const divText = text;
        if (divText && divText.length > 30 && divText.length < 3000) {
          currentSection.paragraphs.push(divText);
        }
      }
    } else if (tag === "table") {
      const rows = [];
      $(el).find("tr").each((_, tr) => {
        const cells = [];
        $(tr).find("th, td").each((_, td) => cells.push($(td).text().trim()));
        if (cells.length) rows.push(cells.join(" | "));
      });
      if (rows.length) currentSection.paragraphs.push(rows.join("\n"));
    }
  });

  if (currentSection.paragraphs.length > 0 || currentSection.code.length > 0) {
    sections.push(currentSection);
  }

  return { title, sections: sections.filter(s => s.paragraphs.length > 0 || s.code.length > 0) };
}

// ---------------------------------------------------------------------------
// Parse catalog
// ---------------------------------------------------------------------------

function parseCatalog() {
  const raw = fs.readFileSync(CATALOG_FILE, "utf8");
  // Strip TS comments and export declaration, then parse JSON
  const jsonStr = raw
    .split("\n")
    .filter(line => !line.trimStart().startsWith("//"))
    .join("\n")
    .replace(/^[\s\S]*?export const javaOfflineCatalog\s*=\s*/, "")
    .replace(/\s+as\s+const\s*;[\s\S]*$/, "")   // strip "as const;" and anything after
    .replace(/;\s*$/, "");
  const catalog = JSON.parse(jsonStr);

  const topics = [];
  for (const section of catalog.sections || []) {
    for (const topic of section.topics || []) {
      if (topic.id && topic.sourceRefs) {
        topics.push({
          id: topic.id,
          title: topic.title || topic.id,
          sectionId: section.id,
          sourceRefs: topic.sourceRefs,
        });
      }
    }
  }
  return topics;
}

// ---------------------------------------------------------------------------
// Content quality scorer - pick best section count / paragraph count
// ---------------------------------------------------------------------------

function scoreContent(data) {
  if (!data || !data.sections) return 0;
  const secs = data.sections.length;
  const paras = data.sections.reduce((s, sec) => s + sec.paragraphs.length, 0);
  const codes = data.sections.reduce((s, sec) => s + sec.code.length, 0);
  return secs * 3 + paras + codes * 2;
}

// ---------------------------------------------------------------------------
// Scrape one topic (try all sources, pick best)
// ---------------------------------------------------------------------------

async function scrapeTopic(topic) {
  const results = [];

  for (const ref of topic.sourceRefs) {
    if (!ref.url || !ref.url.startsWith("http")) continue;

    try {
      console.log(`    → Fetching [${ref.sourceId}]: ${ref.url}`);
      const { status, body } = await fetchUrl(ref.url);
      if (status !== 200) {
        console.log(`      ✗ HTTP ${status}`);
        continue;
      }

      let extracted = null;
      if (ref.sourceId === "tpointtech") extracted = extractTpointTech(body);
      else if (ref.sourceId === "geeksforgeeks") extracted = extractGeeksForGeeks(body);
      else if (ref.sourceId === "tutorialspoint") extracted = extractTutorialspoint(body);

      if (!extracted || extracted.sections.length === 0) {
        console.log(`      ✗ No content extracted`);
        continue;
      }

      const score = scoreContent(extracted);
      console.log(`      ✓ ${extracted.sections.length} sections, score=${score}`);
      results.push({ sourceId: ref.sourceId, url: ref.url, data: extracted, score });

      // Polite delay between sources
      await sleep(DELAY_MS);
    } catch (err) {
      console.log(`      ✗ Error: ${err.message}`);
      await sleep(500);
    }
  }

  if (results.length === 0) return null;

  // Pick best scoring source
  results.sort((a, b) => b.score - a.score);
  const best = results[0];

  // Build final scraped object
  const scraped = {
    topicId: topic.id,
    title: best.data.title || topic.title,
    sectionId: topic.sectionId,
    source: best.sourceId,
    url: best.url,
    allSources: results.map(r => ({ sourceId: r.sourceId, url: r.url, score: r.score, sectionCount: r.data.sections.length })),
    sections: best.data.sections,
    scrapedAt: new Date().toISOString(),
  };

  return scraped;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!fs.existsSync(SCRAPED_DIR)) fs.mkdirSync(SCRAPED_DIR, { recursive: true });

  let topics = parseCatalog();
  console.log(`Loaded ${topics.length} topics from catalog.`);

  if (onlyTopic) {
    topics = topics.filter(t => t.id === onlyTopic);
    if (topics.length === 0) {
      console.error(`Topic "${onlyTopic}" not found.`);
      process.exit(1);
    }
  }

  if (resume) {
    const existing = fs.readdirSync(SCRAPED_DIR)
      .filter(f => f.endsWith(".json"))
      .map(f => f.replace(".json", ""));
    const before = topics.length;
    topics = topics.filter(t => !existing.includes(t.id));
    console.log(`Resume mode: skipping ${before - topics.length} already scraped.`);
  }

  if (limitArg) {
    topics = topics.slice(0, limitArg);
    console.log(`Limiting to first ${limitArg} topics.`);
  }

  console.log(`\nScraping ${topics.length} topics...\n`);

  const index = { generatedAt: new Date().toISOString(), topics: [] };
  let success = 0, failed = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(`[${i + 1}/${topics.length}] ${topic.id}`);

    try {
      const scraped = await scrapeTopic(topic);
      if (scraped) {
        const outPath = path.join(SCRAPED_DIR, `${topic.id}.json`);
        fs.writeFileSync(outPath, JSON.stringify(scraped, null, 2));
        index.topics.push({
          id: topic.id,
          title: scraped.title,
          sectionId: topic.sectionId,
          source: scraped.source,
          sectionCount: scraped.sections.length,
        });
        success++;
        console.log(`  ✓ Saved ${topic.id}.json (${scraped.sections.length} sections)\n`);
      } else {
        console.log(`  ✗ No content for ${topic.id}\n`);
        failed++;
      }
    } catch (err) {
      console.error(`  ✗ Failed ${topic.id}: ${err.message}\n`);
      failed++;
    }

    // Delay between topics
    if (i < topics.length - 1) await sleep(DELAY_MS);
  }

  // Update index with existing scraped files
  if (resume || !onlyTopic) {
    const existingFiles = fs.readdirSync(SCRAPED_DIR).filter(f => f.endsWith(".json"));
    const existingSet = new Set(index.topics.map(t => t.id));
    for (const file of existingFiles) {
      const id = file.replace(".json", "");
      if (!existingSet.has(id)) {
        try {
          const data = JSON.parse(fs.readFileSync(path.join(SCRAPED_DIR, file), "utf8"));
          index.topics.push({
            id: data.topicId || id,
            title: data.title || id,
            sectionId: data.sectionId || "",
            source: data.source || "unknown",
            sectionCount: data.sections?.length || 0,
          });
        } catch (_) {}
      }
    }
  }

  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
  console.log(`\nDone. Success: ${success}, Failed: ${failed}`);
  console.log(`Index written to: ${INDEX_FILE}`);
  console.log(`Scraped files in: ${SCRAPED_DIR}`);
}

main().catch(e => { console.error(e); process.exit(1); });
