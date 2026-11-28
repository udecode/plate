// Local CI keeps its state and events in the clone's git common directory, so
// every worktree of the clone, the beta release job's included, reads one copy.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { failureFile } from './step-failures.mjs';

export const FULL_RUN_HOUR = 4;

const MD_ONLY_DIRS = ['docs/plans/', 'docs/research/', 'docs/editor-behavior/'];
const NON_SKIP_MD_DIRS = [
  'content/docs/',
  '.agents/',
  '.claude/',
  '.changeset/',
  'apps/',
  'packages/',
  'tooling/',
  'docs/plite/',
];
const AFFECTED_ONLY_DIRS = [
  '.agents/',
  '.claude/skills/',
  'content/docs/',
  'docs/plite/',
];

const isMdOnlyFile = (file) =>
  MD_ONLY_DIRS.some((dir) => file.startsWith(dir)) ||
  file.endsWith('.decisions.tsv') ||
  (file.endsWith('.md') &&
    file !== 'AGENTS.md' &&
    !NON_SKIP_MD_DIRS.some((dir) => file.startsWith(dir)));

const isAffectedOnlyFile = (file) =>
  isMdOnlyFile(file) ||
  file === 'AGENTS.md' ||
  AFFECTED_ONLY_DIRS.some((dir) => file.startsWith(dir));

export const classifyLocalCiChanges = (files) => {
  if (files.every(isMdOnlyFile)) return 'md-only';
  if (files.every(isAffectedOnlyFile)) return 'affected';
  return 'deep';
};

export const localCiFiles = (gitCommonDir) => {
  const home = join(gitCommonDir, 'plate-local-ci');
  return {
    home,
    state: join(home, 'state.json'),
    events: join(home, 'events.jsonl'),
  };
};

export const readLocalCiState = (gitCommonDir) => {
  const { state } = localCiFiles(gitCommonDir);
  return existsSync(state) ? JSON.parse(readFileSync(state, 'utf-8')) : {};
};

export const readLocalCiEvents = (gitCommonDir) => {
  const { events } = localCiFiles(gitCommonDir);
  return existsSync(events)
    ? readFileSync(events, 'utf-8')
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
    : [];
};

export const appendLocalCiEvent = (gitCommonDir, event) => {
  const { home, events } = localCiFiles(gitCommonDir);
  mkdirSync(home, { recursive: true });
  const line = { at: new Date().toISOString(), ...event };
  appendFileSync(events, `${JSON.stringify(line)}\n`);
  return line;
};

const RUN_KINDS = new Set(['red', 'flake', 'passed', 'green', 'broken']);
export const isRunEvent = (event) => RUN_KINDS.has(event.kind);

export const startsBrokenStreak = (events) =>
  events.findLast(isRunEvent)?.kind !== 'broken';

export const localCiRedSince = (
  redStart,
  taskRowTimes = [],
  now = Date.now()
) => ({
  redSince: new Date(Math.min(now, redStart, ...taskRowTimes)).toISOString(),
});

const whereFailed = (event) =>
  event.kind === 'flake'
    ? `once and passing its rerun${event.loaded ? ' under load' : ''}`
    : event.culprit
      ? `since ${event.culprit.slice(0, 10)} (${event.subject})${event.author ? ` by ${event.author}` : ''}`
      : event.range?.startsWith('..')
        ? `since ${event.range.slice(2, 12)} or earlier`
        : `somewhere in ${event.range}`;

export const localCiTaskFinding = (event, eventsPath) => {
  const results = event.results
    ? ` Failed tests' results: ${event.results}.`
    : '';
  if (event.kind === 'flake') {
    return `Local CI found ${event.step} failing on next ${whereFailed(event)}, so a test it names depends on timing or host load. Log: ${event.log}.${results} The newest flake event in ${eventsPath} names its failures. A passing pnpm check ${event.step} does not clear it: remove that dependence, such as a wall-clock bound, a raised timeout or a fixed wait, prove each failing test with five warm runs without retries and land through land.mjs. Follow operator's 3-step green-convergence loop (escalate once to Neon @xhigh if a first fix attempt fails; never freeze on a P0 decide chip).`;
  }
  return `Local CI found ${event.step} failing on next ${whereFailed(event)}. Log: ${event.log}.${results} The newest ${event.kind} event in ${eventsPath} names the commits. Follow operator's 3-step green-convergence loop: on a big red (3 or more failures with a bisected culprit), try a clean code-only revert via land.mjs and wake event.session; on a small red, unknown culprit, or tangled revert, wake the live culprit session or fix forward and land through land.mjs; if a first fix attempt leaves ${event.step} red, escalate once to Neon @xhigh instead of freezing on a P0 decide chip.`;
};

export const searchFirstBad = (commits, fails, deadline) => {
  if (Date.now() < deadline && fails(commits[0])) {
    return { failsAtStart: commits[0] };
  }
  let good = 0;
  let bad = commits.length - 1;
  while (bad - good > 1 && Date.now() < deadline) {
    const mid = Math.floor((good + bad) / 2);
    if (fails(commits[mid])) bad = mid;
    else good = mid;
  }
  return bad - good === 1
    ? { culprit: commits[bad] }
    : { range: `${commits[good]}..${commits[bad]}` };
};

const OUTCOMES = ['fixed', 'chip', 'dropped'];
const FIXED_BY = ['fix', 'same', 'commit'];
const MAX_FAILURES = 2;

const lineOf = (ref) => {
  const match =
    typeof ref === 'string' ? ref.match(/^(.+)-(0|[1-9]\d*)$/u) : null;
  return match ? { id: match[1], n: Number(match[2]) } : null;
};
const opensItem = (verdict) =>
  verdict.outcome === 'fixed' && verdict.commit === undefined;
const filled = (value) => typeof value === 'string' && value.trim() !== '';

export const frictionQueue = (events) => {
  const reports = new Map();
  const judged = new Set();
  const items = new Map();
  const history = [];
  for (const event of events) {
    if (event.kind === 'friction' && !reports.has(event.id)) {
      reports.set(event.id, event);
    } else if (event.kind === 'friction-judged') {
      for (const verdict of event.verdicts) {
        const { id, n } = lineOf(verdict.line);
        const report = reports.get(id);
        judged.add(id);
        const entry = {
          at: event.at,
          from: report?.from,
          text: report?.lines[n],
          ...verdict,
        };
        history.push(entry);
        if (opensItem(verdict)) {
          items.set(verdict.line, {
            entry,
            failures: 0,
            fix: verdict.fix ?? items.get(verdict.same)?.fix,
            running: false,
          });
        }
      }
    } else if (event.kind?.startsWith('friction-') && items.has(event.item)) {
      const item = items.get(event.item);
      item.running = event.kind === 'friction-start';
      if (event.kind === 'friction-failed') item.failures += 1;
      if (event.kind === 'friction-done') {
        item.closed = event.commit
          ? { commit: event.commit }
          : { task: event.task };
      }
    }
  }
  for (const item of items.values()) {
    const target = items.get(item.entry.same);
    if (!item.closed && target?.closed?.task) {
      item.closed = { task: target.closed.task };
    }
    if (item.closed) Object.assign(item.entry, item.closed);
    item.state = item.closed
      ? 'closed'
      : target && !target.closed
        ? 'waiting'
        : item.failures >= MAX_FAILURES
          ? 'stuck'
          : 'open';
  }
  const inState = (state) =>
    [...items.values()]
      .filter((item) => item.state === state)
      .map((item) => ({
        ...(item.entry.same === undefined
          ? {}
          : {
              after: items.get(item.entry.same).closed?.commit,
              same: item.entry.same,
            }),
        failures: item.failures,
        fix: item.fix,
        from: item.entry.from,
        id: item.entry.line,
        line: item.entry.text,
        running: item.running,
      }));
  return {
    history,
    open: inState('open'),
    stuck: inState('stuck'),
    unjudged: [...reports.values()].filter((report) => !judged.has(report.id)),
    waiting: inState('waiting'),
  };
};

const outcomeError = (verdict, items) => {
  if (!OUTCOMES.includes(verdict.outcome)) {
    return `the outcome is ${OUTCOMES.join(', ')}`;
  }
  if (verdict.outcome === 'chip') {
    return filled(verdict.task) ? null : 'a chip names its task';
  }
  if (verdict.outcome === 'dropped') {
    return filled(verdict.reason) ? null : 'a dropped line names its reason';
  }
  const given = FIXED_BY.filter((key) => verdict[key] !== undefined);
  if (given.length !== 1 || !filled(verdict[given[0]])) {
    return 'a fixed line names exactly one of fix, same or commit';
  }
  return given[0] === 'same' && !items.has(verdict.same)
    ? `same names ${verdict.same}, which opened no fix item`
    : null;
};

export const verdictsError = (events, verdicts) => {
  if (!Array.isArray(verdicts) || verdicts.length === 0) {
    return 'verdicts holds no verdict';
  }
  const queue = frictionQueue(events);
  const waiting = new Map(queue.unjudged.map((report) => [report.id, report]));
  const items = new Set(
    queue.history.filter(opensItem).map((entry) => entry.line)
  );
  const seen = new Set();
  for (const verdict of verdicts) {
    const ref = lineOf(verdict?.line);
    const report = ref && waiting.get(ref.id);
    if (!report || ref.n >= report.lines.length) {
      return `${verdict?.line} is no line of an unjudged friction report`;
    }
    if (seen.has(verdict.line)) return `${verdict.line} has two outcomes`;
    seen.add(verdict.line);
    const error = outcomeError(verdict, items);
    if (error) return `${verdict.line}: ${error}`;
    if (opensItem(verdict)) items.add(verdict.line);
  }
  for (const id of new Set([...seen].map((ref) => lineOf(ref).id))) {
    const missing = waiting
      .get(id)
      .lines.findIndex((_, n) => !seen.has(`${id}-${n}`));
    if (missing !== -1) return `${id}-${missing} has no outcome`;
  }
  return null;
};

const reportError = (report) =>
  !filled(report?.id) || !filled(report?.from)
    ? 'a report names its id and from'
    : !Array.isArray(report.lines) ||
        report.lines.length === 0 ||
        !report.lines.every(filled)
      ? 'a report holds one or more lines'
      : null;

const FRICTION_USAGE = `Usage: node tooling/scripts/local-ci.mjs friction <command>
  add      queue one zbot session's report, read as JSON from stdin:
           {"id": "<report id>", "from": "<where>", "lines": ["<what | fix>"]}
           a report id already queued adds nothing
  list     print the queue as JSON: unjudged reports, open, waiting and
           stuck fix items, and every verdict
  next     print the first open fix item and how many reports and stuck
           items wait for the judge
  judged   record the verdicts JSON read from stdin
  start    --item <id>   a fix agent starts on an open item
  failed   --item <id>   the fix agent ended and left its item open
  done     --item <id> (--commit <sha> | --task <id>)   close the item`;

const FLAGS = {
  done: { need: ['--item'], one: ['--commit', '--task'] },
  failed: { need: ['--item'] },
  start: { need: ['--item'] },
};

const readFlags = (args, { need = [], one = [] }) => {
  const values = {};
  for (let at = 0; at < args.length; at += 2) {
    const [name, value] = [args[at], args[at + 1]];
    if (![...need, ...one].includes(name) || name in values) return null;
    if (!value?.trim() || value.startsWith('--')) return null;
    values[name] = value.trim();
  }
  return need.every((name) => name in values) ? values : null;
};

const readStdin = (input) => {
  try {
    return { value: JSON.parse(input()) };
  } catch (error) {
    return { error: `stdin is not JSON: ${error.message}` };
  }
};

export const frictionCommand = (gitCommonDir, [command, ...args], input) => {
  const refuse = (why) => {
    console.error(
      why ? `[local-ci] friction ${command}: ${why}` : FRICTION_USAGE
    );
    return 1;
  };
  if (command === 'add' || command === 'judged') {
    if (args.length > 0) return refuse();
    const { error, value } = readStdin(input);
    if (error) return refuse(error);
    const events = readLocalCiEvents(gitCommonDir);
    if (command === 'judged') {
      const why = verdictsError(events, value?.verdicts);
      if (why) return refuse(why);
      appendLocalCiEvent(gitCommonDir, {
        kind: 'friction-judged',
        verdicts: value.verdicts,
      });
      console.info(
        `[local-ci] friction judged ${value.verdicts.length} line(s)`
      );
      return 0;
    }
    const why = reportError(value);
    if (why) return refuse(why);
    const id = value.id.trim();
    if (events.some((event) => event.kind === 'friction' && event.id === id)) {
      console.info(`[local-ci] friction ${id} is already queued`);
      return 0;
    }
    appendLocalCiEvent(gitCommonDir, {
      from: value.from.trim(),
      id,
      kind: 'friction',
      lines: value.lines.map((line) => line.trim()),
      wake: true,
    });
    console.info(`[local-ci] friction ${id}: ${value.lines.length} line(s)`);
    return 0;
  }
  const queue = frictionQueue(readLocalCiEvents(gitCommonDir));
  if (command === 'list' || command === 'next') {
    if (args.length > 0) return refuse();
    console.info(
      command === 'list'
        ? JSON.stringify(queue, null, 2)
        : JSON.stringify({
            item: queue.open[0] ?? null,
            stuck: queue.stuck.length,
            unjudged: queue.unjudged.length,
          })
    );
    return 0;
  }
  const flags = FLAGS[command] && readFlags(args, FLAGS[command]);
  if (!flags) return refuse();
  const id = flags['--item'];
  const open = queue.open.find((item) => item.id === id);
  const stuck = queue.stuck.find((item) => item.id === id);
  if (command === 'failed' && !open?.running) {
    console.info(`[local-ci] friction ${id} has no running fix to count`);
    return 0;
  }
  if (command === 'start' && !open) {
    return refuse(`${id} is no open friction item`);
  }
  if (command === 'done') {
    if (!open && !stuck) {
      return refuse(`${id} is no open or stuck friction item`);
    }
    if (Boolean(flags['--commit']) === Boolean(flags['--task'])) {
      return refuse('done takes --commit or --task');
    }
  }
  appendLocalCiEvent(gitCommonDir, {
    item: id,
    kind: `friction-${command}`,
    ...(flags['--commit'] ? { commit: flags['--commit'] } : {}),
    ...(flags['--task'] ? { task: flags['--task'] } : {}),
  });
  console.info(`[local-ci] friction ${command} ${id}`);
  return 0;
};

const RUNNING_STATUSES = new Set([
  'active',
  'running',
  'starting',
  'streaming',
  'waiting_for_children',
  'working',
]);

const FOUNDATIONAL_BLOCKERS = {
  'plite-app-typecheck': (file) =>
    file.startsWith('apps/plite/') ||
    file.startsWith('packages/plitejs/') ||
    file.startsWith('packages/platejs/'),
  'plite-device-typecheck': (file) =>
    file.startsWith('apps/plite/') ||
    file.startsWith('packages/plitejs/') ||
    file.startsWith('packages/platejs/'),
  typecheck: (file) =>
    file.startsWith('packages/') ||
    file.startsWith('apps/') ||
    file.startsWith('tooling/') ||
    /^(?:package\.json|pnpm-lock\.yaml|tsconfig[^/]*\.json)$/u.test(file),
  'www-build': (file) =>
    file.startsWith('apps/www/') ||
    file.startsWith('packages/platejs/') ||
    file.startsWith('packages/plitejs/'),
};

const STEP_AREAS = {
  'authored-order': ['packages/plitejs'],
  'authored-recording': ['packages/plitejs'],
  'autoformat-rules': ['apps/www', 'packages/platejs'],
  'cli-test': ['packages/cli'],
  'delete-paste-ranges': ['packages/plitejs'],
  'docx-import-report': ['packages/platejs'],
  'effect-ledger': ['packages/plitejs'],
  'markdown-round-trip': ['packages/platejs'],
  'plite-browser': ['apps/plite', 'packages/plitejs'],
  'plite-docs': ['docs/plite', 'packages/plitejs'],
  'plite-test': ['packages/plitejs', 'packages/platejs', 'packages/test'],
  'sync-simulation': ['packages/plitejs'],
  'table-grid': ['packages/platejs'],
  'undo-redo-history': ['packages/plitejs'],
  'v4-intent-oracle': ['packages/plitejs'],
  www: ['apps/www'],
  'www-tokens-browser': ['apps/www'],
  'yjs-peer-order': ['packages/plitejs'],
};

const fileArea = (file) => {
  const pkg = /^(?:apps|packages|tooling|benchmarks)\/[^/]+/u.exec(file);
  if (pkg) return pkg[0];
  const top = /^([^/]+)\//u.exec(file);
  return top ? top[1] : file;
};

const sessionMatches = (a, b) => {
  if (!a || !b) return false;
  if (a === b) return true;
  return (
    a.length >= 8 &&
    b.length >= 8 &&
    (a.endsWith(`:${b}`) || b.endsWith(`:${a}`))
  );
};

const redAreasOf = (event) => {
  const files = (event.failures ?? [])
    .map((key) => (key.includes(' › ') ? failureFile(key) : key))
    .filter(Boolean);
  if (files.length > 0) return new Set(files.map(fileArea));
  return new Set(STEP_AREAS[event.step]);
};

export const activeRedEvents = (state, events, isAncestor) => {
  const active = new Map();
  for (const event of events) {
    if (event.dry || event.offNext || !isRunEvent(event)) continue;
    if (event.kind === 'green') active.clear();
    else if (event.kind === 'passed') active.delete(event.step);
    else if (event.kind === 'red' || event.kind === 'flake') {
      active.set(event.step, event);
    }
  }
  const passed = state?.passed ?? {};
  for (const [step, event] of [...active]) {
    const passedTip = passed[step];
    if (
      passedTip &&
      event.tip &&
      passedTip !== event.tip &&
      isAncestor(event.tip, passedTip)
    ) {
      active.delete(step);
    }
  }
  return active;
};

export const evaluateSettleCheck = ({
  commitFiles,
  commits = [],
  events = [],
  isAncestor,
  state = {},
  threads = [],
}) => {
  const tip = state?.tip ?? null;
  const lastRunAt = state?.lastRunAt ?? null;
  const activeReds = activeRedEvents(state, events, isAncestor);
  const reds = [...activeReds.values()];
  const redSteps = [...activeReds.keys()].toSorted((a, b) =>
    a.localeCompare(b)
  );
  const eligible = [];
  const demoteToPending = [];
  const skip = [];

  for (const thread of threads) {
    const threadId = String(thread.threadId ?? '').trim();
    const title = typeof thread.title === 'string' ? thread.title : '';
    const settled = Boolean(thread.settled);
    const status = typeof thread.status === 'string' ? thread.status : '';
    const base = { settled, threadId, title };
    if (RUNNING_STATUSES.has(status.toLowerCase())) {
      skip.push({ ...base, commits: [], newest: null, reason: 'running' });
      continue;
    }
    const matched = commits.filter((commit) => {
      const sessions =
        commit.sessions ?? (commit.session ? [commit.session] : []);
      return sessions.some((session) => sessionMatches(session, threadId));
    });
    const shas = matched.map((commit) => commit.sha);
    const newest = shas[0] ?? null;
    const entry = { ...base, commits: shas, newest };

    if (!tip) {
      skip.push({ ...entry, reason: 'after-tip' });
      continue;
    }
    if (newest && !isAncestor(newest, tip)) {
      if (title.trimStart().startsWith('🔴')) demoteToPending.push(entry);
      else skip.push({ ...entry, reason: 'after-tip' });
      continue;
    }
    const shaSet = new Set(shas);
    const blamed = reds.find(
      (red) =>
        sessionMatches(red.session, threadId) ||
        (red.culprit && shaSet.has(red.culprit))
    );
    if (blamed) {
      skip.push({ ...entry, reason: `blamed-by:${blamed.step}` });
      continue;
    }
    const files = [
      ...new Set(
        matched.flatMap(
          (commit) => commit.files ?? commitFiles?.(commit.sha) ?? []
        )
      ),
    ];
    if (files.length > 0) {
      const foundational = reds.find(
        (red) =>
          FOUNDATIONAL_BLOCKERS[red.step] &&
          files.some(FOUNDATIONAL_BLOCKERS[red.step])
      );
      if (foundational) {
        skip.push({
          ...entry,
          reason: `foundational-red:${foundational.step}`,
        });
        continue;
      }
      const touchedAreas = new Set(files.map(fileArea));
      const areaRed = reds.find((red) =>
        [...redAreasOf(red)].some((area) => touchedAreas.has(area))
      );
      if (areaRed) {
        skip.push({ ...entry, reason: `area-red:${areaRed.step}` });
        continue;
      }
    }
    eligible.push(entry);
  }

  return { demoteToPending, eligible, lastRunAt, redSteps, skip, tip };
};

const SETTLE_USAGE = `Usage: node tooling/scripts/local-ci.mjs settle-check [--stdin | --session <id>...] [--ref <ref>]`;

export const settleCheckCommand = (
  gitCommonDir,
  args,
  { commitFiles, input, isAncestor, listCommits }
) => {
  const refuse = (why) => {
    console.error(why ? `[local-ci] settle-check: ${why}` : SETTLE_USAGE);
    return 1;
  };
  let ref = 'origin/next';
  let useStdin = false;
  const sessions = [];
  for (let at = 0; at < args.length; at += 1) {
    const arg = args[at];
    if (arg === '--stdin') {
      useStdin = true;
    } else if (arg === '--session') {
      const id = args[at + 1];
      if (!filled(id) || id.startsWith('--')) {
        return refuse('--session needs an id');
      }
      sessions.push(id.trim());
      at += 1;
    } else if (arg === '--ref') {
      const value = args[at + 1];
      if (!filled(value) || value.startsWith('--')) {
        return refuse('--ref needs a ref');
      }
      ref = value.trim();
      at += 1;
    } else {
      return refuse();
    }
  }
  if (useStdin && sessions.length > 0) {
    return refuse('pass either --stdin or --session, not both');
  }
  let threads;
  if (sessions.length > 0) {
    threads = sessions.map((threadId) => ({
      settled: false,
      status: 'idle',
      threadId,
      title: '',
    }));
  } else {
    const { error, value } = readStdin(input);
    if (error) return refuse(error);
    if (
      !Array.isArray(value) ||
      !value.every(
        (item) => item && typeof item === 'object' && filled(item.threadId)
      )
    ) {
      return refuse(
        'stdin must be a JSON array of { threadId, title?, settled?, status? }'
      );
    }
    threads = value;
  }
  const state = readLocalCiState(gitCommonDir);
  const events = readLocalCiEvents(gitCommonDir);
  const commits = listCommits(state, ref);
  const result = evaluateSettleCheck({
    commitFiles,
    commits,
    events,
    isAncestor,
    state,
    threads,
  });
  console.info(JSON.stringify(result, null, 2));
  return 0;
};
