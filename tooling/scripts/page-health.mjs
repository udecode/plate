#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { PLITE_EXAMPLES_DIR, readSources } from './docs-sources.mjs';

const { registryExampleSlug } =
  await import('../../apps/www/src/lib/docs-routes.ts');
const { getOlderReleaseMajorGroups, getReleaseMajorPath } =
  await import('../../apps/www/src/lib/releases.ts');

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const STABLE = 'https://platejs.org';
const DOCS_APP_DIRS = [
  ['apps/www/src/app/(app)/docs', '/docs'],
  ['apps/www/src/app/cn/docs', '/cn/docs'],
];
const PLAYGROUND = '/blocks/playground';
const ENGINES = ['chromium', 'firefox', 'webkit'];
const LAUNCH_OPTIONS = {
  // Playwright's Firefox shares the installed Firefox's app-data dir, which
  // macOS 27 privacy-protects, and hangs at launch reading it.
  firefox: {
    env: {
      ...process.env,
      MOZ_APP_DATA: path.join(os.tmpdir(), 'playwright-firefox-app-data'),
    },
  },
};
const PRIORITIES = ['P1', 'P2', 'P3', 'P4', 'unresolved'];

const FRAMED_SITE_DEMOS = new Set(['potion-iframe-demo', 'pro-iframe-demo']);
const EDITORLESS_ROUTES = new Set([
  '/docs/examples/server-side',
  '/examples/plite/persistent-annotation-anchors',
]);

const BETA_ONLY = new Set([
  '/docs/examples/document-migration',
  '/docs/lint',
  '/docs/pagination',
  '/docs/selection',
  '/docs/upload',
]);

const STABLE_TWINS = new Map([
  ['/docs/details', '/docs/toggle'],
  ['/docs/examples/editor-default', '/docs/components/editor'],
  ['/docs/examples/editor-disabled', '/docs/components/editor'],
  ['/docs/examples/editor-full-width', '/docs/components/editor'],
  ['/docs/examples/html-export', '/docs/examples/slate-to-html'],
  ['/docs/examples/markdown-to-editor', '/docs/examples/markdown-to-slate'],
  ['/docs/examples/node-selection', '/docs/examples/block-selection'],
  ['/docs/find', '/docs/find-replace'],
]);

const pliteRegistry = (root) =>
  import(
    pathToFileURL(
      path.join(root, PLITE_EXAMPLES_DIR, 'plite-example-registry.ts')
    ).href
  );

const docsAppRoutes = (root) =>
  execFileSync(
    'git',
    [
      'ls-files',
      '--cached',
      '--others',
      '--exclude-standard',
      '--',
      ...DOCS_APP_DIRS.map(([dir]) => `${dir}/**/page.tsx`),
    ],
    { cwd: root, encoding: 'utf-8' }
  )
    .split('\n')
    .filter((file) => file && !file.includes('['))
    .map((file) => {
      const dir = path.posix.dirname(file);
      const [from, to] = DOCS_APP_DIRS.find(([prefix]) =>
        dir.startsWith(prefix)
      );
      return dir.replace(from, to);
    });

const olderReleaseRoutes = (root) =>
  getOlderReleaseMajorGroups(
    JSON.parse(
      readFileSync(
        path.join(root, 'apps/www/src/generated/release-index.json'),
        'utf-8'
      )
    )
  ).map(({ major }) => getReleaseMajorPath(major));

function exampleRoutes(root, items) {
  const routes = new Map(
    items
      .filter((item) => item.type === 'registry:example')
      .map((item) => [
        `/docs/examples/${registryExampleSlug(item.name)}`,
        item.name,
      ])
  );
  for (const route of docsAppRoutes(root)) {
    if (path.posix.dirname(route) === '/docs/examples' && !routes.has(route)) {
      routes.set(route, path.posix.basename(route));
    }
  }

  return [...routes].map(([route, name]) => ({ name, route }));
}

export async function sessionPages(
  root,
  { betaOnly = BETA_ONLY, stableStatus, twins = STABLE_TWINS }
) {
  const registry = await pliteRegistry(root);
  const upstream = new Set(registry.UPSTREAM_PLITE_EXAMPLE_PATHS);
  const hidden = new Set(registry.HIDDEN_EXAMPLES);
  const { items, previews } = readSources(root);
  const shown = new Set();
  const demoPages = new Set();
  for (const [name, routes] of previews) {
    for (const route of routes.filter((each) => each.startsWith('/docs'))) {
      shown.add(name);
      demoPages.add(route);
    }
  }
  const examplePages = exampleRoutes(root, items)
    .filter(({ name }) => !shown.has(name) && !FRAMED_SITE_DEMOS.has(name))
    .map(({ route }) => route);

  const pair = async (page) => {
    if (betaOnly.has(page)) {
      const status = await stableStatus(page);
      return status === 404
        ? { page, priority: 'P4' }
        : {
            note: `platejs.org answered ${status} for this beta-only page`,
            page,
            priority: 'unresolved',
          };
    }
    const twin = twins.get(page) ?? page;
    const status = await stableStatus(twin);
    if (status === 200) {
      return { page, priority: 'P2', reference: `${STABLE}${twin}` };
    }
    return {
      note: twins.has(page)
        ? `platejs.org answered ${status} for its twin ${twin}`
        : `platejs.org answered ${status}; name its twin in STABLE_TWINS or list it in BETA_ONLY`,
      page,
      priority: 'unresolved',
    };
  };

  return [
    ...[...upstream]
      .filter((name) => !hidden.has(name))
      .map((name) => ({
        page: `/examples/plite/${name}`,
        priority: 'P1',
        reference: `https://www.slatejs.org/examples/${name}`,
      })),
    ...(await Promise.all(
      [...demoPages, ...examplePages, PLAYGROUND].map(pair)
    )),
    ...registry.EXAMPLE_NAMES_AND_PATHS.filter(
      ([, name]) => !upstream.has(name)
    ).map(([, name]) => ({ page: `/examples/plite/${name}`, priority: 'P3' })),
  ].sort(
    (a, b) =>
      PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) ||
      a.page.localeCompare(b.page)
  );
}

export async function healthRoutes(root) {
  const registry = await pliteRegistry(root);
  const { items, pages, previews } = readSources(root);
  const editorPages = new Set(
    [...previews]
      .filter(([name]) => !FRAMED_SITE_DEMOS.has(name))
      .flatMap(([, routes]) => routes)
  );
  const routes = new Map(pages.map((page) => [page, editorPages.has(page)]));
  for (const item of items.filter(
    (each) => each.type === 'registry:component'
  )) {
    routes.set(
      `/docs/components/${item.name}`,
      (item.meta?.examples ?? []).some((name) => !name.endsWith('-pro'))
    );
  }
  for (const { name, route } of exampleRoutes(root, items)) {
    routes.set(route, !FRAMED_SITE_DEMOS.has(name));
  }
  for (const route of [...docsAppRoutes(root), ...olderReleaseRoutes(root)]) {
    if (!routes.has(route)) {
      routes.set(route, routes.get(route.replace(/^\/cn/, '')) ?? false);
    }
  }
  for (const [, name] of registry.EXAMPLE_NAMES_AND_PATHS) {
    routes.set(`/examples/plite/${name}`, true);
  }
  routes.set(PLAYGROUND, true);

  return [...routes]
    .map(([route, editor]) => ({
      editor: editor && !EDITORLESS_ROUTES.has(route.replace(/^\/cn/, '')),
      route,
    }))
    .sort((a, b) => a.route.localeCompare(b.route));
}

async function fetchStableStatus(page) {
  try {
    const response = await fetch(`${STABLE}${page}`, { method: 'HEAD' });
    return response.status;
  } catch (error) {
    return error.message;
  }
}

async function editorShown(page) {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (
        (await frame
          .locator('[data-editor-node="value"]')
          .count()
          .catch(() => 0)) > 0
      ) {
        return true;
      }
    }
    await page.waitForTimeout(250);
  }
  return false;
}

async function visit(context, url, editor) {
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) =>
    problems.push(`page error: ${error.message.split('\n')[0]}`)
  );
  try {
    const response = await page.goto(url, {
      timeout: 60_000,
      waitUntil: 'load',
    });
    const title = await page.title();
    if (!response || response.status() >= 400) {
      problems.push(`status ${response?.status() ?? 'none'}`);
    } else if (title.startsWith('404')) {
      problems.push('rendered Not Found');
    } else if (editor && !(await editorShown(page))) {
      problems.push('no editor');
    }
    await page.waitForTimeout(1000);
  } catch (error) {
    problems.push(error.message.split('\n')[0]);
  }
  await page.close();
  return problems;
}

async function runHealth({ base, engines, only, root }) {
  const { chromium, firefox, webkit } = await import('@playwright/test');
  const launchers = { chromium, firefox, webkit };
  const allRoutes = await healthRoutes(root);
  const routes = allRoutes.filter(({ route }) => route.startsWith(only));
  let failed = 0;

  for (const engine of engines) {
    const browser = await launchers[engine]
      .launch(LAUNCH_OPTIONS[engine])
      .catch((error) => {
        console.log(
          `${engine}: did not launch: ${error.message.split('\n')[0]}`
        );
      });
    if (!browser) {
      failed += 1;
      continue;
    }
    const context = await browser.newContext({
      viewport: { height: 900, width: 1280 },
    });
    const queue = [...routes];
    let broken = 0;
    await Promise.all(
      Array.from({ length: 4 }, async () => {
        for (let next = queue.shift(); next; next = queue.shift()) {
          const problems = await visit(
            context,
            `${base}${next.route}`,
            next.editor
          );
          if (problems.length > 0) broken += 1;
          for (const problem of problems) {
            console.log(`${engine}\t${next.route}\t${problem}`);
          }
        }
      })
    );
    await browser.close();
    console.log(`${engine}: ${routes.length} pages, ${broken} with problems`);
    failed += broken;
  }
  process.exitCode = failed > 0 ? 1 : 0;
}

async function printList({ base, root }) {
  const pages = await sessionPages(root, {
    stableStatus: fetchStableStatus,
  });
  for (const { note, page, priority, reference } of pages) {
    console.log(
      [priority, `${base}${page}`, reference ?? note].filter(Boolean).join('\t')
    );
  }
  console.log(
    PRIORITIES.map(
      (priority) =>
        `${priority} ${pages.filter((each) => each.priority === priority).length}`
    ).join(' · ')
  );
}

function parseArgs(argv) {
  const options = {
    base: 'https://beta.platejs.org',
    engines: ENGINES,
    only: '/',
    root: ROOT,
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const value = () => argv[(index += 1)];
    if (arg === '--list') options.list = true;
    else if (arg === '--base') options.base = value().replace(/\/$/, '');
    else if (arg === '--engines') options.engines = value().split(',');
    else if (arg === '--only') options.only = value();
    else if (arg === '--root') options.root = path.resolve(value());
    else {
      throw new Error(
        'usage: page-health.mjs [--list] [--base <url>] [--engines chromium,firefox,webkit] [--only <route prefix>] [--root <checkout>]'
      );
    }
  }
  const unknown = options.engines.filter((engine) => !ENGINES.includes(engine));
  if (unknown.length > 0) throw new Error(`unknown engine: ${unknown}`);
  return options;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const options = parseArgs(process.argv.slice(2));
    await (options.list ? printList(options) : runHealth(options));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}
