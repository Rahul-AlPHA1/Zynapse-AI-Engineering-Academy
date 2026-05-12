import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.SMOKE_BASE_URL || 'http://localhost:3002';
const OUT_DIR = path.resolve('test-results/smoke');
const CHROME = process.env.PLAYWRIGHT_CHROME || '/usr/bin/google-chrome';

const routes = [
  '', 'ROADMAP', 'COMPILER', 'DAILY_CHALLENGE', 'STUDY_PLANNER', 'RECOMMENDATIONS',
  'INTERVIEW_HUB', 'QUIZ_HUB', 'MOCK_INTERVIEW', 'CHALLENGE_ARENA',
  'FLASHCARDS', 'CODE_REVIEW', 'GUIDED_TUTOR', 'PROJECT_IDEAS',
  'PORTFOLIO_BUILDER', 'ANALYTICS', 'PROVIDER_HEALTH', 'THEME_STUDIO',
  'DATA_MANAGER', 'CLOUD_SYNC', 'CLASSROOM_MODE', 'SHARE_CENTER',
  'PLUGIN_MARKETPLACE', 'QA_CHECKS',
];

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
];

const themes = ['dark', 'light'];

function routeUrl(route) {
  return route ? `${BASE_URL}/#${route}` : `${BASE_URL}/`;
}

function routeName(route) {
  return route || 'HOME';
}

await fs.rm(OUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const failures = [];

for (const viewport of viewports) {
  for (const theme of themes) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
    });

    for (const route of routes) {
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', err => {
        if (/WebSocket closed without opened|Failed to construct 'WebSocket'/i.test(err.message)) return;
        pageErrors.push(err.message);
      });
      page.on('console', msg => {
        const text = msg.text();
        if (/WebSocket closed without opened|Failed to construct 'WebSocket'/i.test(text)) return;
        if (msg.type() === 'error' && /TypeError|ReferenceError|SyntaxError|ResizeObserver loop limit exceeded/i.test(text)) {
          pageErrors.push(text);
        }
      });

      try {
        await page.addInitScript(activeTheme => {
          localStorage.setItem('ZYNAPSE_THEME', activeTheme);
          localStorage.setItem('ZYNAPSE_ACCENT', 'aurora');
        }, theme);
        await page.goto(routeUrl(route), { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(1200);

        const rootInfo = await page.evaluate(() => {
          const root = document.querySelector('#root');
          return {
            childCount: root?.childElementCount ?? 0,
            textLength: (root?.textContent ?? '').trim().length,
            bodyText: document.body.innerText.slice(0, 500),
          };
        });

        const screenshotPath = path.join(OUT_DIR, `${routeName(route)}-${theme}-${viewport.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        if (rootInfo.childCount < 1 || rootInfo.textLength < 40) {
          failures.push(`${routeName(route)} ${theme}/${viewport.name}: blank or almost blank root`);
        }
        if (/Cannot read properties|is not defined|ReferenceError|TypeError|SyntaxError/i.test(rootInfo.bodyText)) {
          failures.push(`${routeName(route)} ${theme}/${viewport.name}: visible runtime error text`);
        }
        if (pageErrors.length) {
          failures.push(`${routeName(route)} ${theme}/${viewport.name}: ${pageErrors.join(' | ')}`);
        }
        console.log(`✓ ${routeName(route).padEnd(20)} ${theme.padEnd(5)} ${viewport.name}`);
      } catch (err) {
        failures.push(`${routeName(route)} ${theme}/${viewport.name}: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        await page.close();
      }
    }

    await context.close();
  }
}

await browser.close();

if (failures.length) {
  console.error('\nSmoke test failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nAll smoke routes passed. Screenshots saved in ${OUT_DIR}`);
