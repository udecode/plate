#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSources } from './docs-sources.mjs';

const { registryExampleSlug, sourcePathToDocsRoute } =
  await import('../../apps/www/src/lib/docs-routes.ts');

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const DRIVE_DIR = 'docs/plans/artifacts/drive';
const DESKTOP_MIN_WIDTH = 1200;
const LOOK_PAGE_LIMIT = 6;
const SETTLE_MS = 5000;
const REGISTRY_DIR = 'apps/www/src/registry/';
const SHOWN_ROOTS =
  /^(?:apps\/(?:plite|www)\/|config\/|content\/docs\/|packages\/[^/]+\/src\/.*\.(?:[cm]?[jt]sx?|css|json)$)/;
const NOT_SHOWN =
  /(?:^|\/)(?:__tests__|tests|type-tests)\/|(?:^|\/)\.gitignore$|\.(?:spec|test|slow)\.[cm]?[jt]sx?$|\.md$|(?:^|\/)playwright\.config\.[cm]?[jt]s$|^config\/[^/]*test[^/]*$|^apps\/www\/(?:public\/r|src\/__registry__)\//;
const EDIT_TOOLS = new Set(['Edit', 'MultiEdit', 'NotebookEdit', 'Write']);
const SKIP_WORDS = /^\s*skip drive\b/i;

const git = (cwd, args, input) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
    input,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'ignore'],
  });

const unique = (values) => [...new Set(values)];

const readJsonl = (file) =>
  existsSync(file)
    ? readFileSync(file, 'utf-8')
        .split('\n')
        .flatMap((line) => {
          try {
            return line ? [JSON.parse(line)] : [];
          } catch {
            return [];
          }
        })
    : [];

const appendJsonl = (file, record) => {
  mkdirSync(path.dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(record)}\n`);
};

const pageOf = (route) => route?.split('#')[0];

const docsRoutes = (item) =>
  (item.meta?.docs ?? [])
    .map((doc) => pageOf(doc.route))
    .filter((route) => route?.startsWith('/docs'));

const primaryPage = (item) =>
  item.type === 'registry:example' || item.type === 'registry:block'
    ? `/blocks/${item.name}`
    : (docsRoutes(item)[0] ??
      (item.type === 'registry:component'
        ? `/docs/components/${item.name}`
        : undefined));

const examplesOf = (item, sources) =>
  (item.meta?.examples ?? [])
    .map((name) => sources.items.find((other) => other.name === name))
    .filter(Boolean);

const loaderRoutes = (file, sources) =>
  sources.loaders
    .filter(
      ({ base }) =>
        file === base ||
        file.startsWith(`${base}.`) ||
        file.startsWith(`${base}/`)
    )
    .map(({ route }) => route);

function itemPages(item, sources) {
  const pages = [
    primaryPage(item),
    ...docsRoutes(item),
    ...(item.files ?? []).flatMap((entry) =>
      loaderRoutes(`${REGISTRY_DIR}${entry.path}`, sources)
    ),
  ];

  if (item.type === 'registry:component') {
    pages.push(`/docs/components/${item.name}`);
    for (const example of examplesOf(item, sources)) {
      pages.push(...itemPages(example, sources));
    }
  }
  pages.push(...(sources.previews.get(item.name) ?? []));
  if (item.type === 'registry:example') {
    pages.push(`/docs/examples/${registryExampleSlug(item.name)}`);
    for (const component of sources.items) {
      if (component.meta?.examples?.includes(item.name)) {
        pages.push(`/docs/components/${component.name}`);
      }
    }
  }

  return unique(pages.filter((page) => page && !page.startsWith('/cn/')));
}

function itemsShowing(item, items) {
  const found = new Map();
  const queue = [item];

  while (queue.length > 0) {
    const current = queue.shift();
    const next = items.filter(
      (other) =>
        other !== item &&
        !found.has(other.name) &&
        (other.registryDependencies?.includes(`@plate/${current.name}`) ||
          current.meta?.examples?.includes(other.name))
    );
    for (const other of next) {
      found.set(other.name, other);
      queue.push(other);
    }
  }

  return [...found.values()];
}

function filePages(file, sources, routes, currentBlob) {
  const named = routes.get(file);
  if (named && named.blob === currentBlob(file)) {
    return named.none
      ? { kind: 'none' }
      : { kind: 'pages', own: named.pages, reach: [] };
  }
  if (!SHOWN_ROOTS.test(file) || NOT_SHOWN.test(file)) return { kind: 'none' };
  if (currentBlob(file) === null) return { kind: 'unmapped' };
  if (file.startsWith('content/docs/')) {
    if (!file.endsWith('.mdx')) return { kind: 'unmapped' };
    return {
      kind: 'pages',
      own: [sourcePathToDocsRoute(file.slice('content/docs/'.length))],
      reach: [],
    };
  }

  let own = [];
  let reach = [];

  if (file.startsWith(REGISTRY_DIR)) {
    const relative = file.slice(REGISTRY_DIR.length);
    // A Chinese demo value loads through getI18nValues on the Chinese pages
    // of the item that lists its English twin.
    const twin = relative.replace(
      /^examples\/values\/cn\//,
      'examples/values/'
    );
    const owners = sources.items.filter((item) =>
      item.files?.some((entry) => entry.path === twin)
    );
    if (twin !== relative) {
      own = unique(owners.flatMap((item) => itemPages(item, sources)))
        .filter((page) => page.startsWith('/docs'))
        .map((page) => `/cn${page}`);
    } else {
      own = unique(owners.flatMap((item) => itemPages(item, sources)));
      reach = unique(
        owners.flatMap((item) =>
          itemsShowing(item, sources.items).map(primaryPage)
        )
      ).filter((page) => page && !own.includes(page));
    }
  }

  own.push(...loaderRoutes(file, sources));

  if (own.length === 0 && reach.length === 0) return { kind: 'unmapped' };

  return { kind: 'pages', own: unique(own), reach };
}

function cellsFor(files, sources, routes, currentBlob) {
  const cells = new Map();
  const unmapped = [];
  const add = (route, variant, file) => {
    const key = `${route} ${variant}`;
    const cell = cells.get(key) ?? { files: [], key, route, variant };
    if (!cell.files.includes(file)) cell.files.push(file);
    cells.set(key, cell);
  };

  for (const file of files) {
    const pages = filePages(file, sources, routes, currentBlob);
    if (pages.kind === 'none') continue;
    if (pages.kind === 'unmapped') {
      unmapped.push(file);
      continue;
    }
    const look =
      pages.own.length + pages.reach.length <= LOOK_PAGE_LIMIT
        ? [...pages.own, ...pages.reach]
        : pages.own.length > 0
          ? pages.own
          : pages.reach.slice(0, 1);

    for (const page of look) add(page, 'desktop', file);
    for (const page of pages.reach) {
      if (!look.includes(page)) add(page, 'load', file);
    }
  }

  return { cells: foldLoadsIntoLooks([...cells.values()]), unmapped };
}

function foldLoadsIntoLooks(cells) {
  const looks = cells.filter((cell) => cell.variant !== 'load');
  const loads = cells.filter((cell) => cell.variant === 'load');
  for (const load of loads) {
    for (const look of looks.filter((cell) => cell.route === load.route)) {
      look.files = unique([...look.files, ...load.files]);
    }
  }
  return [
    ...looks,
    ...loads.filter((load) => !looks.some((cell) => cell.route === load.route)),
  ];
}

const showsDesktop = (visit) =>
  visit.theme === 'light' && visit.width >= DESKTOP_MIN_WIDTH;

const errorsWinTies = (a, b) => a.errors.length - b.errors.length;

const pagePath = (route) => {
  try {
    return decodeURI(route).replace(/\/$/, '');
  } catch {
    return route.replace(/\/$/, '');
  }
};

function judge(cells, { lastWrite, visits }) {
  return cells.map((cell) => {
    const edited = Math.max(...cell.files.map(lastWrite));
    const fresh = (visit) => visit.rendered >= edited + SETTLE_MS;
    const failedAfterEdit = (visit) =>
      visit.errors.length > 0 && Date.parse(visit.at) > edited;
    const counts = (visit) => fresh(visit) || failedAfterEdit(visit);
    const onPage = (visit) => pagePath(visit.path) === pagePath(cell.route);

    if (cell.variant === 'load') {
      const counted = visits.filter((each) => onPage(each) && counts(each));
      const visit =
        counted.findLast((each) => !each.webdriver) ?? counted.at(-1);
      if (!visit) return { ...cell, state: 'open' };
      return visit.errors.length > 0
        ? { ...cell, detail: visit.errors[0], state: 'error' }
        : { ...cell, state: 'covered' };
    }

    const matching = visits.filter(
      (visit) => !visit.frame && onPage(visit) && showsDesktop(visit)
    );
    const handDriven = matching.filter((visit) => !visit.webdriver);
    const failsOrShowsDesktop = (visit) =>
      visit.errors.length > 0 || showsDesktop(visit);
    const current = visits.findLast(
      (visit) =>
        !visit.frame &&
        !visit.webdriver &&
        onPage(visit) &&
        counts(visit) &&
        failsOrShowsDesktop(visit)
    );

    if (current) {
      return current.errors.length > 0
        ? { ...cell, detail: current.errors[0], state: 'error' }
        : { ...cell, state: 'covered' };
    }
    if (handDriven.length > 0) {
      const gap = Math.round(handDriven.at(-1).rendered - edited);
      return {
        ...cell,
        detail: Number.isNaN(gap)
          ? 'the visit has no render time; reload the page'
          : `the page rendered ${Math.abs(gap)} ms ${gap < 0 ? 'before' : 'after'} the last edit to its files; reload it ${SETTLE_MS / 1000} s after the edit`,
        state: 'stale',
      };
    }
    if (matching.length > 0) {
      return { ...cell, detail: 'only a webdriver visit', state: 'open' };
    }
    return { ...cell, state: 'open' };
  });
}

function blobReader(root) {
  const blobs = new Map();
  return (file) => {
    if (!blobs.has(file)) {
      blobs.set(
        file,
        existsSync(path.join(root, file))
          ? git(root, ['hash-object', '--', file]).trim()
          : null
      );
    }
    return blobs.get(file);
  };
}

const lastWriteReader = (root, routes) => (file) => {
  const full = path.join(root, file);
  return existsSync(full)
    ? statSync(full).mtimeMs
    : Date.parse(routes.get(file)?.at);
};

const readRoutes = (dir) =>
  new Map(
    readJsonl(path.join(dir, 'routes.jsonl')).map((record) => [
      record.file,
      record,
    ])
  );

function judgeFiles(files, { dir, root }) {
  const routes = readRoutes(dir);
  const { cells, unmapped } = cellsFor(
    files,
    readSources(root),
    routes,
    blobReader(root)
  );
  const states = judge(cells, {
    lastWrite: lastWriteReader(root, routes),
    visits: readJsonl(path.join(dir, 'visits.jsonl')).sort(
      (a, b) =>
        (a.sent ?? Date.parse(a.at)) - (b.sent ?? Date.parse(b.at)) ||
        errorsWinTies(a, b)
    ),
  });
  return { states, unmapped };
}

function report({ states, unmapped }) {
  const lines = states.map(
    (cell) =>
      `${cell.state.padEnd(7)} ${cell.key}${cell.detail ? `  (${cell.detail})` : ''}`
  );
  for (const file of unmapped) {
    lines.push(
      `unmapped ${file}  (name its pages: hand-drive.mjs route ${file} <page...>, or --none <reason>)`
    );
  }
  return lines;
}

function filesEditedSinceSkipDrive(transcript, root) {
  let files = new Set();

  for (const line of transcript.split('\n')) {
    if (!line) continue;
    let record;
    try {
      record = JSON.parse(line);
    } catch {
      continue;
    }
    const payload =
      record.type === 'response_item' ? record.payload : undefined;
    const change =
      record.type === 'event_msg' && record.payload?.type === 'item_completed'
        ? record.payload.item
        : undefined;

    if (record.type === 'assistant' && Array.isArray(record.message?.content)) {
      for (const block of record.message.content) {
        if (block.type === 'tool_use' && EDIT_TOOLS.has(block.name)) {
          files.add(block.input?.file_path ?? block.input?.notebook_path);
        }
      }
    } else if (change?.type === 'FileChange' && change.status === 'completed') {
      for (const [file, { move_path: moved }] of Object.entries(
        change.changes ?? {}
      )) {
        files.add(file);
        if (typeof moved === 'string') files.add(moved);
      }
    } else {
      const message =
        record.type === 'user'
          ? record.message
          : payload?.role === 'user'
            ? payload
            : null;
      const blocks =
        typeof message?.content === 'string'
          ? [{ text: message.content, type: 'text' }]
          : Array.isArray(message?.content)
            ? message.content
            : [];
      if (
        blocks.some(
          (block) =>
            (block.type === 'text' || block.type === 'input_text') &&
            SKIP_WORDS.test(block.text)
        )
      ) {
        files = new Set();
      }
    }
  }

  return [...files]
    .filter(Boolean)
    .map((file) => path.relative(root, path.resolve(root, file)))
    .filter((file) => !file.startsWith('..') && !path.isAbsolute(file))
    .map((file) => file.split(path.sep).join('/'));
}

function hook({ dir, root }) {
  const input = JSON.parse(readFileSync(0, 'utf-8') || '{}');
  if (
    input.stop_hook_active ||
    input.background_tasks?.length ||
    input.session_crons?.length ||
    !input.transcript_path ||
    !existsSync(input.transcript_path)
  ) {
    return;
  }

  const files = filesEditedSinceSkipDrive(
    readFileSync(input.transcript_path, 'utf-8'),
    root
  );
  if (files.length === 0) return;
  const result = judgeFiles(files, { dir, root });
  const open = result.states.filter((cell) => cell.state !== 'covered');
  if (open.length === 0 && result.unmapped.length === 0) return;

  const lines = report({
    states: open,
    unmapped: result.unmapped,
  });
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason: [
        `The hand drive is not done: ${open.length} cells and ${result.unmapped.length} unmapped files are open for the browser-visible files this session edited. Open each cell's page in the built-in browser against the www-drive server at desktop width in light, at least ${SETTLE_MS / 1000} s after the last edit to its files, take a screenshot and read it, then run node tooling/scripts/hand-drive.mjs check, as verify's Hand drive section says. The owner's message starting with "skip drive" waives the edits made before it.`,
        ...lines.slice(0, 40),
        ...(lines.length > 40 ? [`… and ${lines.length - 40} more`] : []),
      ].join('\n'),
    })
  );
}

function parseArgs(argv) {
  const options = { files: [], root: ROOT };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    const value = () => argv[(index += 1)];
    if (arg === '--dir') options.dir = value();
    else if (arg === '--root') options.root = path.resolve(value());
    else if (arg === '--none') options.none = value();
    else options.files.push(arg);
  }
  options.dir = path.resolve(ROOT, options.dir ?? DRIVE_DIR);
  return options;
}

function main() {
  const [command, ...rest] = process.argv.slice(2);
  const options = parseArgs(rest);

  if (command === '--hook') {
    try {
      hook(options);
    } catch (error) {
      console.error(`hand-drive hook skipped: ${error.message}`);
    }
    return;
  }
  if (command === 'scope') {
    const { cells, unmapped } = cellsFor(
      options.files,
      readSources(options.root),
      readRoutes(options.dir),
      blobReader(options.root)
    );
    for (const line of report({
      states: cells.map((cell) => ({ ...cell, state: 'need' })),
      unmapped,
    })) {
      console.log(line);
    }
    return;
  }
  if (command === 'route') {
    const [file, ...pages] = options.files;
    if (!file || (pages.length === 0 && !options.none)) {
      throw new Error('route needs a file and its pages, or --none <reason>');
    }
    appendJsonl(path.join(options.dir, 'routes.jsonl'), {
      at: new Date().toISOString(),
      blob: blobReader(options.root)(file),
      file,
      ...(options.none ? { none: options.none } : { pages }),
    });
    console.log(
      options.none
        ? `${file} shows nothing: ${options.none}`
        : `${file} → ${pages.join(', ')}`
    );
    return;
  }
  if (command === 'check') {
    const result = judgeFiles(options.files, options);
    for (const line of report(result)) console.log(line);
    const open =
      result.states.filter((cell) => cell.state !== 'covered').length +
      result.unmapped.length;
    console.log(open === 0 ? 'hand drive done' : `hand drive open: ${open}`);
    process.exitCode = open === 0 ? 0 : 1;
    return;
  }
  throw new Error(
    'usage: hand-drive.mjs scope|route|check [--dir <drive dir>] [--root <checkout>] <args...> | --hook'
  );
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
