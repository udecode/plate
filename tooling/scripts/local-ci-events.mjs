// Local CI keeps its state and events in the clone's git common directory, so
// every worktree of the clone, the beta release job's included, reads one copy.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const FULL_RUN_HOUR = 4;

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
