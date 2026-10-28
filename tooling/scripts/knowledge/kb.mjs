#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  differences,
  enforceBaseline,
  groupFindings,
  readBaseline,
} from '../finding-baseline.mjs';
import { showAt } from '../private-files.mjs';
import { homeFindings, readmeHomes } from './homes.mjs';
import {
  card,
  commitTree,
  discover,
  findings,
  gaps,
  indexPatterns,
  loadIndex,
  REPOS,
  trackedPaths,
  workTree,
  writeBack,
} from './knowledge.mjs';

const root = fileURLToPath(new URL('../../..', import.meta.url)).replace(
  /\/$/,
  ''
);
const BASELINE = 'tooling/scripts/knowledge/baseline.json';
const RULES = ['K0', 'K1', 'K4', 'K7', 'K12', 'K16', 'K17'];

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

const sinceText = (since) => {
  if (!since) return '';
  return since.missing
    ? `  HEAD lacks ${since.missing} of its commits; fetch and check out a newer commit`
    : `  ${since.after} commits since`;
};

const marked = (mark) =>
  `${mark.lane.padEnd(8)} ${mark.commit?.slice(0, 9) ?? 'no commit recorded'}${mark.cited ? ` (newest of ${mark.cited} cited)` : ''}${sinceText(mark.since)}${mark.source ? `  (${mark.source})` : ''}`;

const sections = [
  {
    key: 'areas',
    label: 'AREAS',
    line: (area) =>
      `${area.area}  ${area.title}  scopes ${area.scopes.join(',') || 'none'}  aliases ${area.aliases.join(',') || 'none'}  (${area.file}:${area.line})`,
  },
  {
    key: 'repoCards',
    label: 'REPO',
    line: (repo) => [
      `${repo.repo}  ${repo.status} ${repo.kind}  areas ${repo.areas.join(',') || 'none'}  added ${repo.added || '?'}  (${repo.file}:${repo.line})`,
      `  ${repo.url}`,
      `  clone ${repo.clone ? `${repo.clone}${repo.cloned ? `  HEAD ${repo.head}` : ', not on disk'}` : 'none'}`,
      ...(repo.homes.length ? [`  homes ${repo.homes.join(', ')}`] : []),
      ...repo.marks.map((mark) => `  ${marked(mark)}`),
      ...(repo.marks.length ? [] : ['  no lane has read it']),
      ...(repo.note ? [`  note ${clip(repo.note, 160)}`] : []),
    ],
  },
  {
    key: 'areaPages',
    label: 'AREA PAGES',
    line: (page) => `${clip(page.title, 100)}  (${page.file})`,
  },
  {
    key: 'areaRepos',
    label: 'AREA REPOS',
    line: (repo) =>
      `${repo.repo}  ${repo.status} ${repo.kind}${repo.clone ? `  ${repo.clone}` : ''}  ${clip(repo.note, 90)}`,
  },
  {
    key: 'sweeps',
    label: 'SWEEP ROWS',
    line: (row) => `${clip(row.cells.join(' | '))}  (${row.file}:${row.line})`,
  },
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
      `${test.tags.length ? test.tags.join(' ') : 'untagged'}  ${clip(test.title ?? '(title is not a literal)')}  (${test.file}:${test.line}; ${runState(test)}; hash ${test.hash})`,
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
      `${
        row.row
          ? clip(Object.values(row.row).filter(Boolean).slice(0, 4).join(' · '))
          : `malformed row: ${clip(row.text)}`
      }  (${row.path}:${row.line})`,
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
    for (const item of result[key]) {
      for (const text of [line(item)].flat()) console.info(`  ${text}`);
    }
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
  if (result.areaMode) {
    console.info(
      '\nTESTS  not searched for an area; add a word, a rule ID or a path to search them'
    );
  }
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
  const atBase = showAt(root, base, BASELINE);
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
  const found = findings(loadIndex(workTree(root)));
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
  const described = new Map();
  for (const item of found) {
    const key = `${item.rule} ${item.file}: ${JSON.stringify(item.identity)}`;
    described.set(key, [
      ...(described.get(key) ?? []),
      `${item.rule} ${item.file}:${item.line} ${item.message}`,
    ]);
  }
  return enforceBaseline({
    describe: (key) => described.get(key)?.join('\n') ?? key,
    file: BASELINE,
    found: groupFindings(found),
    lowerCommand: 'pnpm kb check --lower',
    mode,
    newFindingsHelp:
      "Fix each new knowledge finding. K0: a store or test file parsed to fewer records than it holds. K1: a rule ID is malformed or defined twice. K4: a test tag names no rule, editor or issue row. K7: a citation into this repository that a fresh checkout cannot open; commit the cited file, cite a tracked path or a <commit>:<path> on origin/next, or narrow the claim. Cite another editor's file as <owner>/<repo>@<commit>:<path> or under ../raw, which K7 leaves to K6. K12: a rule status outside locked, proposed, audit and deviation. K16: docs/research/repos.tsv lists a repo twice or gives it a kind outside editor, library and app, a status outside saved and skipped or an area docs/research/areas.tsv lacks; an area names a scope with no review-scope file; or a home README's Repos line names a repo the list lacks. K17: a file added under docs/plite/research, docs/research/probes or docs/research/raw, which are frozen; keep run notes in the ignored docs/plans/artifacts/<slug>/ and findings on the area page.",
    rules: RULES,
  });
}

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const words = args.filter((arg) => !arg.startsWith('--'));

if (!words.length) {
  console.error(
    'Usage: pnpm kb <area | scope | repo | query> [--detail] [--json] | pnpm kb discover <area> [--seed <phrase>]... [--minutes <n>] [--record] | pnpm kb gaps [EDIT- prefix] [--json] | pnpm kb check [--lower | --init] | pnpm kb homes [--manifest <file>]'
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

const searchGitHub = (seed, timeout) => {
  const run = spawnSync(
    'gh',
    [
      'search',
      'repos',
      ...seed.split(/\s+/),
      '--sort',
      'stars',
      '--order',
      'desc',
      '--archived=false',
      '--limit',
      '10',
      '--json',
      'fullName,url,stargazersCount,pushedAt,description',
    ],
    { encoding: 'utf-8', timeout }
  );
  if (run.error?.code === 'ETIMEDOUT') return { error: 'limit' };
  if (run.status !== 0) {
    return {
      error: (
        run.stderr ||
        run.error?.message ||
        `gh exited ${run.status}`
      ).trim(),
    };
  }
  return {
    items: JSON.parse(run.stdout).map((item) => ({
      repo: item.fullName,
      url: item.url,
      stars: item.stargazersCount,
      pushed: item.pushedAt.slice(0, 10),
      description: (item.description ?? '').replace(/\s+/g, ' ').trim(),
    })),
  };
};

const recordSkipped = (repos, area) => {
  const path = join(root, REPOS);
  const [head, ...rows] = readFileSync(path, 'utf-8').trimEnd().split('\n');
  const added = new Date().toISOString().slice(0, 10);
  const kind = (repo) =>
    /editor/i.test(`${repo.repo} ${repo.description}`) ? 'editor' : 'library';
  const lines = [
    ...rows,
    ...repos.map((repo) =>
      [
        repo.repo,
        repo.url,
        '',
        kind(repo),
        'skipped',
        area,
        added,
        clip(`discovery-only: ${repo.description}`, 160),
      ].join('\t')
    ),
  ].sort((a, b) => a.split('\t')[0].localeCompare(b.split('\t')[0]));
  writeFileSync(path, `${[head, ...lines].join('\n')}\n`);
};

if (words[0] === 'discover') {
  const [, token] = args;
  const minutes = Number(option('--minutes') ?? 10);
  need(
    token && !token.startsWith('--') && minutes > 0,
    "discover <area> [--seed '<phrase>']... [--minutes <n>] [--record]"
  );
  const index = loadIndex(workTree(root));
  const result = discover(index, token, {
    limitMs: minutes * 60_000,
    search: searchGitHub,
    seeds: args.flatMap((arg, at) => (arg === '--seed' ? [args[at + 1]] : [])),
  });
  if (!result.area) {
    console.error(
      result.candidates.length
        ? `${token} names the areas ${result.candidates.join(', ')}; pass one of them.`
        : `No area is named ${token}. Areas: ${index.areas.map((area) => area.area).join(', ')}.`
    );
    process.exit(2);
  }
  console.info(
    `${result.area}: searched ${result.searched} of ${result.seeds.length} seeds, ${result.repos.length} repos ${REPOS} lacks`
  );
  for (const repo of result.repos) {
    console.info(
      `  ${repo.repo}  ${repo.stars} stars  pushed ${repo.pushed}  ${clip(repo.description, 100)}  (${repo.seed})`
    );
  }
  if (result.stopped === 'limit') {
    console.info(
      `Stopped at the ${minutes}-minute limit; ${result.seeds.length - result.searched} seeds not searched.`
    );
  } else if (result.stopped) {
    console.error(`Stopped: ${result.stopped}`);
  }
  if (flags.has('--record') && result.repos.length) {
    recordSkipped(result.repos, result.area);
    console.info(
      `Recorded ${result.repos.length} repos as skipped in ${REPOS}; change each one you read to saved.`
    );
  }
  process.exit(result.stopped && result.stopped !== 'limit' ? 1 : 0);
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
