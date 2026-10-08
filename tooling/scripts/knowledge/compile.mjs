import { createHash } from 'node:crypto';
import { posix } from 'node:path';

import { linkedPaths, ruleIds, unfencedLines } from './knowledge.mjs';

const ROOTS = [
  'docs/research/',
  'docs/editor-audits/',
  'docs/plite/research/',
  'docs/editor-issue-harvester/',
  'docs/editor-test-harvester/',
  'docs/plite-issues/',
];
const SOURCES = 'docs/research/sources/';
const HOMES_FILE = 'docs/research/homes.tsv';
export const FOLDED_FILE = 'docs/research/folded.tsv';

const LAYER = new Set([
  'docs/research/README.md',
  'docs/research/schema.md',
  'docs/research/log.md',
  HOMES_FILE,
  FOLDED_FILE,
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

/** Git's blob id for a file's bytes, or for text as UTF-8. */
export function blobOf(content) {
  const bytes =
    typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
  return createHash('sha1')
    .update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes]))
    .digest('hex');
}

const pointerLine = (homes) =>
  `> Folded into ${homes.join(', ')}. Edit the home, not this file.`;

/** `text` with the fold's pointer line, after any YAML frontmatter. */
export function foldText(text, homes) {
  const lines = text.split('\n');
  const end = lines[0] === '---' ? lines.indexOf('---', 1) + 1 : 0;
  lines.splice(end, 0, pointerLine(homes));
  return lines.join('\n');
}

const readFolded = (text) =>
  tsv(text ?? '').map(({ cells: [path, blob = ''], line }) => ({
    path,
    blob,
    line,
  }));

/**
 * K15: a folded file stays as it was folded, and a folded directory gains no
 * file. `base` is `folded.tsv` at the base commit, whose rows may only be kept
 * or removed with their file.
 */
export function foldFindings(tree, { base } = {}) {
  const rows = tree.has(FOLDED_FILE) ? readFolded(tree.read(FOLDED_FILE)) : [];
  const baseRows = readFolded(base);
  const out = [];
  const finding = (form, file, message) =>
    out.push({
      rule: 'K15',
      form,
      file,
      line: 1,
      message,
      identity: `${form} ${file}`,
    });
  const fileRows = (list) =>
    new Map(
      list
        .filter((row) => !row.path.endsWith('/'))
        .map((row) => [row.path, row])
    );
  const files = fileRows(rows);
  const baseFiles = fileRows(baseRows);
  const blobAt = (path) =>
    blobOf(tree.bytes ? tree.bytes(path) : tree.read(path));
  for (const row of files.values()) {
    if (tree.has(row.path) && blobAt(row.path) !== row.blob) {
      finding(
        'changed',
        row.path,
        `${row.path} changed after it was folded; write to its home instead`
      );
    }
  }
  const baseDirs = new Set(
    baseRows.filter((row) => row.path.endsWith('/')).map((row) => row.path)
  );
  const dirs = rows
    .filter((row) => row.path.endsWith('/'))
    .map((row) => row.path);
  for (const path of tree.list()) {
    if (!dirs.some((dir) => path.startsWith(dir)) || !tree.has(path)) continue;
    // Membership under a directory folded at base is the base table's, so a
    // row added with its file cannot admit it.
    const atBase = [...baseDirs].some((dir) => path.startsWith(dir));
    const known = atBase ? baseFiles : files;
    if (!known.has(path)) {
      finding(
        'new-file',
        path,
        `${path} is new under a folded directory; write it to a home instead`
      );
    }
  }
  for (const old of baseRows) {
    const now = rows.find((row) => row.path === old.path);
    const remains = old.path.endsWith('/')
      ? tree.list().some((path) => path.startsWith(old.path) && tree.has(path))
      : tree.has(old.path);
    if (!now && remains) {
      finding(
        'row-removed',
        old.path,
        `${FOLDED_FILE} lost the row for ${old.path} while its files remain`
      );
    } else if (now && now.blob !== old.blob) {
      finding(
        'row-changed',
        old.path,
        `${FOLDED_FILE} changed the folded blob of ${old.path}`
      );
    }
  }
  return out;
}

/**
 * The folded content of a source the compile read at `resolvedBlob`. A file
 * that changed since that read is compiled again before it can fold.
 */
export function foldSource(path, content, resolvedBlob, homes) {
  const markdown = path.endsWith('.md');
  const text =
    typeof content === 'string' ? content : content.toString('utf-8');
  if (blobOf(content) === resolvedBlob) {
    return markdown ? foldText(text, homes) : content;
  }
  const pointer = `${pointerLine(homes)}\n`;
  const at = text.indexOf(pointer);
  if (
    markdown &&
    at !== -1 &&
    blobOf(text.slice(0, at) + text.slice(at + pointer.length)) === resolvedBlob
  ) {
    return text;
  }
  throw new Error(
    'the file changed after the compile read it; compile it again first'
  );
}

const SPEC_FILE = 'docs/editor-behavior/markdown-editing-spec.md';
const HEADING = /^(#{1,6}) /;
const VERDICTS = new Set(['obsolete', 'withdrawn', 'move']);

const occurrences = (text, part) => text.split(part).length - 1;

function appendToSection(text, section, addition) {
  const lines = text.split('\n');
  const open = unfencedLines(lines);
  const starts = open.filter((i) => lines[i] === section);
  if (starts.length !== 1) {
    throw new Error(
      `the heading ${JSON.stringify(section)} occurs ${starts.length} times; name one heading`
    );
  }
  const [start] = starts;
  const level = HEADING.exec(section)?.[1].length;
  if (!level) {
    throw new Error(`${JSON.stringify(section)} is not a heading line`);
  }
  const next = open.find((i) => i > start && HEADING.exec(lines[i]));
  if (next !== undefined && HEADING.exec(lines[next])[1].length > level) {
    throw new Error(
      `${section} has subsections; name the one the text belongs under`
    );
  }
  let at = next ?? lines.length;
  while (at > start + 1 && lines[at - 1] === '') at -= 1;
  lines.splice(at, 0, '', ...addition.trimEnd().split('\n'));
  return lines.join('\n');
}

function removeSpan(text, span) {
  const lines = text.split('\n');
  const whole = lines.findIndex((line) => line.trim() === span.trim());
  if (whole !== -1) {
    lines.splice(
      whole,
      lines[whole + 1] === '' && lines[whole - 1] === '' ? 2 : 1
    );
    return lines.join('\n');
  }
  return text.replace(span, '');
}

/**
 * `kb write`'s one change to the file at `path`, returning its new text.
 * `kept` lists the accepted units whose quoted spans the file holds; a
 * change that lowers a span's count is refused unless it is that unit's own
 * removal or move under its verdict. `stands` says whether a moved unit's new
 * span stands in another home.
 */
export function write(
  path,
  text,
  change,
  { kept = [], stands = () => false } = {}
) {
  let next;
  if (change.op === 'create') {
    if (text !== undefined) {
      throw new Error(`${path} exists; kb write creates only a new file`);
    }
    next = change.text;
  } else if (change.op === 'append') {
    next = appendToSection(text, change.section, change.text);
  } else if (change.op === 'replace') {
    if (occurrences(text, change.old) !== 1) {
      throw new Error(
        `the text to replace occurs ${occurrences(text, change.old)} times in ${path}; it must occur once`
      );
    }
    next = text.split(change.old).join(change.new);
  } else if (change.op === 'remove') {
    if (!VERDICTS.has(change.verdict)) {
      throw new Error(
        `removing ${change.unit}'s span needs an obsolescence, withdrawal or move verdict`
      );
    }
    if (!occurrences(text, change.span)) {
      throw new Error(`${path} does not hold the span to remove`);
    }
    next = removeSpan(text, change.span);
  } else {
    throw new Error(`kb write has no ${change.op} operation`);
  }
  if (change.verdict === 'move') {
    const landed =
      change.to?.home === path
        ? occurrences(next, change.to.span) > 0
        : stands(change.to);
    if (!landed) {
      throw new Error(`${change.unit}'s new span stands in no home yet`);
    }
  }
  if (path === SPEC_FILE) {
    const before = ruleIds(text ?? '');
    const after = ruleIds(next);
    for (const id of new Set(after)) {
      const count = after.filter((item) => item === id).length;
      if (count > 1 && count > before.filter((item) => item === id).length) {
        throw new Error(
          `${path} already defines ${id}; give the rule a new ID`
        );
      }
    }
  }
  for (const { key, span } of kept) {
    const own =
      change.unit === key &&
      (change.op === 'remove' ||
        (change.op === 'replace' && change.verdict === 'move'));
    if (!own && occurrences(next, span) < occurrences(text ?? '', span)) {
      throw new Error(`the write removes the kept span of ${key}`);
    }
  }
  return next;
}

const LINK_ONLY = new Set([
  'docs/editor-issue-harvester/prosekit/full/issue-closure-ledger.tsv',
  'docs/editor-issue-harvester/wordgard/full/issue-decisions.mjs',
  'docs/editor-issue-harvester/slate/full/classify-delta.mjs',
  'docs/maintainer/queue.md',
  'docs/sync/shadcn/deltas.json',
  'docs/plite/reference/public-route-map.json',
]);
const HARVEST_STATE =
  /^docs\/editor-test-harvester\/[^/]+\/(?:test-index|inventory)\.md$/;
const GENERATED_LEDGER =
  /^(docs\/editor-issue-harvester\/[^/]+\/full\/)issue-closure-ledger\.(?:md|tsv)$/;
const ONE_RULE = /^EDIT-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}$/;
const DISPOSITIONS = new Set(['covered', 'added', 'dropped', 'link', 'record']);

/** Operational state a home links to instead of compiling. */
function isLinkOnly(path, has) {
  const ledger = GENERATED_LEDGER.exec(path);
  return (
    LINK_ONLY.has(path) ||
    HARVEST_STATE.test(path) ||
    Boolean(ledger && has(`${ledger[1]}build-closure-ledger.mjs`))
  );
}

const repeated = (keys) => keys.filter((key, i) => keys.indexOf(key) !== i);

/**
 * Builds a batch's resolved file from its sources, the first readers' units
 * and the second reader's verdicts, refusing every gap a script can see.
 * Each source carries `blob`, which `kb batch` recorded for its readers, and
 * may carry `current`, the blob of its bytes now. A binary source needs
 * `current`, because its `text` is a lossy UTF-8 decode.
 */
export function resolve({
  batch,
  sources,
  units,
  verdicts,
  seed,
  sample = 5,
  has = () => false,
}) {
  const problems = [];
  for (const item of units) {
    if (!/^[\w-]+$/.test(item.key ?? '')) {
      problems.push(`${item.key} is not a plain key`);
    }
  }
  for (const key of new Set(repeated(units.map((item) => item.key)))) {
    problems.push(`${key} names more than one unit`);
  }
  for (const key of new Set(repeated(verdicts.map((item) => item.key)))) {
    problems.push(`${key} has more than one verdict`);
  }
  const verdictOf = new Map(verdicts.map((item) => [item.key, item]));
  const resolved = units.map((item) => ({
    ...item,
    verdict: verdictOf.get(item.key)?.verdict,
    note: verdictOf.get(item.key)?.note,
  }));
  const done = (item) =>
    item.verdict === 'accepted' || item.verdict === 'owner';
  const binary = new Set();
  for (const source of sources) {
    if ((source.current ?? blobOf(source.text)) !== source.blob) {
      problems.push(
        `${source.path} changed after its readers read it; read it again`
      );
    }
    const own = resolved.filter((item) => item.source === source.path);
    if (!own.length) {
      problems.push(`${source.path} has no unit`);
      continue;
    }
    if (source.text.includes('\0')) {
      binary.add(source.path);
      continue;
    }
    source.text.split('\n').forEach((line, index) => {
      const at = index + 1;
      if (
        line.trim() &&
        !own.some((item) => item.lines[0] <= at && at <= item.lines[1])
      ) {
        problems.push(`line ${at} of ${source.path} belongs to no unit`);
      }
    });
  }
  const ids = new Map();
  for (const item of resolved) {
    if (!done(item)) problems.push(`${item.key} has no accepted verdict`);
    if (!DISPOSITIONS.has(item.disposition)) {
      problems.push(`${item.key} has no known disposition`);
    }
    if (item.disposition === 'record' && !binary.has(item.source)) {
      problems.push(
        `${item.key} is a record, but ${posix.basename(item.source)} is text`
      );
    }
    if (item.disposition === 'link' && !isLinkOnly(item.source, has)) {
      problems.push(
        `${item.key} is link-only, but ${posix.basename(item.source)} is not on the link-only list`
      );
    }
    if (item.kind === 'law' || item.target === SPEC_FILE) {
      if (!ONE_RULE.test(item.id ?? '')) {
        problems.push(`${item.key}'s ID ${item.id} is not one rule`);
      }
      ids.set(item.id, [...(ids.get(item.id) ?? []), item.key]);
    }
  }
  for (const [id, keys] of ids) {
    if (keys.length > 1) {
      problems.push(`${id} is the ID of ${keys.join(' and ')}`);
    }
  }
  if (problems.length) {
    throw new Error(`batch ${batch} does not resolve:\n${problems.join('\n')}`);
  }
  const rank = (key) =>
    createHash('sha1').update(`${seed}\0${key}`).digest('hex');
  return {
    batch,
    seed,
    sample: resolved
      .filter(
        (item) => item.disposition === 'dropped' && item.verdict === 'accepted'
      )
      .map((item) => item.key)
      .sort((a, b) => rank(a).localeCompare(rank(b)))
      .slice(0, sample),
    sources: sources.map((source) => ({
      path: source.path,
      blob: source.blob,
      homes: source.homes,
    })),
    units: resolved.map((item) =>
      item.disposition === 'added'
        ? { ...item, span: item.span ?? item.text.trim() }
        : item
    ),
  };
}

const holds = (read, target, span) =>
  Boolean(target && span && read(target)?.includes(span));

/**
 * Reports every resolved unit by its disposition. A resolution and an Open
 * work item name a unit as `<batch>#<key>`, where `kb` names a batch by its
 * resolved file's path under the directory it reads. A unit whose span left
 * its home is lost until a later resolution covers it at a span that stands,
 * records why it was removed, or sends it to the owner's Open work.
 */
export function quote({ resolved, read, resolutions = [], openWork = '' }) {
  const latest = new Map(resolutions.map((item) => [item.unit, item]));
  const named = new Set(openWork.match(/[\w-]+(?:[./:#][\w-]+)*/g));
  const counts = {};
  const lost = [];
  const count = (word) => {
    counts[word] = (counts[word] ?? 0) + 1;
  };
  const settle = (item, batch, why) => {
    const id = `${batch}#${item.key}`;
    const again = latest.get(id);
    if (again?.verdict === 'covered' && holds(read, again.target, again.span)) {
      count('kept');
    } else if (
      ['obsolete', 'withdrawn', 'removed'].includes(again?.verdict) &&
      again.reason
    ) {
      count(again.verdict);
    } else if (again?.verdict === 'owner' && named.has(id)) {
      count('owner');
    } else {
      count('lost');
      lost.push({ key: item.key, batch, why });
    }
  };
  for (const { batch, units } of resolved) {
    for (const item of units) {
      if (item.verdict === 'owner') {
        if (named.has(`${batch}#${item.key}`)) count('owner');
        else settle(item, batch, 'sent to the owner with no Open work item');
      } else if (
        item.disposition === 'covered' ||
        item.disposition === 'added'
      ) {
        if (holds(read, item.target, item.span)) count('kept');
        else settle(item, batch, `its span is gone from ${item.target}`);
      } else if (item.disposition === 'link') {
        const links = item.target
          ? linkedPaths(read(item.target) ?? '', item.target)
          : [];
        if (links.includes(item.source)) count('linked');
        else {
          settle(
            item,
            batch,
            `${item.target ?? 'no home'} does not link ${item.source}`
          );
        }
      } else if (
        item.disposition === 'dropped' ||
        item.disposition === 'record'
      ) {
        count(item.disposition);
      } else {
        settle(item, batch, `its disposition ${item.disposition} is unknown`);
      }
    }
  }
  return { counts, lost };
}

const PIN =
  /(?:\b([\w.-]+\/[\w.-]+|[\w.-]+)@)?\b([0-9a-f]{7,40}):([\w.-]+(?:\/[\w.-]+)*\w)/g;

/** The `<owner>/<repo>@<commit>:<path>`, `<repo>@<commit>:<path>` and `<commit>:<path>` citations in a page. */
export function pins(text) {
  return [...text.matchAll(PIN)].map(([, repo = '.', commit, path]) => ({
    repo,
    commit,
    path,
  }));
}

/**
 * A function from a source path to its unit's homes: those its path implies
 * and those its `homes.tsv` row lists.
 */
export function homesFor(tree) {
  const { rows } = homeIndex(tree);
  return (path) => {
    const unit = unitOf(path);
    return [...new Set([...unit.homes, ...(rows.get(unit.key)?.homes ?? [])])];
  };
}
