import { mkdir, readFile, writeFile } from "fs/promises";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

const SOURCES = [
  {
    id: "tpointtech",
    name: "TpointTech Java Tutorial",
    url: "https://www.tpointtech.com/java-tutorial",
    includeHost: /tpointtech\.com/i,
  },
  {
    id: "geeksforgeeks",
    name: "GeeksforGeeks Java Tutorial",
    url: "https://www.geeksforgeeks.org/java/java/",
    includeHost: /geeksforgeeks\.org/i,
  },
  {
    id: "tutorialspoint",
    name: "Tutorialspoint Java Tutorial",
    url: "https://www.tutorialspoint.com/java/index.htm",
    includeHost: /tutorialspoint\.com/i,
  },
];

const OUT_FILE = path.resolve("src/data/generated/javaOfflineCatalog.ts");
const CURRICULUM_FILE = path.resolve("src/data/curriculum.ts");

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "answers",
  "basic",
  "class",
  "complete",
  "concept",
  "concepts",
  "example",
  "examples",
  "for",
  "framework",
  "in",
  "interface",
  "java",
  "keyword",
  "method",
  "methods",
  "of",
  "program",
  "programming",
  "statement",
  "the",
  "to",
  "tutorial",
  "vs",
  "with",
]);

const TOPIC_RE = /java|jdk|jre|jvm|jdbc|thread|synchron|deadlock|string|array|class|object|exception|collection|hash|map|set|list|queue|deque|inheritance|polymorphism|interface|constructor|loop|operator|variable|data type|method|file|stream|regex|lambda|generic|annotation|memory|garbage|socket|network|reflection|package|modifier|recursion|enum|wrapper|input|output|statement|resultset|preparedstatement/i;

const TOPIC_ALIASES = {
  "what-is-java": ["java overview", "java home", "java tutorial"],
  "history-of-java": ["java history"],
  "features-of-java": ["java features"],
  "cpp-vs-java": ["java vs c++", "difference between c++ and java"],
  "hello-world": ["java hello world", "java hello world program"],
  "internal-details": ["program internal", "java basic syntax", "how java program works"],
  "set-path": ["java environment setup", "download and install java", "how to set path in java"],
  "jdk-jre-jvm": ["jdk vs jre vs jvm", "java jdk vs jre vs jvm", "difference between jdk jre and jvm"],
  "jvm-machine": ["jvm java virtual machine", "java virtual machine"],
  identifiers: ["java identifiers", "identifier in java"],
  "data-types": ["data types", "java data types"],
  "type-casting": ["java type casting", "type casting"],
  operators: ["java operators", "operators"],
  "if-else": ["java if else", "java if else statement"],
  switch: ["java switch", "java switch statement"],
  "for-loop": ["java for loop", "for loop"],
  "while-loop": ["java while loop", "while loop"],
  "do-while": ["java do while loop", "do while loop"],
  "oops-concepts-intro": ["java oops concepts", "oops concepts in java"],
  "object-class": ["object classes", "classes and objects", "java classes and objects", "object and class"],
  constructor: ["constructors", "java constructors"],
  "static-keyword": ["static keyword", "static methods vs instance methods"],
  "this-keyword": ["this keyword"],
  methods: ["java methods", "methods"],
  "call-method": ["class methods", "how to call method"],
  "call-by-value": ["call by value and call by reference"],
  inheritance: ["java inheritance", "inheritance"],
  aggregation: ["java aggregation", "aggregation"],
  "method-overloading": ["java method overloading", "method overloading"],
  "method-overriding": ["java overriding", "method overriding"],
  "super-keyword": ["super keyword"],
  "final-keyword": ["final keyword"],
  polymorphism: ["java polymorphism", "polymorphism"],
  "static-dynamic-binding": ["static binding", "dynamic binding"],
  instanceof: ["java instanceof keyword"],
  "abstract-class": ["abstract class", "java abstraction"],
  interface: ["java interfaces", "interfaces"],
  "abstract-vs-interface": ["difference between abstract class and interface", "class vs interface"],
  package: ["java packages", "packages in java"],
  "access-modifiers": ["java access modifiers", "access modifiers"],
  encapsulation: ["java encapsulation", "encapsulation"],
  array: ["java arrays", "arrays"],
  "jagged-array": ["jagged arrays", "jagged array"],
  "array-methods": ["arrays class", "array class"],
  "object-class-misc": ["object class"],
  "object-cloning": ["object cloning", "clone method"],
  "math-class": ["java math class", "math class"],
  "wrapper-class": ["wrapper classes", "wrapper class"],
  "command-line": ["command line arguments"],
  "object-vs-class": ["difference between object and class", "object vs class"],
  "overloading-vs-overriding": ["method overloading vs method overriding", "difference between method overloading and method overriding"],
  string: ["java strings", "string class", "strings"],
  "immutable-string": ["why string is immutable", "java string is immutable"],
  "string-comparison": ["string comparison"],
  "string-concatenation": ["string concatenation"],
  "string-methods": ["java string methods", "string methods"],
  stringbuffer: ["stringbuffer class", "stringbuffer"],
  stringbuilder: ["stringbuilder class", "stringbuilder"],
  "string-vs-stringbuffer": ["difference between string and stringbuffer"],
  "stringbuffer-vs-stringbuilder": ["stringbuffer vs stringbuilder"],
  "immutable-class": ["immutable class"],
  stringtokenizer: ["stringtokenizer"],
  regex: ["java regex", "regular expressions"],
  exceptions: ["java exceptions", "exception handling", "exceptions in java"],
  "try-catch": ["try catch", "java try catch block"],
  "multiple-catch": ["multi catch", "multiple catch"],
  "nested-try": ["nested try"],
  "finally-block": ["finally block"],
  "throw-keyword": ["throw exception", "java throw exception"],
  "exception-propagation": ["exception propagation"],
  "throws-keyword": ["java throws keyword"],
  "throw-vs-throws": ["throw and throws", "difference between throw and throws"],
  "final-finally-finalize": ["final finally finalize"],
  "custom-exceptions": ["custom exception", "customized exception handling", "user defined custom exception"],
  "inner-class-intro": ["inner classes", "java inner classes"],
  "anonymous-inner": ["anonymous class", "anonymous inner class"],
  "static-nested": ["static class", "static nested class"],
  "nested-interface": ["nested interface"],
  "multithreading-intro": ["java multithreading", "threads", "multithreading complete tutorial"],
  "thread-lifecycle": ["thread life cycle", "thread lifecycle"],
  "create-thread": ["creating a thread", "how to create thread", "runnable interface"],
  "thread-scheduler": ["thread scheduler"],
  "sleeping-thread": ["thread sleep"],
  "start-twice": ["start a thread twice"],
  "call-run": ["calling run method", "thread start vs run"],
  "naming-thread": ["naming thread"],
  "thread-priority": ["thread priority"],
  "daemon-thread": ["daemon thread"],
  "thread-pool": ["thread pools", "thread pool"],
  threadgroup: ["thread group"],
  shutdownhook: ["shutdown hook"],
  "garbage-collection-thread": ["garbage collection"],
  "sync-intro": ["java synchronization", "synchronization"],
  "sync-block": ["block synchronization", "synchronized block"],
  "static-sync": ["static synchronization"],
  deadlock: ["thread deadlock", "deadlock in multithreading", "deadlock"],
  "inter-thread": ["inter thread communication"],
  "interrupting-thread": ["interrupting a thread"],
  "reentrant-monitor": ["reentrant monitor"],
  "io-intro": ["java input output", "introduction to java io", "java i/o streams"],
  fileoutputstream: ["fileoutputstream"],
  fileinputstream: ["fileinputstream"],
  bufferedoutputstream: ["bufferedoutputstream", "bufferedreader output stream"],
  bufferedinputstream: ["bufferedinputstream"],
  "file-handling": ["file handling"],
  "file-class": ["file class", "java file"],
  "create-file": ["create a file"],
  "read-file": ["read files", "read file"],
  "delete-file": ["delete files", "delete file"],
  serialization: ["java serialization", "serialization and deserialization"],
  transient: ["transient keyword"],
  "networking-concepts": ["java networking", "networking concepts"],
  "socket-programming": ["socket programming"],
  "reflection-api": ["reflection api"],
  "memory-management-intro": ["java memory management"],
  "stack-vs-heap": ["stack vs heap"],
  "garbage-collection": ["garbage collection"],
  "how-gc-works": ["how garbage collection works", "types of jvm garbage collectors"],
  "memory-leaks": ["memory leaks"],
  "collections-intro": ["java collections", "java collection tutorial", "collection framework complete tutorial"],
  arraylist: ["java arraylist", "arraylist"],
  linkedlist: ["java linkedlist", "linkedlist"],
  "arraylist-vs-linkedlist": ["arraylist vs linkedlist", "difference between arraylist and linkedlist"],
  "list-interface": ["list interface"],
  linkedhashset: ["linkedhashset"],
  treeset: ["treeset"],
  "queue-priorityqueue": ["queue priorityqueue", "queue interface"],
  "deque-arraydeque": ["deque arraydeque", "deque interface"],
  "map-interface": ["map interface"],
  hashmap: ["java hashmap", "hashmap"],
  "working-hashmap": ["working of hashmap"],
  linkedhashmap: ["linkedhashmap"],
  treemap: ["treemap"],
  hashtable: ["hashtable"],
  "hashmap-vs-hashtable": ["hashmap vs hashtable"],
  "collections-class": ["collections class"],
  "sorting-collections": ["sorting collections"],
  comparable: ["comparable interface", "java comparable"],
  comparator: ["comparator interface", "java comparator"],
  "comparable-vs-comparator": ["comparable vs comparator"],
  "jdbc-intro": ["jdbc in java", "jdbc tutorial", "jdbc introduction"],
  "jdbc-driver": ["jdbc driver", "jdbc drivers"],
  "jdbc-steps": ["5 steps to connect database", "java database connectivity with 5 steps"],
  "jdbc-mysql": ["java database connectivity with mysql"],
  drivermanager: ["drivermanager"],
  connection: ["java connection interface", "jdbc connection"],
  statement: ["java statement interface", "types of statements in jdbc"],
  resultset: ["resultset"],
  preparedstatement: ["preparedstatement interface", "preparedstatement"],
  "transaction-management": ["transaction management"],
  "batch-processing": ["batch processing"],
  "java-8-features": ["java 8 features"],
};

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&quot;/gi, "\"")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)));
}

function stripHtml(value) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(value) {
  return stripHtml(value)
    .toLowerCase()
    .replace(/\b\d+\s*min\s*read\b/g, " ")
    .replace(/[–—-]/g, " ")
    .replace(/\bc\+\+\b/g, "cpp")
    .replace(/\boops\b/g, "oop")
    .replace(/[^a-z0-9+#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(value) {
  return normalizeTitle(value)
    .split(" ")
    .map(token => token === "cpp" ? "c++" : token)
    .filter(token => token && !STOP_WORDS.has(token));
}

function tokenKey(value) {
  return tokens(value).join(" ");
}

function absoluteUrl(href, baseUrl) {
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return baseUrl;
  }
}

function parseCurriculumSections(source) {
  const start = source.indexOf("id: 'java-mastery'");
  const end = source.indexOf("id: 'spring-boot-mastery'");
  const javaBlock = source.slice(start, end > start ? end : undefined);
  const sections = [];
  const sectionRe = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*topics:\s*\[([\s\S]*?)\n\s*\]\s*}/g;

  for (const sectionMatch of javaBlock.matchAll(sectionRe)) {
    const [, id, title, topicsBlock] = sectionMatch;
    const topics = [];
    const topicRe = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)'/g;
    for (const topicMatch of topicsBlock.matchAll(topicRe)) {
      topics.push({ id: topicMatch[1], title: topicMatch[2] });
    }
    if (topics.length) sections.push({ id, title, topics });
  }

  return sections;
}

function parseSourceAnchors(source, html) {
  const anchors = [];
  const anchorRe = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

  for (const match of html.matchAll(anchorRe)) {
    const attrs = match[1];
    const hrefMatch = attrs.match(/\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^'">\s]+))/i);
    if (!hrefMatch) continue;

    const rawHref = hrefMatch[1] || hrefMatch[2] || hrefMatch[3];
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("javascript:")) continue;

    const title = stripHtml(match[2]).replace(/\s+\d+\s*min\s*read$/i, "").trim();
    if (!title || title.length > 120) continue;
    if (!TOPIC_RE.test(title)) continue;

    const url = absoluteUrl(rawHref, source.url);
    if (!source.includeHost.test(url)) continue;
    if (/\/tag\/|\/category\/|\/author\/|\/videos\//i.test(url)) continue;

    const key = tokenKey(title);
    if (!key) continue;

    anchors.push({
      sourceId: source.id,
      sourceName: source.name,
      title,
      url,
      key,
      tokens: tokens(title),
    });
  }

  const deduped = [];
  const seen = new Set();
  for (const anchor of anchors) {
    const dedupeKey = `${anchor.sourceId}:${anchor.key}:${anchor.url}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    deduped.push(anchor);
  }
  return deduped;
}

function parseSourceOutline(html) {
  const outlines = [];
  const headingRe = /<h([1-4])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  const noisy = /^(advertisement|related articles?|recommended|recent articles?|comments?|login|sign in|courses?|explore|explore categories|jobs|next|previous|table of contents?|practice|quiz|faqs?|java tutorial|control statements|java object class|java inheritance|java polymorphism|java abstraction|java encapsulation|java array|java oops misc|java string|java regex|exception handling|java inner class|java multithreading|java synchronization|java i\/o|file handling in java|java serialization|java networking|java reflection|java collections|java jdbc|rmi|internationalization|java projects)$/i;

  for (const match of html.matchAll(headingRe)) {
    const text = stripHtml(match[2])
      .replace(/\s+\d+\s*min\s*read$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text || text.length < 4 || text.length > 110) continue;
    if (noisy.test(text)) continue;
    if (/^(java\s+)?(5|8)\s+features$/i.test(text)) continue;
    if (/^(also read|recommended|share|like article|improve|similar reads)/i.test(text)) continue;
    if (/[{}<>]/.test(text)) continue;
    outlines.push(text);
  }

  const deduped = [];
  const seen = new Set();
  for (const item of outlines) {
    const key = normalizeTitle(item);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  return deduped.slice(0, 10);
}

function scoreMatch(topic, anchor) {
  const aliases = [topic.title, ...(TOPIC_ALIASES[topic.id] || [])];
  let best = 0;

  for (const alias of aliases) {
    const aliasKey = tokenKey(alias);
    if (!aliasKey) continue;

    if (aliasKey === anchor.key) best = Math.max(best, 100);
    if (anchor.key.includes(aliasKey) || aliasKey.includes(anchor.key)) best = Math.max(best, 88);

    const aliasTokens = tokens(alias);
    const common = aliasTokens.filter(token => anchor.tokens.includes(token));
    const precision = common.length / Math.max(1, anchor.tokens.length);
    const recall = common.length / Math.max(1, aliasTokens.length);
    const score = Math.round((precision * 0.45 + recall * 0.55) * 80);
    best = Math.max(best, score);
  }

  return best;
}

function sourceRefsForTopic(topic, anchorsBySource) {
  const refs = [];

  for (const source of SOURCES) {
    const anchors = anchorsBySource.get(source.id) || [];
    let best = null;

    for (const anchor of anchors) {
      const score = scoreMatch(topic, anchor);
      if (score >= 56 && (!best || score > best.score)) {
        best = { ...anchor, score };
      }
    }

    if (best) {
      refs.push({
        sourceId: source.id,
        sourceName: source.name,
        title: best.title,
        url: best.url,
        matchScore: best.score,
      });
    }
  }

  return refs;
}

async function fetchSourceHtml(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        "Accept": "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; ZynapseOfflineCatalogSync/2.0; topic-map-only)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } catch (error) {
    const { stdout } = await execFileAsync(
      "curl",
      ["-L", "--max-time", "30", "-A", "Mozilla/5.0 (compatible; ZynapseOfflineCatalogSync/2.0; topic-map-only)", "-sS", source.url],
      { maxBuffer: 5 * 1024 * 1024 },
    );
    if (!stdout?.trim()) throw error;
    return stdout;
  } finally {
    clearTimeout(timer);
  }
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let index = 0;

  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await fn(items[current], current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  const curriculum = await readFile(CURRICULUM_FILE, "utf8");
  const sections = parseCurriculumSections(curriculum);
  const anchorsBySource = new Map();
  const sourceStatuses = [];

  for (const source of SOURCES) {
    try {
      const html = await fetchSourceHtml(source);
      const anchors = parseSourceAnchors(source, html);
      anchorsBySource.set(source.id, anchors);
      sourceStatuses.push(`${source.id}:${anchors.length}`);
    } catch (error) {
      anchorsBySource.set(source.id, []);
      sourceStatuses.push(`${source.id}:fetch-failed:${error.message}`);
      console.warn(`[offline-sync] Could not fetch ${source.url}: ${error.message}`);
    }
  }

  const generatedAt = new Date().toISOString();
  let linkedTopics = 0;
  let totalRefs = 0;
  const mappedSectionsWithoutOutlines = sections.map(section => ({
    ...section,
    topics: section.topics.map(topic => {
      const sourceRefs = sourceRefsForTopic(topic, anchorsBySource);
      if (sourceRefs.length) linkedTopics += 1;
      totalRefs += sourceRefs.length;
      return {
        ...topic,
        sourceUrl: sourceRefs[0]?.url || SOURCES[0].url,
        sourceRefs,
      };
    }),
  }));

  const outlineCache = new Map();
  const uniqueRefUrls = [
    ...new Set(
      mappedSectionsWithoutOutlines.flatMap(section =>
        section.topics.flatMap(topic => topic.sourceRefs.map(ref => ref.url)),
      ),
    ),
  ];

  let outlineCount = 0;
  await mapLimit(uniqueRefUrls, 5, async url => {
    try {
      const html = await fetchSourceHtml({ url });
      const outline = parseSourceOutline(html);
      if (outline.length) outlineCount += 1;
      outlineCache.set(url, outline);
    } catch {
      outlineCache.set(url, []);
    }
  });

  const mappedSections = mappedSectionsWithoutOutlines.map(section => ({
    ...section,
    topics: section.topics.map(topic => ({
      ...topic,
      sourceRefs: topic.sourceRefs.map(ref => ({
        ...ref,
        outline: outlineCache.get(ref.url) || [],
      })),
    })),
  }));

  const catalog = {
    sourceName: "TpointTech + GeeksforGeeks + Tutorialspoint Java topic maps",
    sourceUrl: SOURCES[0].url,
    sources: SOURCES.map(source => ({
      id: source.id,
      name: source.name,
      url: source.url,
    })),
    generatedAt,
    sourceStatus: `synced-topic-links:${sourceStatuses.join(",")};linked-topics:${linkedTopics};refs:${totalRefs};outlines:${outlineCount}/${uniqueRefUrls.length}`,
    copyrightNote: "Topic titles/headings and source URLs only. Offline lessons in the app are original Zynapse notes in English/Hinglish, not copied article bodies.",
    sections: mappedSections,
  };

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    `// Auto-generated by scripts/sync-java-offline.mjs\n` +
      `// Sources: ${SOURCES.map(source => source.url).join(", ")}\n` +
      `// Topic titles, source URLs, and short heading outlines only; no article bodies are embedded.\n` +
      `export const javaOfflineCatalog = ${JSON.stringify(catalog, null, 2)} as const;\n\n` +
      `export type JavaOfflineCatalog = typeof javaOfflineCatalog;\n`,
    "utf8",
  );
  console.log(`[offline-sync] wrote ${OUT_FILE}`);
  console.log(`[offline-sync] ${sections.length} sections, ${sections.reduce((sum, s) => sum + s.topics.length, 0)} topics`);
  console.log(`[offline-sync] ${catalog.sourceStatus}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
