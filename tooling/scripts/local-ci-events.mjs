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
