// Seeds docs/research/repos.tsv from what research already recorded: the
// `<owner>/<repo>@<commit>` pins and `../<clone>/` paths on research pages,
// the editor harvests, the editor audit index and the frozen per-run repo
// registries. A row the file already holds stays as it is, so a rerun adds
// only the repos the file lacks.
// usage: node tooling/scripts/knowledge/seed-repos.mjs
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';

import { isSplit, privateGit, trackedFiles } from '../private-files.mjs';
import { editorRepos } from './knowledge.mjs';

const OUT = 'docs/research/repos.tsv';
const AREAS = 'docs/research/areas.tsv';
const SOURCES = 'docs/research/sources/';
const AUDITS = 'docs/editor-audits/index.json';
const COLUMNS = [
  'repo',
  'url',
  'clone',
  'kind',
  'status',
  'areas',
  'added',
  'note',
];

// Kinds the sources get wrong: the editor comparison run also listed apps and
// data libraries.
const KINDS = {
  'automerge/automerge': 'library',
  'loro-dev/loro': 'library',
  'microsoft/vscode': 'app',
  'outline/outline': 'app',
  'sanity-io/sanity': 'app',
  'slab/delta': 'library',
  'yjs/yjs': 'library',
  'zed-industries/zed': 'app',
};
// The area each frozen research run studied; a run that compared editors
// across every area files its repos under none.
const RUN_AREAS = {
  '2026-06-12-oss-history-undo-architecture': ['history-and-undo'],
  '2026-09-09-editor-performance-iteration-2': ['performance'],
  '2026-09-10-authored-changes': ['marks-decorations-and-annotations'],
  '2026-09-10-structural-diff-oss': ['marks-decorations-and-annotations'],
  '2026-09-11-large-documents-contract': ['large-documents'],
  '2026-09-14-docx-interoperability-oss': ['conversion-and-export'],
  '2026-09-15-docx-post-implementation-oss': ['conversion-and-export'],
  '2026-09-17-table-substrate-ownership': ['tables'],
  '2026-09-21-annotation-architecture-oss': [
    'marks-decorations-and-annotations',
  ],
  '2026-09-21-media-object-editable-content': ['media-and-embeds'],
  '2026-09-24-export-architecture': ['conversion-and-export'],
  '2026-09-25-document-codec-architecture': ['conversion-and-export'],
  '2026-10-02-agentic-e2e-testing': ['testing-and-proof'],
  '2026-10-02-autocomplete-query-representation': ['autocomplete-and-triggers'],
  '2026-10-02-dnd-library-choice': ['drag-and-drop'],
  '2026-10-06-docx-native-state': ['conversion-and-export'],
  '2026-10-13-editor-comparison': [],
  '2026-10-22-find-incremental-decorations': [
    'marks-decorations-and-annotations',
  ],
};
// A registry status that says the run saw a repo without using it.
const SKIPPED =
  /^(discovery-only|screened|metadata|identified|grep-dispositioned)/;
const HOST =
  /^(?:https?:\/\/|git@)(github\.com|codeberg\.org|code\.haverbeke\.berlin)[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:[/#?].*)?$/i;
const PIN = /(?<![\w./-])([A-Za-z0-9][\w.-]*\/[\w.-]+)@[0-9a-f]{7,40}(?!\w)/g;
const CLONE_SPAN = /`\.\.\/([\w.-]+)\//g;

const git = (cwd, args) =>
  spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf-8' }).stdout.trim();
const root = git(process.cwd(), ['rev-parse', '--show-toplevel']);
// Clone paths are relative to the main checkout, which every worktree shares.
const plateRoot = dirname(
  git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir'])
);
const parent = dirname(plateRoot);
const read = (path) => readFileSync(join(root, path), 'utf-8');
const tsvRows = (text) => {
  const [head, ...lines] = text.split('\n').filter((line) => line.trim());
  const names = head.split('\t');
  return lines.map((line) => {
    const cells = line.split('\t');
    return Object.fromEntries(names.map((name, i) => [name, cells[i] ?? '']));
  });
};
const cell = (text) => text.replace(/\s+/g, ' ').trim();

const parseUrl = (url) => {
  const match = HOST.exec(url.trim());
  if (!match) return undefined;
  const [, host, owner, name] = match;
  return {
    repo: `${owner}/${name}`.toLowerCase(),
    url: `https://${host.toLowerCase()}/${owner}/${name}`,
  };
};

// Every git clone beside the main checkout, two folders deep, and under
// ../raw three deep, keyed by the repository its origin names.
function cloneIndex() {
  const byRepo = new Map();
  const visit = (dir, depth) => {
    if (existsSync(join(dir, '.git'))) {
      const found = parseUrl(
        git(dir, ['config', '--get', 'remote.origin.url'])
      );
      if (found) {
        if (!byRepo.has(found.repo)) byRepo.set(found.repo, []);
        byRepo.get(found.repo).push(dir);
      }
    }
    if (depth === 0) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        entry.name !== 'node_modules'
      ) {
        visit(join(dir, entry.name), depth - 1);
      }
    }
  };
  for (const entry of readdirSync(parent, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const dir = join(parent, entry.name);
    if (dir !== plateRoot) visit(dir, entry.name === 'raw' ? 3 : 1);
  }
  return byRepo;
}

// The date git first added each file under the given folders. plate-private's
// history starts at the split, so the earlier of the two repositories' dates
// wins.
function addedDates(folders) {
  const out = new Map();
  const args = [
    'log',
    '--diff-filter=A',
    '--name-only',
    '--format=@%as',
    '--',
    ...folders,
  ];
  for (const log of [
    git(root, args),
    ...(isSplit(root) ? [privateGit(root, args).stdout] : []),
  ]) {
    let date = '';
    for (const line of log.split('\n')) {
      if (line.startsWith('@')) {
        date = line.slice(1);
        continue;
      }
      const known = out.get(line);
      if (line && (!known || date < known)) out.set(line, date);
    }
  }
  return out;
}

const areaIds = new Set(tsvRows(read(AREAS)).map((row) => row.area));
const clones = cloneIndex();
const tracked = trackedFiles(root, {
  pathspecs: [
    SOURCES,
    'docs/editor-test-harvester',
    'docs/editor-issue-harvester',
  ],
});
const added = addedDates([
  SOURCES,
  'docs/editor-test-harvester',
  'docs/editor-issue-harvester',
]);

const sightings = [];
const see = (sighting) => sightings.push({ areas: [], ...sighting });

for (const path of tracked) {
  if (!path.startsWith(SOURCES) || !path.endsWith('.md')) continue;
  const [home] = path.slice(SOURCES.length).split('/');
  const area = basename(path, '.md').replace(/-\d+$/, '');
  const areas = areaIds.has(area) ? [area] : [];
  const text = read(path);
  for (const [, repo] of text.matchAll(PIN)) {
    see({
      repo: repo.toLowerCase(),
      status: 'saved',
      areas,
      date: added.get(path),
      home,
    });
  }
  for (const [, name] of text.matchAll(CLONE_SPAN)) {
    const dir = join(parent, name);
    if (!existsSync(join(dir, '.git'))) continue;
    const found = parseUrl(git(dir, ['config', '--get', 'remote.origin.url']));
    if (found) {
      see({ ...found, status: 'saved', areas, date: added.get(path), dir });
    }
  }
}

for (const path of tracked) {
  const harvest = /^docs\/editor-(?:test|issue)-harvester\/([^/]+)\//.exec(
    path
  )?.[1];
  if (harvest && editorRepos[harvest]) {
    see({
      repo: editorRepos[harvest],
      status: 'saved',
      date: added.get(path),
      home: harvest,
    });
  }
}

for (const audit of JSON.parse(read(AUDITS)).audits) {
  for (const reference of audit.references ?? []) {
    const found = parseUrl(reference.source ?? '');
    if (!found) continue;
    see({
      ...found,
      status: 'saved',
      date: reference.auditedAt?.slice(0, 10),
      dir: reference.localPath && join(plateRoot, reference.localPath),
      note: `audited in ${audit.id}`,
    });
  }
}

let dropped = 0;
for (const path of trackedFiles(root, {
  pathspecs: ['docs/plite/research/*/repo-registry.tsv'],
})) {
  const run = path.split('/')[3];
  for (const row of tsvRows(read(path))) {
    const found = parseUrl(row.url);
    if (!found) {
      dropped += 1;
      continue;
    }
    const skipped = SKIPPED.test(row.status);
    see({
      ...found,
      status: skipped ? 'skipped' : 'saved',
      areas: RUN_AREAS[run] ?? [],
      date: run.slice(0, 10),
      dir: row.local_path,
      note: cell(`${skipped ? `${row.status}: ` : ''}${row.notes}`),
      editor: run === '2026-10-13-editor-comparison',
    });
  }
}

const byRepo = new Map();
for (const sighting of sightings) {
  if (!byRepo.has(sighting.repo)) byRepo.set(sighting.repo, []);
  byRepo.get(sighting.repo).push(sighting);
}
const editors = new Set(Object.values(editorRepos));
const derived = new Map();
for (const [repo, seen] of byRepo) {
  const saved = seen.some((each) => each.status === 'saved');
  const dirs = [
    ...(clones.get(repo) ?? []),
    ...seen.map((each) => each.dir),
  ].filter((dir) => dir && existsSync(join(dir, '.git')));
  const clone =
    dirs.find((dir) => basename(dir) === repo.split('/')[1]) ??
    dirs.sort((a, b) => a.length - b.length)[0];
  const kind =
    KINDS[repo] ??
    (editors.has(repo) || seen.some((each) => each.editor)
      ? 'editor'
      : 'library');
  const note =
    seen.find((each) => each.note && (each.status === 'saved') === saved)
      ?.note ?? '';
  derived.set(repo, {
    repo,
    url: seen.find((each) => each.url)?.url ?? `https://github.com/${repo}`,
    clone: clone ? relative(plateRoot, clone) : '',
    kind,
    status: saved ? 'saved' : 'skipped',
    areas: [...new Set(seen.flatMap((each) => each.areas))]
      .sort((a, b) => a.localeCompare(b))
      .join(','),
    added:
      seen
        .map((each) => each.date)
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b))[0] ?? '',
    note,
  });
}

const kept = existsSync(join(root, OUT)) ? tsvRows(read(OUT)) : [];
const keptRepos = new Set(kept.map((row) => row.repo));
const rows = [
  ...kept,
  ...[...derived.values()].filter((row) => !keptRepos.has(row.repo)),
].sort((a, b) => a.repo.localeCompare(b.repo));
const text = `${[
  COLUMNS,
  ...rows.map((row) => COLUMNS.map((column) => row[column])),
]
  .map((cells) => cells.join('\t'))
  .join('\n')}\n`;
const before = existsSync(join(root, OUT)) ? read(OUT) : '';
if (text !== before) writeFileSync(join(root, OUT), text);
console.log(
  `${OUT}: ${rows.length} repos (${rows.length - kept.length} added, ${kept.length} kept), ${dropped} registry rows name no git host`
);
