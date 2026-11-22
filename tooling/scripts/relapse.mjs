#!/usr/bin/env node
import { execFile, execFileSync } from 'node:child_process';
import { parseArgs, promisify } from 'node:util';

import { stateOf, waitsOnOwner } from '../../.agents/pstack/status.mjs';
import { gitMerges } from '../../.agents/pstack/tasks.mjs';
import {
  headsOf,
  loadLedger,
  owningScopes,
  plansOf,
} from './review-ledger.mjs';

const DAY = 86_400_000;
const REWORK_DAYS = 28;
const IDLE_DAYS = 7;
// A card needs relapses in both weeks, so a new feature whose fixes settle
// inside one of the two weeks never cards.
const CARD_WEEK = 3;
const CARD_PREVIOUS = 1;
const WORKERS = 6;
const FIX = /^fix(?:\([^)]*\))?!?:/;
const PRODUCT = /^(?:packages\/[^/]+\/src\/|apps\/[^/]+\/src\/)/;
const NOT_PRODUCT =
  /\.(?:test|spec|slow)\.|\/__tests__\/|\/type-tests\/|\/__registry__\/|\/registry\/changelog\//;
const UNOWNED = '(no scope)';

const now = new Date();
const localToday = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  .toISOString()
  .slice(0, 10);
const { values } = parseArgs({
  options: {
    fix: { type: 'string', multiple: true, default: [] },
    ref: { type: 'string', default: 'origin/next' },
    until: { type: 'string', default: localToday },
  },
});
if (!/^\d{4}-\d{2}-\d{2}$/.test(values.until)) {
  throw new Error(
    `--until takes a date such as 2026-11-22, not ${values.until}`
  );
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  encoding: 'utf-8',
}).trim();
const run = promisify(execFile);
const git = async (...args) => {
  const { stdout } = await run('git', ['-C', root, ...args], {
    encoding: 'utf-8',
    maxBuffer: 1 << 28,
  });
  return stdout;
};
const dayBefore = (days) =>
  new Date(Date.parse(values.until) - days * DAY).toISOString().slice(0, 10);
const weekStart = dayBefore(6);
const previousStart = dayBefore(13);

const log = await git(
  'log',
  values.ref,
  '--no-merges',
  `--since-as-filter=${dayBefore(13 + REWORK_DAYS)}T00:00:00`,
  '--date=format-local:%Y-%m-%d',
  '--format=%H%x1f%cd%x1f%s'
);
const commits = new Map(
  log
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [sha, date, subject] = line.split('\u001F');
      return [sha, { sha, date, subject }];
    })
);
const fixes = [...commits.values()].filter(
  (commit) =>
    FIX.test(commit.subject) &&
    commit.date >= previousStart &&
    commit.date <= values.until
);

const isProduct = (path) => PRODUCT.test(path) && !NOT_PRODUCT.test(path);

const changedRanges = (diff) => {
  const ranges = new Map();
  let product = false;
  let path = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      product ||= isProduct(line.slice(4).replace(/^b\//, ''));
      continue;
    }
    if (line.startsWith('--- ')) {
      const old = line.slice(4).replace(/^a\//, '');
      path = isProduct(old) ? old : null;
      product ||= Boolean(path);
      continue;
    }
    const hunk = path && /^@@ -(\d+)(?:,(\d+))? /.exec(line);
    if (!hunk) continue;
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
    if (!count) continue;
    if (!ranges.has(path)) ranges.set(path, []);
    ranges.get(path).push('-L', `${hunk[1]},+${count}`);
  }
  return { product, ranges };
};

async function reworkOf(fix) {
  const parent = `${fix.sha}^`;
  const diff = await git(
    'diff',
    '-U0',
    '--no-color',
    '--no-ext-diff',
    parent,
    fix.sha
  );
  const { product, ranges } = changedRanges(diff);
  const reworked = new Map();
  for (const [path, lines] of ranges) {
    const blame = await git(
      'blame',
      '--porcelain',
      '-w',
      ...lines,
      parent,
      '--',
      path
    );
    for (const [, sha] of blame.matchAll(/^([0-9a-f]{40}) \d+ \d+ \d+$/gm)) {
      const earlier = commits.get(sha);
      if (
        earlier &&
        FIX.test(earlier.subject) &&
        Date.parse(fix.date) - Date.parse(earlier.date) <= REWORK_DAYS * DAY
      ) {
        if (!reworked.has(sha)) reworked.set(sha, new Set());
        reworked.get(sha).add(path);
      }
    }
  }
  return { product, reworked };
}

const ledger = loadLedger(root);
const ownersOf = (reworked) => {
  const owned = new Map();
  for (const path of new Set(
    [...reworked.values()].flatMap((set) => [...set])
  )) {
    for (const id of owningScopes(ledger, path)) {
      if (!owned.has(id)) owned.set(id, []);
      owned.get(id).push(path);
    }
  }
  return owned;
};

const given = values.fix.map((rev) =>
  execFileSync(
    'git',
    ['-C', root, 'rev-parse', '--verify', `${rev}^{commit}`],
    { encoding: 'utf-8' }
  ).trim()
);
const chosen = fixes.filter((fix) => given.includes(fix.sha));
const ignored = given.filter((sha) => !chosen.some((fix) => fix.sha === sha));
let targets = null;
let scanned = fixes;
if (given.length) {
  targets = new Set();
  for (const fix of chosen) {
    const { reworked } = await reworkOf(fix);
    for (const id of ownersOf(reworked).keys()) targets.add(id);
  }
  const names = await git(
    'log',
    values.ref,
    '--no-merges',
    `--since-as-filter=${previousStart}T00:00:00`,
    '--format=%x1e%H',
    '--name-only'
  );
  const touched = new Map(
    names
      .split('\u001E')
      .slice(1)
      .map((entry) => {
        const [sha, ...paths] = entry.split('\n').filter(Boolean);
        return [sha, paths];
      })
  );
  scanned = fixes.filter((fix) =>
    (touched.get(fix.sha) ?? []).some(
      (path) =>
        isProduct(path) &&
        owningScopes(ledger, path).some((id) => targets.has(id))
    )
  );
}

const queue = [...scanned];
const productFixes = [];
const relapses = [];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    for (let fix = queue.shift(); fix; fix = queue.shift()) {
      const { product, reworked } = await reworkOf(fix);
      if (product) productFixes.push(fix);
      if (reworked.size) relapses.push({ ...fix, reworked });
    }
  })
);
relapses.sort(
  (a, b) => b.date.localeCompare(a.date) || a.sha.localeCompare(b.sha)
);

const plans = plansOf(root, ledger);
const { activeAt } = gitMerges();
const isIdle = (plan) => {
  const at = activeAt(plan.path);
  return (
    at !== null &&
    Date.now() - at > IDLE_DAYS * DAY &&
    !waitsOnOwner(plan.status)
  );
};
const scopes = new Map();
for (const relapse of relapses) {
  const owned = ownersOf(relapse.reworked);
  for (const [id, paths] of owned.size ? owned : [[UNOWNED, []]]) {
    if (!scopes.has(id)) scopes.set(id, []);
    scopes.get(id).push({ ...relapse, paths });
  }
}

const rows = [...scopes]
  .filter(([id]) => !targets || targets.has(id))
  .map(([id, list]) => {
    const head = headsOf(ledger, id)
      .filter((review) => review.verdict)
      .sort((a, b) => a.date.localeCompare(b.date))
      .at(-1);
    const counted = head
      ? list.filter((relapse) => relapse.date > head.date)
      : list;
    const week = counted.filter((relapse) => relapse.date >= weekStart);
    const previous = counted.filter((relapse) => relapse.date < weekStart);
    const open = plans.filter(
      (plan) =>
        plan.scopes.includes(id) &&
        ['active', 'held'].includes(stateOf(plan.status))
    );
    const active = open
      .filter((plan) => !isIdle(plan))
      .map((plan) => plan.path);
    const idle = open.filter(isIdle).map((plan) => plan.path);
    const due =
      id !== UNOWNED &&
      week.length >= CARD_WEEK &&
      previous.length >= CARD_PREVIOUS;
    return {
      id,
      week,
      previous,
      since: head ? `${head.date} ${head.verdict}` : '-',
      call: !due
        ? 'watch'
        : active.length
          ? `plan ${active.join(', ')}`
          : 'card',
      idle,
      question: ledger.scopes.get(id)?.question ?? '',
    };
  });
rows.sort(
  (a, b) =>
    b.week.length - a.week.length ||
    b.previous.length - a.previous.length ||
    a.id.localeCompare(b.id)
);

const short = (sha) => sha.slice(0, 10);
const count = (list, week) =>
  list.filter((item) => item.date >= weekStart === week).length;
const shown = chosen.map((fix) => short(fix.sha)).join(', ');
const out = [
  ...[
    `Relapses on ${values.ref}: fixes from ${previousStart} to ${values.until} that rework product lines a fix from the ${REWORK_DAYS} days before wrote, counted after each scope's newest verdict.`,
    !targets
      ? `Week ${weekStart}..${values.until}: ${count(relapses, true)} of ${count(productFixes, true)} product fixes relapse. Week before: ${count(relapses, false)} of ${count(productFixes, false)}.`
      : targets.size
        ? `The relapses of --fix ${shown} fall in ${[...targets].join(', ')}, and the rows count every fix in those scopes.`
        : chosen.length
          ? `No relapse for --fix ${shown}: none reworks a recent fix in a review scope.`
          : '',
    ignored.length
      ? `Counted nowhere, because none is a fix from ${previousStart} to ${values.until}: ${ignored.map(short).join(', ')}.`
      : '',
    `A scope cards with ${CARD_WEEK} or more relapses this week and ${CARD_PREVIOUS} or more the week before.`,
  ].filter(Boolean),
  '',
  ['scope', 'week', 'before', 'since', 'call'].join('\t'),
  ...rows
    .filter((row) => row.week.length + row.previous.length)
    .map((row) =>
      [row.id, row.week.length, row.previous.length, row.since, row.call].join(
        '\t'
      )
    ),
];
for (const row of rows.filter((item) => item.call !== 'watch')) {
  const relapsing = [...row.week, ...row.previous];
  const owned = [
    ...new Set(relapsing.flatMap((relapse) => relapse.paths)),
  ].sort((a, b) => a.localeCompare(b));
  out.push(
    '',
    `== ${row.call.split(' ')[0]} ${row.id}: ${row.question}`,
    `writes: ${[`docs/plans/topics/${row.id}.md`, ...row.idle, ...owned].join(', ')}`
  );
  if (row.idle.length) {
    out.push(
      `idle: ${row.idle.join(', ')} had no commit or decision log row for ${IDLE_DAYS} days`
    );
  }
  for (const relapse of relapsing) {
    out.push(`${relapse.date} ${short(relapse.sha)} ${relapse.subject}`);
    for (const [sha, paths] of relapse.reworked) {
      const earlier = commits.get(sha);
      out.push(
        `  reworks ${earlier.date} ${short(sha)} ${earlier.subject} in ${[...paths].join(', ')}`
      );
    }
  }
}
console.log(out.join('\n'));
