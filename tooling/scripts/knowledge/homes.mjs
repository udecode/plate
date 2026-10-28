import { linkedPaths } from './knowledge.mjs';

const ROOTS = [
  'docs/research/',
  'docs/editor-audits/',
  'docs/plite/research/',
  'docs/editor-issue-harvester/',
  'docs/editor-test-harvester/',
  'docs/plite-issues/',
  'docs/plite-draft/',
  'docs/plite-browser/',
  'docs/transplant/',
  'docs/sync/',
  'docs/analysis/',
  'docs/performance/',
  'docs/maintainer/',
  'docs/brainstorms/',
  'docs/table/',
  'docs/editor-benchmarks/',
  'docs/docs-api.md',
  'docs/plite/',
];
const SOURCES = 'docs/research/sources/';
const HOMES_FILE = 'docs/research/homes.tsv';

const LAYER = new Set([
  'docs/research/README.md',
  'docs/research/schema.md',
  'docs/research/log.md',
  'docs/research/areas.tsv',
  'docs/research/repos.tsv',
  HOMES_FILE,
  `${SOURCES}README.md`,
  'docs/editor-issue-harvester/README.md',
  'docs/editor-test-harvester/README.md',
]);

const tsv = (text) =>
  text
    .split('\n')
    .slice(1)
    .filter((line) => line.trim())
    .map((line, i) => ({ cells: line.split('\t'), line: i + 2 }));

function readHomes(tree) {
  if (!tree.has(HOMES_FILE)) return [];
  return tsv(tree.read(HOMES_FILE)).map(
    ({ cells: [path, homes = '', reason = ''], line }) => ({
      path: path.replace(/\/$/, ''),
      homes:
        homes === 'none'
          ? []
          : homes
              .split(',')
              .map((home) => home.trim())
              .filter(Boolean),
      reason,
      line,
    })
  );
}

const RUN = /^(docs\/plite\/research\/[^/]+)\//;

function unitOf(path) {
  const run = RUN.exec(path);
  if (run) return { key: run[1], kind: 'run', homes: [] };
  if (LAYER.has(path) || path.startsWith('docs/research/commands/')) {
    return { key: path, kind: 'layer', homes: [] };
  }
  if (
    /^docs\/research\/(review-records|review-scopes)\//.test(path) ||
    /^docs\/research\/review-[a-z-]+\.json$/.test(path)
  ) {
    return { key: path, kind: 'verdict', homes: [] };
  }
  if (
    /^docs\/research\/(probes|raw)\//.test(path) ||
    /\.(mjs|cjs|js|ts|sh|py)$/.test(path) ||
    path === 'docs/editor-audits/index.json'
  ) {
    return { key: path, kind: 'record', homes: [] };
  }
  const ledger = /^docs\/editor-(issue|test)-harvester\/([^/]+)\//.exec(path);
  if (ledger) {
    return {
      key: path,
      kind: ledger[1] === 'issue' ? 'ledger' : 'harvest',
      homes: [ledger[2]],
    };
  }
  if (path.startsWith('docs/plite-issues/')) {
    return { key: path, kind: 'ledger', homes: ['slate'] };
  }
  const page = /^docs\/research\/sources\/([^/]+)\/./.exec(path);
  if (page) return { key: path, kind: 'page', homes: [page[1]] };
  return { key: path, kind: 'page', homes: [] };
}

const inRoots = (path) => ROOTS.some((root) => path.startsWith(root));

function homeIndex(tree) {
  const rows = new Map(readHomes(tree).map((row) => [row.path, row]));
  const units = new Map();
  for (const path of tree.list()) {
    if (!inRoots(path) || !tree.has(path)) continue;
    const unit = unitOf(path);
    if (!units.has(unit.key)) units.set(unit.key, { ...unit, files: [] });
    units.get(unit.key).files.push(path);
  }
  const folders = new Map();
  const home = (folder) => {
    if (!folders.has(folder)) folders.set(folder, []);
    return folders.get(folder);
  };
  for (const unit of units.values()) {
    const folder = /^docs\/research\/sources\/([^/]+)\//.exec(unit.key)?.[1];
    if (folder) {
      const pages = home(folder);
      if (!unit.key.endsWith('/README.md')) pages.push(unit.key);
    }
    if (unit.kind === 'ledger' || unit.kind === 'harvest') {
      for (const name of unit.homes) home(name);
    }
  }
  for (const row of rows.values()) {
    if (!units.has(row.path)) continue;
    for (const name of row.homes) home(name).push(row.path);
  }
  return { rows, units, folders };
}

/** The homes that need a README under `docs/research/sources/`. */
export function readmeHomes(tree) {
  return [...homeIndex(tree).folders.keys()].sort((a, b) => a.localeCompare(b));
}

/**
 * K14 over a tree. `manifest` is a path listing saved earlier; a run or page
 * outside the source folders that it lacks is listed, not failed, because
 * another workflow wrote it after that listing.
 */
export function homeFindings(tree, { manifest } = {}) {
  const { rows, units, folders } = homeIndex(tree);
  const out = [];
  const inManifest = (key) =>
    !manifest ||
    [...manifest].some((path) => path === key || path.startsWith(`${key}/`));
  const finding = (form, file, message, extra = {}) =>
    out.push({
      rule: 'K14',
      form,
      file,
      line: 1,
      message,
      identity: file,
      ...extra,
    });
  for (const unit of units.values()) {
    if (unit.kind !== 'run' && unit.kind !== 'page') continue;
    if (unit.homes.length || rows.has(unit.key)) continue;
    finding(
      'no-home',
      unit.key,
      `${unit.key} has no home: add its row to ${HOMES_FILE}`,
      { listed: !inManifest(unit.key) }
    );
  }
  for (const row of rows.values()) {
    if (!units.has(row.path)) {
      finding(
        'stale-row',
        row.path,
        `${HOMES_FILE}:${row.line} names ${row.path}, which no longer exists`
      );
    }
  }
  for (const [folder, homed] of folders) {
    const dir = `${SOURCES}${folder}`;
    const readme = `${dir}/README.md`;
    if (!tree.has(readme)) {
      finding('no-readme', dir, `${dir} has no README to index its pages`);
      continue;
    }
    const targets = linkedPaths(tree.read(readme), readme);
    const links = (path) =>
      targets.some(
        (target) => target === path || target.startsWith(`${path}/`)
      );
    for (const path of new Set(homed)) {
      if (!links(path) && units.has(path)) {
        finding(
          'unlinked',
          path,
          `${readme} does not link ${path}, which its home holds`
        );
      }
    }
    const ledgers = [...units.values()].filter(
      (unit) =>
        (unit.kind === 'ledger' || unit.kind === 'harvest') &&
        unit.homes.includes(folder)
    );
    const reaches = (path) =>
      targets.some(
        (target) => path === target || path.startsWith(`${target}/`)
      );
    if (ledgers.length && !ledgers.some((unit) => reaches(unit.key))) {
      finding(
        'no-ledger-link',
        readme,
        `${readme} links neither ${folder}'s ledger nor its harvest`
      );
    }
  }
  return out;
}
