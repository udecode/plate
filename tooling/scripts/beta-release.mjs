#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  FULL_RUN_HOUR,
  readLocalCiEvents,
  readLocalCiState,
} from './local-ci-events.mjs';

const USAGE = `Usage: node tooling/scripts/beta-release.mjs <command>
  due              print whether a beta is due and why, as JSON
  close <version> [--dry]
                   close each open public issue that beta fixed`;

const REPO = 'udecode/plate';
const PACKAGE = 'platejs';
const VERSION_BRANCH = 'changeset-release/next';
const BETA = /^\d+\.\d+\.\d+-beta\.\d+$/u;

const here = dirname(fileURLToPath(import.meta.url));
const root =
  spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf-8',
  }).stdout.trim() || process.cwd();

const sh = (command, args) =>
  spawnSync(command, args, {
    cwd: root,
    encoding: 'utf-8',
    maxBuffer: 64 << 20,
  });
const out = (command, args) => {
  const result = sh(command, args);
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')}: ${(result.stderr || result.stdout).trim().split('\n')[0]}`
    );
  }
  return result.stdout.trim();
};
const git = (...args) => out('git', args);
const contains = (commit, ref) =>
  sh('git', ['merge-base', '--is-ancestor', commit, ref]).status;
const commonDir = () =>
  git('rev-parse', '--path-format=absolute', '--git-common-dir');
const tagOf = (version) => `${PACKAGE}@${version}`;
const tagRef = (version) => `refs/tags/${tagOf(version)}`;
const fetchTag = (version) =>
  sh('git', [
    'fetch',
    '--quiet',
    'origin',
    `+${tagRef(version)}:${tagRef(version)}`,
  ]).status === 0;
const fetchNext = () => {
  git('fetch', '--quiet', 'origin', 'next');
  return git('rev-parse', 'origin/next');
};
const published = () => {
  const facts = JSON.parse(
    out('npm', ['view', PACKAGE, 'dist-tags', 'time', '--json'])
  );
  const version = facts['dist-tags'].beta;
  return { version, at: facts.time[version] };
};
const versionPr = () =>
  JSON.parse(
    out('gh', [
      'pr',
      'list',
      '--repo',
      REPO,
      '--base',
      'next',
      '--head',
      VERSION_BRANCH,
      '--state',
      'open',
      '--json',
      'number,url,headRefOid',
    ])
  )[0] ?? null;
const usage = (message) => {
  console.error(`${message}\n${USAGE}`);
  return 2;
};

const lastFullRunHour = (now) => {
  const start = new Date(now);
  start.setHours(FULL_RUN_HOUR, 0, 0, 0);
  if (start > now) start.setDate(start.getDate() - 1);
  return start;
};

function releaseDue({ common, tip, now = new Date() }) {
  const beta = published();
  const pr = versionPr();
  const facts = { published: beta, pr };
  if (!pr) {
    return {
      ...facts,
      due: false,
      why: 'no version PR is open, so no change waits for a beta',
    };
  }
  fetchTag(beta.version);
  const fixes = readLocalCiEvents(common).filter(
    (event) =>
      event.kind === 'release' &&
      event.reason === 'fix' &&
      contains(event.commit, tagRef(beta.version)) !== 0
  );
  if (fixes.length > 0) {
    return {
      ...facts,
      due: true,
      reason: 'fix',
      why: `a public fix waits for a beta: ${fixes.map((event) => `#${event.issue}`).join(', ')}`,
    };
  }
  const since = lastFullRunHour(now);
  if (Date.parse(beta.at) >= since.getTime()) {
    return {
      ...facts,
      due: false,
      why: `${tagOf(beta.version)} went out at ${beta.at}, after the last ${FULL_RUN_HOUR}:00`,
    };
  }
  const state = readLocalCiState(common);
  if (state.tip !== tip || state.green !== tip) {
    return {
      ...facts,
      due: false,
      why: `Local CI has not passed next's tip ${tip.slice(0, 10)}`,
    };
  }
  return {
    ...facts,
    due: true,
    reason: 'daily',
    why: `no beta since ${since.toISOString()}, and Local CI passed ${tip.slice(0, 10)}`,
  };
}

const due = () => {
  const result = releaseDue({ common: commonDir(), tip: fetchNext() });
  console.info(JSON.stringify(result, null, 2));
  return 0;
};

const close = (args) => {
  const [version] = args;
  if (!BETA.test(version ?? '')) {
    return usage('close takes one beta version, such as 54.0.0-beta.3');
  }
  return (
    spawnSync(
      process.execPath,
      [
        join(here, 'triage.mjs'),
        'shipped',
        version,
        ...(args.includes('--dry') ? ['--dry-run'] : []),
      ],
      { cwd: root, stdio: 'inherit' }
    ).status ?? 1
  );
};

const COMMANDS = { due, close };

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command, ...rest] = process.argv.slice(2);
  try {
    process.exitCode = COMMANDS[command]
      ? await COMMANDS[command](rest)
      : usage(command ? `unknown command ${command}` : 'name a command');
  } catch (error) {
    console.error(`beta-release ${command}: ${error.message}`);
    process.exitCode = 1;
  }
}
