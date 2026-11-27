import { existsSync } from 'node:fs';

import { isRunEvent } from './local-ci-events.mjs';
import { failureFile } from './step-failures.mjs';

const WINDOW_MS = 7 * 86_400_000;
const STARTS = 3;

const recurrenceTitle = (step) => `Stop ${step} from failing on next again`;

export const reportsRun = (event) =>
  !event.dry && !event.offNext && isRunEvent(event);

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

export const dueRecurrences = ({ events, now }) => {
  const runs = runsOf(events);
  const newest = runs.at(-1)?.tip;
  const restarted = new Map();
  for (const entry of startsByFailure(runs).values()) {
    const { step, tip } = entry.starts.at(-1);
    if (tip !== newest) continue;
    restarted.set(step, [...(restarted.get(step) ?? []), entry]);
  }
  const due = [];
  for (const [step, entries] of restarted) {
    const priorTimes = events
      .filter((event) => event.kind === 'recurrence' && event.step === step)
      .map((event) => Date.parse(event.at));
    const since = Math.max(
      now - WINDOW_MS,
      ...priorTimes.filter(Number.isFinite)
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
    files: [...new Set(files)],
    finding: `Local CI saw ${seen.join('; ')}, since ${new Date(since).toISOString().slice(0, 16)}. Each start got fixed and the failure came back, so no check before landing catches this kind of break. Find what these failures share from their logs and the events in ${eventsPath}, then add a guard via /pstack:correct and prove it fails on one of these past failures.`,
    title: recurrenceTitle(step),
  };
};
