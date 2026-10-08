#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import {
  basename,
  dirname,
  join,
  relative,
  resolve as resolvePath,
} from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  differences,
  enforceBaseline,
  groupFindings,
  readBaseline,
} from '../finding-baseline.mjs';
import {
  blobOf,
  FOLDED_FILE,
  foldFindings,
  foldSource,
  homeFindings,
  homesFor,
  pins,
  quote,
  readmeHomes,
  resolve,
  write,
} from './compile.mjs';
import {
  card,
  commitTree,
  findings,
  gaps,
  indexPatterns,
  loadIndex,
  trackedPaths,
  workTree,
  writeBack,
} from './knowledge.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url)).replace(
  /\/$/,
  ''
);
const BASELINE = 'tooling/scripts/knowledge/baseline.json';
const RULES = ['K0', 'K1', 'K4', 'K7', 'K12', 'K15'];

const clip = (text = '', limit = 120) => {
  const flat = String(text).replace(/\s+/g, ' ').trim();
  return flat.length > limit ? `${flat.slice(0, limit - 1)}…` : flat;
};

const runState = (test) =>
  [
    test.check === 'none'
      ? 'no check runs it'
      : `${test.check}${test.engines.length ? ` (${test.engines.join(', ')})` : ''}`,
    test.skipped && `skipped ${test.skipped}`,
  ]
    .filter(Boolean)
    .join(', ');

const listed = (label, list, line) => {
  const items = list?.items ?? list ?? [];
  const total = list?.total ?? items.length;
  return items.length
    ? [`${label} (${total}):`, ...items.map((item) => `  ${line(item)}`)]
    : [];
};

function scopeLines(scope, detail) {
  if (scope.omitted) return [`${scope.omitted} more scopes: ${scope.narrow}`];
  const { head } = scope;
  const open = scope.open?.open ?? 'closed';
  const first = `${scope.id}  verdict ${head?.verdict ?? 'unreviewed'}${head ? ` (${head.id})` : ''}  open ${open}  ${clip(scope.title ?? '')}  (${scope.scopeFile})`;
  if (!detail) return [first];
  const fresh = (state) =>
    state
      ? `${state.state}; changed ${state.changed?.total ?? state.changed?.length ?? 0}, missing ${state.missing?.total ?? state.missing?.length ?? 0}`
      : 'no commit recorded';
  return [
    first,
    ...(scope.question ? [`question: ${clip(scope.question, 200)}`] : []),
    ...(head
      ? [
          `head summary: ${clip(head.summary, 600)}`,
          `head freshness: ${fresh(scope.freshness)}`,
        ]
      : [
          'head: none, so read the history, plans and candidates below before calling it untouched',
        ]),
    ...(scope.decision ? [`decision: ${scope.decision}`] : []),
    ...listed(
      'related',
      scope.related,
      (item) =>
        `${item.id} verdict ${item.verdict ?? 'unreviewed'} open ${item.open ?? 'closed'}`
    ),
    ...listed(
      'history',
      scope.history,
      (record) =>
        `${record.date} ${record.id} ${record.verdict ?? record.outcome ?? record.kind}  ${clip(record.summary, 160)}  [${record.freshness?.state ?? '?'}]`
    ),
    ...listed(
      'executions',
      scope.history ? null : scope.executions,
      (item) => `${item.date} ${item.id} ${item.outcome}`
    ),
    ...listed(
      'plans',
      scope.plans,
      (plan) =>
        `${plan.path} ${plan.status || 'no status'}${plan.landed === false ? ', not landed' : ''}${plan.freshness ? `, ${plan.freshness.state}` : ''}`
    ),
    ...listed(
      'documents',
      scope.documents,
      (document) => `${document.path} ${document.kind} ${document.disposition}`
    ),
    ...listed('candidates', scope.candidates, (path) => path),
  ].map((line, i) => (i ? `    ${line}` : line));
}

const sections = [
  {
    key: 'law',
    label: 'LAW',
    line: (rule) =>
      `${rule.id}  ${rule.status ?? ''}${rule.key ? `  ${rule.key}` : ''}  ${clip(rule.title || rule.notes[0] || rule.scenario?.split('\n').find(Boolean) || '')}  (${rule.file}:${rule.line})`,
  },
  {
    key: 'tests',
    label: 'TESTS',
    line: (test) =>
      `${test.tags.length ? test.tags.join(' ') : 'untagged'}  ${clip(test.title ?? '(title is not a literal)')}  (${test.file}:${test.line}; ${runState(test)})`,
  },
  {
    key: 'upstream',
    label: 'UPSTREAM',
    line: (issue) =>
      `${issue.ref}  ${issue.assessment || '-'}  ${clip(issue.title)}  (${issue.file}:${issue.line})`,
  },
  {
    key: 'harvested',
    label: 'HARVESTED',
    line: (test) =>
      `${test.editor}@${test.revision?.slice(0, 9) ?? '?'}  ${clip(test.title)}  (${test.upstream})`,
  },
  {
    key: 'pages',
    label: 'RESEARCH PAGES',
    line: (page) => `${clip(page.title, 100)}  (${page.file})`,
  },
  {
    key: 'research',
    label: 'RESEARCH RUNS',
    line: (row) =>
      `${clip(
        Object.values(row.row ?? {})
          .filter(Boolean)
          .slice(0, 4)
          .join(' · ')
      )}  (${row.path}:${row.line})`,
  },
  {
    key: 'lessons',
    label: 'LESSONS',
    line: (lesson) => `${lesson.title}  (${lesson.file}:${lesson.line})`,
  },
  {
    key: 'targets',
    label: 'TARGETS',
    line: (target) => `${target.id}  ${clip(target.question)}`,
  },
  {
    key: 'notes',
    label: 'NOTES',
    line: (note) => `${note.title}  (${note.file})`,
  },
  {
    key: 'subjects',
    label: 'SUBJECTS',
    line: (subject) => `${subject.title}  (${subject.file})`,
  },
  {
    key: 'decisions',
    label: 'DECISION PAGES',
    line: (page) => `${page.title}  (${page.file})`,
  },
];

function printCard(result, query, detail) {
  const keys = Object.entries(result.keys)
    .filter(([, values]) => values.length)
    .map(([kind, values]) => `${kind} ${values.join(', ')}`);
  console.info(`query: ${query}\nkeys: ${keys.join('; ') || 'none'}`);
  const more = (key) =>
    result.more[key] &&
    `  (${result.more[key]} more${detail ? '' : `: pnpm kb ${JSON.stringify(query)} --detail`})`;
  for (const { key, label, line } of sections) {
    if (!result[key]?.length) continue;
    console.info(`\n${label}${more(key) || ''}`);
    for (const item of result[key]) console.info(`  ${line(item)}`);
  }
  if (result.scopes.length) {
    console.info(
      `\nSCOPES${more('scopes') || ''}${detail ? '' : `  (history, plans and candidates: pnpm kb ${JSON.stringify(query)} --detail)`}`
    );
    for (const scope of result.scopes) {
      for (const line of scopeLines(scope, detail)) console.info(`  ${line}`);
    }
  }
  if (result.scopeNote) console.info(`\nSCOPES  ${result.scopeNote}`);
  console.info(
    '\nNOT SEARCHED  plans outside a scope (docs/plans), docs/editor-behavior/current-evidence.md (partial proofs and law-versus-test conflicts per rule), benchmark results, review records and the ../raw evidence layer'
  );
  console.info('\nWRITE BACK');
  for (const [kind, where] of writeBack(result)) {
    console.info(`  ${kind.padEnd(16)} ${where}`);
  }
}

/**
 * A rule with no baseline at the base commit may list only findings the base
 * tree already had, so a first baseline cannot excuse a defect this change
 * adds, even one on an old line whose target the change deleted.
 */
function newRuleViolations(base, baseline) {
  const atBase = spawnSync('git', ['show', `${base}:${BASELINE}`], {
    cwd: root,
    encoding: 'utf-8',
  });
  const bound = atBase.status === 0 ? JSON.parse(atBase.stdout) : {};
  const fresh = RULES.filter((rule) => baseline[rule] && !bound[rule]);
  if (!fresh.length) return [];
  const found = groupFindings(
    findings(loadIndex(commitTree(root, base, indexPatterns)), {
      tracked: trackedPaths(root, base),
    }).filter((item) => fresh.includes(item.rule))
  );
  return differences(
    Object.fromEntries(fresh.map((rule) => [rule, baseline[rule]])),
    found
  ).map((line) => `${line} is not a finding at ${base}`);
}

function check(mode) {
  const base = process.env.PLATE_BASELINE_BASE || 'HEAD';
  if (
    spawnSync('git', ['rev-parse', '--verify', '--quiet', `${base}^{commit}`], {
      cwd: root,
    }).status !== 0
  ) {
    console.error(
      `[kb] Cannot resolve the base commit ${base}. Pass a base this checkout holds.`
    );
    return 1;
  }
  const folded = spawnSync('git', ['show', `${base}:${FOLDED_FILE}`], {
    cwd: root,
    encoding: 'utf-8',
  });
  const found = [
    ...findings(loadIndex(workTree(root))),
    ...foldFindings(workTree(root), {
      base: folded.status === 0 ? folded.stdout : '',
    }),
  ];
  if (mode === 'check') {
    const violations = newRuleViolations(base, readBaseline(BASELINE));
    if (violations.length) {
      console.error(violations.join('\n'));
      console.error(
        `${BASELINE} lists entries for a new rule that the base tree does not have. Fix each one instead of baselining it.`
      );
      return 1;
    }
  }
  const status = enforceBaseline({
    file: BASELINE,
    found: groupFindings(found),
    lowerCommand: 'pnpm kb check --lower',
    mode,
    newFindingsHelp:
      "Fix each new knowledge finding. K0: a store or test file parsed to fewer records than it holds. K1: a rule ID is malformed or defined twice. K4: a test tag names no rule, editor or issue row. K7: a citation into this repository that a fresh checkout cannot open; commit the cited file, cite a tracked path or a <commit>:<path> on origin/next, or narrow the claim. Cite another editor's file as <owner>/<repo>@<commit>:<path> or under ../raw, which K7 leaves to K6. K12: a rule status outside locked, proposed, audit and deviation. K15: a folded file changed, a folded directory gained a file, or folded.tsv lost or changed a row; write new knowledge to the file's home.",
    rules: RULES,
  });
  if (status !== 0) {
    const unlisted = new Set(
      differences(groupFindings(found), readBaseline(BASELINE))
    );
    for (const item of found) {
      if (
        unlisted.has(
          `${item.rule} ${item.file}: ${JSON.stringify(item.identity)}`
        )
      ) {
        console.error(`${item.rule} ${item.file}:${item.line} ${item.message}`);
      }
    }
  }
  return status;
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const words = args.filter((arg) => !arg.startsWith('--'));

if (!words.length) {
  console.error(
    'Usage: pnpm kb <query> [--detail] [--json] | pnpm kb gaps [EDIT- prefix] [--json] | pnpm kb check [--lower | --init] | pnpm kb homes [--manifest <file>] | pnpm kb batch <batch dir> <batch> <source...> | pnpm kb write <change.json> --log <file> --resolved <batches dir> | pnpm kb resolve <batch dir> [--seed <seed>] [--sample <n>] | pnpm kb fold <resolved.json> <path...> | pnpm kb quote <batches dir> --plan <plan> | pnpm kb pins <home>'
  );
  process.exit(2);
}

const option = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};

const need = (ok, usage) => {
  if (!ok) {
    console.error(`Usage: pnpm kb ${usage}`);
    process.exit(2);
  }
};

if (words[0] === 'batch') {
  const [, dir, batch, ...paths] = words;
  need(dir && batch && paths.length, 'batch <batch dir> <batch> <source...>');
  const homesOf = homesFor(workTree(root));
  const sources = paths.map((path) => ({
    path,
    homes: homesOf(path),
    blob: blobOf(readFileSync(join(root, path))),
  }));
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'batch.json'),
    `${JSON.stringify({ batch, sources }, null, 2)}\n`
  );
  console.info(
    `batch ${batch}: ${sources.length} sources recorded at their current blobs`
  );
  process.exit(0);
}

if (words[0] === 'fold') {
  const [, resolvedFile, ...paths] = words;
  need(
    resolvedFile && existsSync(resolvedFile) && paths.length,
    'fold <resolved.json> <path...>'
  );
  const resolved = JSON.parse(readFileSync(resolvedFile, 'utf-8'));
  const table = join(root, FOLDED_FILE);
  const rows = new Map(
    (existsSync(table) ? readFileSync(table, 'utf-8') : '')
      .split('\n')
      .slice(1)
      .filter(Boolean)
      .map((line) => [line.split('\t')[0], line])
  );
  const folds = [];
  for (const path of paths) {
    const sources = resolved.sources.filter((source) =>
      path.endsWith('/') ? source.path.startsWith(path) : source.path === path
    );
    if (!sources.length) {
      console.error(`[kb] ${resolvedFile} records no source at ${path}`);
      process.exit(1);
    }
    for (const source of sources) {
      const file = join(root, source.path);
      const text = readFileSync(file);
      let next;
      try {
        next = foldSource(source.path, text, source.blob, source.homes);
      } catch (error) {
        console.error(`[kb] ${source.path}: ${error.message}`);
        process.exit(1);
      }
      folds.push([file, text, next]);
      rows.set(source.path, `${source.path}\t${blobOf(next)}`);
    }
    if (path.endsWith('/')) rows.set(path, `${path}\t-`);
  }
  for (const [file, text, next] of folds) {
    if (next !== text) writeFileSync(file, next);
  }
  writeFileSync(table, `path\tblob\n${[...rows.values()].join('\n')}\n`);
  process.exit(0);
}

// A batch is named by its resolved file's path under `dir`, not by the
// file's own `batch` field, so two batches never share a name.
const resolvedFiles = (dir) =>
  readdirSync(dir, { recursive: true })
    .map(String)
    .filter((name) => name.endsWith('.resolved.json'))
    .map((name) => ({
      ...JSON.parse(readFileSync(join(dir, name), 'utf-8')),
      batch: name.slice(0, -'.resolved.json'.length),
    }));

const realRoot = realpathSync.native(root);

// realpathSync.native returns the filesystem's own spelling, case included,
// which realpathSync does not, so a case or `./` variant of an existing file
// names the same file.
const canonical = (path) => {
  let probe = resolvePath(root, path);
  const rest = [];
  while (!existsSync(probe)) {
    rest.unshift(basename(probe));
    probe = dirname(probe);
  }
  return relative(realRoot, join(realpathSync.native(probe), ...rest));
};

if (words[0] === 'write') {
  need(
    words[1] && existsSync(words[1]),
    'write <change.json> --log <file> --resolved <batches dir>'
  );
  const change = JSON.parse(readFileSync(words[1], 'utf-8'));
  const log = option('--log');
  if (!log) {
    console.error(
      '[kb] kb write needs --log <file>, the run log each write is recorded in'
    );
    process.exit(2);
  }
  const runDir = option('--resolved');
  if (!runDir) {
    console.error(
      '[kb] kb write needs --resolved <batches dir>, whose resolved batches name the spans it keeps'
    );
    process.exit(2);
  }
  const batches = existsSync(runDir) ? resolvedFiles(runDir) : [];
  if (!batches.length) {
    console.error(
      `[kb] ${runDir} holds no resolved batch; pass the folder kb quote reads`
    );
    process.exit(2);
  }
  for (const named of [change.path, change.to?.home].filter(Boolean)) {
    const own = canonical(named);
    const problem = /^(\.\.|\/)/.test(own)
      ? `${named} is outside the repository`
      : own !== named && `name ${own}, the file's own spelling, not ${named}`;
    if (problem) {
      console.error(`[kb] ${problem}`);
      process.exit(1);
    }
  }
  const again = join(runDir, 'resolutions.json');
  const resolutions = existsSync(again)
    ? JSON.parse(readFileSync(again, 'utf-8'))
    : [];
  // A target in a resolved file or resolutions.json keeps its reader's
  // spelling, so it is compared by the file it names.
  const here = (target) => Boolean(target) && canonical(target) === change.path;
  const kept = [
    ...batches.flatMap(({ batch, units }) =>
      units
        .filter(
          (unit) =>
            here(unit.target) &&
            unit.verdict === 'accepted' &&
            ['covered', 'added'].includes(unit.disposition)
        )
        .map((unit) => ({ key: `${batch}#${unit.key}`, span: unit.span }))
    ),
    ...resolutions
      .filter((item) => item.verdict === 'covered' && here(item.target))
      .map((item) => ({ key: item.unit, span: item.span })),
  ];
  if (change.verdict) {
    const recorded = resolutions.findLast((item) => item.unit === change.unit);
    const matches =
      change.verdict === 'move'
        ? recorded?.verdict === 'covered' &&
          canonical(recorded.target) === change.to?.home &&
          recorded.span === change.to?.span
        : recorded?.verdict === change.verdict && Boolean(recorded.reason);
    if (!matches) {
      console.error(
        `[kb] ${change.unit} has no ${change.verdict} resolution in ${again} that this write carries out`
      );
      process.exit(1);
    }
  }
  const file = join(root, change.path);
  const text = existsSync(file) ? readFileSync(file, 'utf-8') : undefined;
  const stands = (to) => {
    const home = to && join(root, to.home);
    return Boolean(
      home && existsSync(home) && readFileSync(home, 'utf-8').includes(to.span)
    );
  };
  let next;
  try {
    next = write(change.path, text, change, { kept, stands });
  } catch (error) {
    console.error(`[kb] ${error.message}`);
    process.exit(1);
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(`${file}.kb-write`, next);
  renameSync(`${file}.kb-write`, file);
  if (text === undefined) {
    // Intent-to-add puts the new page in the index, which is the tracked set
    // K7 scans and accepts as a citation target.
    spawnSync('git', ['add', '-N', '--', change.path], { cwd: root });
  }
  if (!existsSync(log)) {
    writeFileSync(log, 'time\tkind\tstep\tbatch\tsession\tunit\tfile\n');
  }
  appendFileSync(
    log,
    `${[new Date().toISOString(), change.op, change.step, change.batch, change.session, change.unit ?? '-', change.path].join('\t')}\n`
  );
  process.exit(0);
}

if (words[0] === 'resolve') {
  const dir = words[1];
  need(
    dir && existsSync(join(dir, 'batch.json')),
    'resolve <batch dir> [--seed <seed>] [--sample <n>]'
  );
  const { batch, sources } = JSON.parse(
    readFileSync(join(dir, 'batch.json'), 'utf-8')
  );
  const seed = option('--seed') ?? randomBytes(4).toString('hex');
  const tree = workTree(root);
  let resolved;
  try {
    resolved = resolve({
      batch,
      sources: sources.map((source) => {
        const bytes = readFileSync(join(root, source.path));
        return {
          ...source,
          text: bytes.toString('utf-8'),
          current: blobOf(bytes),
        };
      }),
      units: JSON.parse(readFileSync(join(dir, 'units.json'), 'utf-8')),
      verdicts: readFileSync(join(dir, 'verdicts.tsv'), 'utf-8')
        .split('\n')
        .slice(1)
        .filter(Boolean)
        .map((line) => {
          const [key, verdict, note] = line.split('\t');
          return { key, verdict, note };
        }),
      seed,
      sample: Number(option('--sample') ?? 5),
      has: (path) => tree.has(path),
    });
  } catch (error) {
    console.error(`[kb] ${error.message}`);
    process.exit(1);
  }
  writeFileSync(
    join(dir, `${batch}.resolved.json`),
    `${JSON.stringify(resolved, null, 2)}\n`
  );
  console.info(
    `resolved ${batch}: ${resolved.units.length} units; recall sample (seed ${seed}): ${resolved.sample.join(', ') || 'none'}`
  );
  process.exit(0);
}

if (words[0] === 'quote') {
  const dir = words[1];
  need(dir && existsSync(dir), 'quote <batches dir> --plan <plan>');
  const plan = option('--plan');
  const again = join(dir, 'resolutions.json');
  const read = (path) =>
    existsSync(join(root, path))
      ? readFileSync(join(root, path), 'utf-8')
      : undefined;
  const { counts, lost } = quote({
    resolved: resolvedFiles(dir),
    read,
    resolutions: existsSync(again)
      ? JSON.parse(readFileSync(again, 'utf-8'))
      : [],
    openWork: plan
      ? (readFileSync(plan, 'utf-8').split(/^## Open work$/m)[1] ?? '').split(
          /^## /m
        )[0]
      : '',
  });
  console.info(
    Object.entries(counts)
      .map(([word, n]) => `${n} ${word}`)
      .join(', ') || 'no resolved units'
  );
  for (const item of lost) {
    console.info(`lost ${item.batch} ${item.key}: ${item.why}`);
  }
  process.exit(lost.length ? 1 : 0);
}

if (words[0] === 'pins') {
  need(words[1], 'pins <home>');
  const folder = `docs/research/sources/${words[1]}/`;
  const tree = workTree(root);
  const cited = new Map();
  for (const path of tree
    .list()
    .filter((item) => item.startsWith(folder) && item.endsWith('.md'))) {
    for (const pin of pins(tree.read(path))) {
      const key = `${pin.repo}@${pin.commit}`;
      cited.set(key, (cited.get(key) ?? new Set()).add(path));
    }
  }
  for (const [key, pages] of [...cited].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    console.info(`${key}\t${pages.size} pages`);
  }
  console.info(`${cited.size} revisions cited under ${folder}`);
  process.exit(0);
}

if (words[0] === 'homes') {
  const listing = option('--manifest');
  const manifest =
    listing &&
    new Set(readFileSync(listing, 'utf-8').split('\n').filter(Boolean));
  const tree = workTree(root);
  const found = homeFindings(tree, { manifest });
  console.info(`README set: ${readmeHomes(tree).join(', ')}`);
  for (const item of found) {
    console.info(
      `${item.listed ? 'listed' : 'K14'} ${item.form} ${item.message}`
    );
  }
  const failed = found.filter((item) => !item.listed).length;
  console.info(
    `${failed} K14 findings, ${found.length - failed} listed for Open work`
  );
  process.exit(failed ? 1 : 0);
}

if (words.length === 1 && words[0] === 'check') {
  process.exit(
    check(
      flags.has('--lower') ? 'lower' : flags.has('--init') ? 'init' : 'check'
    )
  );
}

const index = loadIndex(workTree(root));
if (
  words[0] === 'gaps' &&
  (words.length === 1 || (words.length === 2 && words[1].startsWith('EDIT-')))
) {
  const result = gaps(index, words[1]);
  if (flags.has('--json')) console.info(JSON.stringify(result, null, 2));
  else {
    console.info(
      `${result.length} locked rules${words[1] ? ` under ${words[1]}` : ''} have no tagged test that a gate runs.`
    );
    for (const rule of result) {
      console.info(
        `  ${rule.id}  ${clip(rule.title)}  (${rule.file}:${rule.line}) ${rule.reason}`
      );
    }
  }
} else {
  const query = words.join(' ');
  const detail = flags.has('--detail');
  const result = card(index, query, { detail });
  if (flags.has('--json')) {
    console.info(
      JSON.stringify({ ...result, writeBack: writeBack(result) }, null, 2)
    );
  } else printCard(result, query, detail);
}
