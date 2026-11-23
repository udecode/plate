#!/usr/bin/env node
import { execFile, execFileSync } from 'node:child_process';
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs, promisify } from 'node:util';

import { stateOf, waitsOnOwner } from '../../.agents/pstack/status.mjs';
import { gitMerges } from '../../.agents/pstack/tasks.mjs';
import { adoptionOf, headsOf, loadLedger, plansOf } from './review-ledger.mjs';

const DAY = 86_400_000;
const RECENT_DAYS = 14;
const IDLE_DAYS = 7;
const SHARED_RELAPSES = 2;
const WORKERS = 6;
// Follow-ups that settle one bad fix rework only that fix, so a card needs
// relapses that rework at least two different earlier fixes.
const CARD_RELAPSES = 3;
const CARD_REWORKED_FIXES = 2;
const FIX = /^fix(?:\([^)]*\))?!?:/;
const PRODUCT = /^(?:packages\/[^/]+\/src\/|apps\/[^/]+\/src\/)/;
const NOT_PRODUCT =
  /\.(?:test|spec|slow)\.|\/__tests__\/|\/type-tests\/|\/__registry__\/|\/registry\/changelog\/|\/examples\/|\/generated\//;
const BLANK_OR_IMPORT_LINE =
  /^\s*(?:$|import\b(?!\s*\()|export\b[^=(]*\bfrom\s*['"]|\}\s*from\s*['"])/;
const CACHE_KEY = [FIX, PRODUCT, NOT_PRODUCT, BLANK_OR_IMPORT_LINE]
  .map((re) => re.source)
  .join(' ');

const now = new Date();
const { values } = parseArgs({
  options: {
    fix: { type: 'string', multiple: true, default: [] },
    ref: { type: 'string', default: 'origin/next' },
    until: {
      type: 'string',
      default: new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 10),
    },
  },
});
if (!/^\d{4}-\d{2}-\d{2}$/.test(values.until)) {
  throw new Error(
    `--until takes a date such as 2026-11-22, not ${values.until}`
  );
}

const gitSync = (...args) =>
  execFileSync('git', args, { encoding: 'utf-8' }).trim();
const root = gitSync('rev-parse', '--show-toplevel');
const cachePath = path.join(
  gitSync(
    '-C',
    root,
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir'
  ),
  'relapse-cache.json'
);
const run = promisify(execFile);
const git = async (...args) => {
  const { stdout } = await run('git', ['-C', root, ...args], {
    encoding: 'utf-8',
    maxBuffer: 1 << 28,
  });
  return stdout;
};
const recentStart = new Date(Date.parse(values.until) - (RECENT_DAYS - 1) * DAY)
  .toISOString()
  .slice(0, 10);

const log = await git(
  'log',
  values.ref,
  '--no-merges',
  '--date=format-local:%Y-%m-%d',
  '--format=%x1e%H%x1f%cd%x1f%s%x1f%B'
);
const commits = new Map();
const landedOn = new Map();
for (const record of log.split('\u001E').filter(Boolean)) {
  const [sha, date, subject, body] = record.split('\u001F');
  commits.set(sha, { sha, date, subject });
  for (const [, plan] of body.matchAll(/^Plan: (\S+)\s*$/gmu)) {
    if (date <= values.until && !landedOn.has(plan)) landedOn.set(plan, date);
  }
}
const fixLog = await git(
  'log',
  values.ref,
  '--no-merges',
  '--grep=^fix',
  '--format=%x1e%H',
  '--name-only'
);
const touched = new Map(
  fixLog
    .split('\u001E')
    .slice(1)
    .map((entry) => {
      const [sha, ...paths] = entry.split('\n').filter(Boolean);
      return [sha, paths];
    })
);
const fixes = [...commits.values()].filter(
  (commit) => FIX.test(commit.subject) && commit.date <= values.until
);

const isProduct = (file) => PRODUCT.test(file) && !NOT_PRODUCT.test(file);

const changedRanges = (diff) => {
  const ranges = new Map();
  let product = false;
  let file = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      product ||= isProduct(line.slice(4).replace(/^b\//, ''));
      continue;
    }
    if (line.startsWith('--- ')) {
      const old = line.slice(4).replace(/^a\//, '');
      file = isProduct(old) ? old : null;
      product ||= Boolean(file);
      continue;
    }
    const hunk = file && /^@@ -(\d+)(?:,(\d+))? /.exec(line);
    if (!hunk) continue;
    const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
    if (!count) continue;
    if (!ranges.has(file)) ranges.set(file, []);
    ranges.get(file).push('-L', `${hunk[1]},+${count}`);
  }
  return { product, ranges };
};

const stored = existsSync(cachePath)
  ? JSON.parse(readFileSync(cachePath, 'utf-8'))
  : null;
const cache = stored?.key === CACHE_KEY ? stored.fixes : {};
let cacheChanged = false;

async function reworkOf(fix) {
  if (!cache[fix.sha]) {
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
    const reworked = {};
    for (const [file, lines] of ranges) {
      const blame = await git(
        'blame',
        '--porcelain',
        '-w',
        ...lines,
        parent,
        '--',
        file
      );
      for (const [, sha, text] of blame.matchAll(
        /^([0-9a-f]{40}) \d+ \d+(?: \d+)?\n(?:[^\t\n][^\n]*\n)*\t([^\n]*)$/gm
      )) {
        if (BLANK_OR_IMPORT_LINE.test(text)) continue;
        if (!FIX.test(commits.get(sha)?.subject ?? '')) continue;
        reworked[sha] ??= [];
        if (!reworked[sha].includes(file)) reworked[sha].push(file);
      }
    }
    cache[fix.sha] = { product, reworked };
    cacheChanged = true;
  }
  const { product, reworked } = cache[fix.sha];
  return { product, reworked: new Map(Object.entries(reworked)) };
}

const ledger = loadLedger(root);
const plans = plansOf(root, ledger);
const { activeAt } = gitMerges();
const closestScopes = (file) => {
  const parts = file.split('/');
  for (let depth = parts.length; depth > 0; depth--) {
    const entry =
      depth === parts.length ? file : `${parts.slice(0, depth).join('/')}/`;
    const ids = ledger.membership.get(entry);
    if (ids?.size) return [...ids];
  }
  return [];
};
const ownersOf = (files) => {
  const owned = new Map();
  for (const file of new Set(files)) {
    for (const id of closestScopes(file)) {
      if (!owned.has(id)) owned.set(id, []);
      owned.get(id).push(file);
    }
  }
  return owned;
};

const starts = new Map();
const startOf = (id) => {
  if (starts.has(id)) return starts.get(id);
  const head = headsOf(ledger, id)
    .filter((review) => review.verdict && review.date <= values.until)
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1);
  let start = head
    ? { date: head.date, label: `${head.date} ${head.verdict}` }
    : { date: '', label: '-' };
  const landed =
    head?.verdict === 'pursue' &&
    adoptionOf(ledger, head, plans) &&
    plans
      .filter(
        (plan) =>
          plan.landed &&
          plan.scopes.includes(id) &&
          (plan.path === head.path || plan.reviewBasis.includes(head.id))
      )
      .filter((plan) => landedOn.has(plan.path))
      .map((plan) => ({ path: plan.path, date: landedOn.get(plan.path) }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .at(-1);
  if (landed && landed.date > start.date) {
    start = {
      date: landed.date,
      label: `${landed.date} landed`,
      plan: landed.path,
    };
  }
  starts.set(id, start);
  return start;
};

const given = values.fix.map((rev) =>
  gitSync('-C', root, 'rev-parse', '--verify', `${rev}^{commit}`)
);
const chosen = fixes.filter((fix) => given.includes(fix.sha));
const ignored = given.filter((sha) => !chosen.some((fix) => fix.sha === sha));
const counts = (fix, id) => fix.date > startOf(id).date;
let targets = null;
if (given.length) {
  targets = new Set();
  for (const fix of chosen) {
    const { reworked } = await reworkOf(fix);
    for (const id of ownersOf([...reworked.values()].flat()).keys()) {
      if (counts(fix, id)) targets.add(id);
    }
  }
}
const scanned = fixes.filter(
  (fix) =>
    (!targets && fix.date >= recentStart) ||
    [...ownersOf((touched.get(fix.sha) ?? []).filter(isProduct)).keys()].some(
      (id) => counts(fix, id) && (!targets || targets.has(id))
    )
);

const queue = [...scanned];
const recentFixes = [];
const relapses = [];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    for (let fix = queue.shift(); fix; fix = queue.shift()) {
      const { product, reworked } = await reworkOf(fix);
      if (product && fix.date >= recentStart) recentFixes.push(fix);
      if (reworked.size) relapses.push({ ...fix, reworked });
    }
  })
);
if (cacheChanged) {
  const temporary = `${cachePath}.${process.pid}`;
  writeFileSync(temporary, JSON.stringify({ key: CACHE_KEY, fixes: cache }));
  renameSync(temporary, cachePath);
}
relapses.sort(
  (a, b) => b.date.localeCompare(a.date) || a.sha.localeCompare(b.sha)
);

const end = Date.parse(values.until) + DAY;
const isIdle = (plan) => {
  const at = activeAt(plan.path);
  return (
    at !== null && end - at > IDLE_DAYS * DAY && !waitsOnOwner(plan.status)
  );
};
const scopes = new Map();
for (const relapse of relapses) {
  for (const [id, files] of ownersOf([...relapse.reworked.values()].flat())) {
    if (!counts(relapse, id) || (targets && !targets.has(id))) continue;
    if (!scopes.has(id)) scopes.set(id, []);
    scopes.get(id).push({ ...relapse, files });
  }
}

const rows = [...scopes].map(([id, list]) => {
  const recent = list.filter((relapse) => relapse.date >= recentStart);
  const reworked = new Set(
    list.flatMap((relapse) =>
      [...relapse.reworked]
        .filter(([, files]) =>
          files.some((file) => relapse.files.includes(file))
        )
        .map(([sha]) => sha)
    )
  );
  const open = plans.filter(
    (plan) =>
      plan.scopes.includes(id) &&
      ['active', 'held'].includes(stateOf(plan.status))
  );
  const active = open.filter((plan) => !isIdle(plan)).map((plan) => plan.path);
  const due =
    list.length >= CARD_RELAPSES &&
    reworked.size >= CARD_REWORKED_FIXES &&
    recent.length > 0;
  return {
    id,
    list,
    recent,
    start: startOf(id),
    call: !due ? 'watch' : active.length ? `plan ${active.join(', ')}` : 'card',
    idle: open.filter(isIdle).map((plan) => plan.path),
    question: ledger.scopes.get(id)?.question ?? '',
  };
});
rows.sort(
  (a, b) =>
    b.recent.length - a.recent.length ||
    b.list.length - a.list.length ||
    a.id.localeCompare(b.id)
);

const short = (sha) => sha.slice(0, 10);
const shown = chosen.map((fix) => short(fix.sha)).join(', ');
const recentRelapses = relapses.filter(
  (relapse) => relapse.date >= recentStart
).length;
const out = [
  ...[
    `Relapses on ${values.ref} up to ${values.until}: fixes that rework product lines an earlier fix wrote, counted in each scope after its newest verdict, or after the landing of the plan that verdict pursued.`,
    !targets
      ? `From ${recentStart}: ${recentRelapses} of ${recentFixes.length} product fixes relapse.`
      : targets.size
        ? `The relapses of --fix ${shown} fall in ${[...targets].join(', ')}, and the rows count every fix in those scopes.`
        : chosen.length
          ? `No relapse for --fix ${shown}: none reworks an earlier fix in a review scope after that scope's newest verdict.`
          : '',
    ignored.length
      ? `Counted nowhere, because none is a fix up to ${values.until}: ${ignored.map(short).join(', ')}.`
      : '',
    `A scope cards when ${CARD_RELAPSES} or more of its relapses since that start rework ${CARD_REWORKED_FIXES} or more different fixes, one or more of those relapses landed from ${recentStart} on, and no active or held plan covers the scope. The rows list each scope with a relapse from ${recentStart} on.`,
  ].filter(Boolean),
  '',
  ['scope', 'recent', 'total', 'since', 'call'].join('\t'),
  ...rows
    .filter((row) => row.recent.length)
    .map((row) =>
      [
        row.id,
        row.recent.length,
        row.list.length,
        row.start.label,
        row.call,
      ].join('\t')
    ),
];
const cards = rows.filter((row) => row.call === 'card');
for (const row of rows.filter((item) => item.call !== 'watch')) {
  const owned = [...new Set(row.list.flatMap((relapse) => relapse.files))].sort(
    (a, b) => a.localeCompare(b)
  );
  const mine = new Set(row.list.map((relapse) => relapse.sha));
  const shared =
    row.call === 'card' &&
    cards
      .slice(0, cards.indexOf(row))
      .map((other) => ({
        id: other.id,
        count: other.list.filter((relapse) => mine.has(relapse.sha)).length,
      }))
      .find((other) => other.count >= SHARED_RELAPSES);
  out.push(
    '',
    `== ${row.call.split(' ')[0]} ${row.id}: ${row.question}`,
    `writes: ${[`docs/plans/topics/${row.id}.md`, ...row.idle, ...owned].join(', ')}`
  );
  if (row.start.plan) {
    out.push(
      `landed: ${row.start.plan} on ${row.start.date}, so only later fixes count`
    );
  }
  if (row.idle.length) {
    out.push(
      `idle: ${row.idle.join(', ')} had no commit or decision log row for ${IDLE_DAYS} days`
    );
  }
  if (shared) {
    out.push(
      `shares: ${shared.id} counts ${shared.count} of these relapses too, so this card waits on ${shared.id}'s verdict`
    );
  }
  for (const relapse of row.list) {
    out.push(`${relapse.date} ${short(relapse.sha)} ${relapse.subject}`);
    for (const [sha, files] of relapse.reworked) {
      const earlier = commits.get(sha);
      out.push(
        `  reworks ${earlier.date} ${short(sha)} ${earlier.subject} in ${files.join(', ')}`
      );
    }
  }
}
console.log(out.join('\n'));
