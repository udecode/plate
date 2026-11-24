import { existsSync } from 'node:fs';

import { readTasks } from '../../.agents/pstack/tasks.mjs';
import { failureFile } from './step-failures.mjs';

const RECURRENCE_TOPIC = 'red-recurrence';
const WINDOW_MS = 7 * 86_400_000;
const STARTS = 3;

const recurrenceTitle = (step) => `Stop ${step} from failing on next again`;

export const reportsRun = (event) =>
  !event.dry && !event.offNext && event.kind !== 'release';

export const runsOf = (events) => {
  const runs = [];
  for (const event of events.filter(reportsRun)) {
    if (runs.at(-1)?.tip !== event.tip) {
      runs.push({ events: [], tip: event.tip });
    }
    runs.at(-1).events.push(event);
  }
  return runs.filter(
    (run) => !run.events.every((event) => event.kind === 'broken')
  );
};

const failuresIn = (event) => {
  const files = new Set((event.failures ?? []).map(failureFile));
  files.delete(null);
  return files.size > 0
    ? [...files].map((file) => ({ failure: `${event.step} › ${file}`, file }))
    : [{ failure: event.step, file: null }];
};

const startsByFailure = (runs) => {
  const starts = new Map();
  let failing = new Set();
  for (const run of runs) {
    const failed = new Map();
    for (const event of run.events) {
      if (!['red', 'flake'].includes(event.kind) || event.cleared) continue;
      for (const { failure, file } of failuresIn(event)) {
        if (!failed.has(failure)) failed.set(failure, { event, file });
      }
    }
    for (const [failure, { event, file }] of failed) {
      if (failing.has(failure)) continue;
      if (!starts.has(failure)) {
        starts.set(failure, { failure, file, starts: [] });
      }
      starts.get(failure).starts.push(event);
    }
    failing = new Set(failed.keys());
  }
  return starts;
};

export const dueRecurrences = ({ events, ledgerRows, now }) => {
  const runs = runsOf(events);
  const newest = runs.at(-1)?.tip;
  const restarted = new Map();
  for (const entry of startsByFailure(runs).values()) {
    const { step, tip } = entry.starts.at(-1);
    if (tip !== newest) continue;
    restarted.set(step, [...(restarted.get(step) ?? []), entry]);
  }
  const tasks = [...readTasks(ledgerRows).values()].filter(
    (task) => task.topic === RECURRENCE_TOPIC
  );
  const due = [];
  for (const [step, entries] of restarted) {
    const ours = tasks.filter((task) =>
      task.title.includes(recurrenceTitle(step))
    );
    if (ours.some((task) => ['offered', 'started'].includes(task.status))) {
      continue;
    }
    const ids = new Set(ours.map((task) => task.id));
    const rowTimes = ledgerRows
      .map((row) => row.split('\t'))
      .filter((cells) => ids.has(cells[2]?.split(' ')[0]))
      .map((cells) => Date.parse(cells[0]));
    const since = Math.max(
      now - WINDOW_MS,
      ...rowTimes.filter(Number.isFinite)
    );
    const recurring = entries
      .map((entry) => ({
        ...entry,
        starts: entry.starts.filter((event) => Date.parse(event.at) > since),
      }))
      .filter((entry) => entry.starts.length >= STARTS);
    if (recurring.length > 0) due.push({ failures: recurring, since, step });
  }
  return due;
};

export const recurrenceOffer = ({ failures, since, step }, eventsPath) => {
  const seen = failures.map(
    ({ failure, starts }) =>
      `${failure} start failing at ${starts
        .map(
          (event) =>
            `${event.at.slice(0, 16)}${event.kind === 'flake' ? ' as a flake' : event.culprit ? ` with ${event.culprit.slice(0, 10)}` : ''}${existsSync(event.log) ? ` (log ${event.log})` : ''}`
        )
        .join(', ')}`
  );
  const files = failures.map(({ file }) => file).filter(Boolean);
  return {
    finding: `Local CI saw ${seen.join('; ')}, since ${new Date(since).toISOString().slice(0, 16)}. Each start got its own fix task and the failure came back, so no check before landing catches this kind of break. Find what these failures share from their logs and the events in ${eventsPath}. Then stop the kind as /pstack:correct does: in the architecture or the types first, then with a lint whose error names the fix, then with a fast test or check that pnpm check --affected runs before landing, as AGENTS.md's rule for the landing list allows, and last in the skill or rule that let it through. Prove the new guard fails on one of these past failures, such as at its first bad commit, and land through land.mjs.`,
    title: recurrenceTitle(step),
    tokens: `writes: ${[...new Set(files), 'tooling', '.agents'].join(', ')}; topic: ${RECURRENCE_TOPIC}; kind: fix; priority: P3; via: hook; session: none`,
  };
};
