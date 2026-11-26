#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  appendLocalCiEvent,
  FULL_RUN_HOUR,
  readLocalCiEvents,
  readLocalCiState,
} from './local-ci-events.mjs';

const USAGE = `Usage: node tooling/scripts/beta-release.mjs <command>
  due              print whether a beta is due and why, as JSON
  pending          list each pending changeset, the commit that added it and
                   whether a published beta holds the bug it fixes
  ship [--dry] [--force] [--wait <minutes>]
                   merge the version PR once it holds next's tip, wait for npm
                   and the package tag, then close the issues the beta fixed;
                   --force ships a beta that is not due, and a run that still
                   waits after --wait minutes, 50 by default, exits 75
  close <version> [--dry]
                   close each open public issue that beta fixed
  wake             ask the operator for a beta when one is due, at most once
                   in 12 hours`;

const REPO = 'udecode/plate';
const PACKAGE = 'platejs';
const VERSION_BRANCH = 'changeset-release/next';
const BETA = /^\d+\.\d+\.\d+-beta\.\d+$/u;
const POLL_MS = 30_000;
// Stays under the hour any command may run; a rerun continues the wait.
const WAIT_MINUTES = 50;
const WAITING = 75;
const WAKE_GAP_MS = 12 * 3_600_000;

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
const versionAt = (ref) =>
  JSON.parse(git('show', `${ref}:packages/${PACKAGE}/package.json`)).version;
const onNpm = (version) =>
  sh('npm', ['view', tagOf(version), 'version']).stdout.trim() === version;
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
  if (!fetchTag(beta.version)) {
    return {
      ...facts,
      due: false,
      why: `${tagOf(beta.version)} has no tag yet, so its release is still running`,
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

// A beta still in flight keeps looking due, so a release event in the last
// 12 hours stops the operator from waking for it again.
const wake = () => {
  const common = commonDir();
  const since = Date.now() - WAKE_GAP_MS;
  if (
    readLocalCiEvents(common).some(
      (event) => event.kind === 'release' && Date.parse(event.at) > since
    )
  ) {
    console.info('A release event came in the last 12 hours.');
    return 0;
  }
  const tip = fetchNext();
  const decision = releaseDue({ common, tip });
  if (!decision.due) {
    console.info(`No beta is due: ${decision.why}.`);
    return 0;
  }
  appendLocalCiEvent(common, {
    kind: 'release',
    reason: decision.reason,
    tip,
    why: decision.why,
    wake: true,
  });
  console.info(`Asked the operator for a beta: ${decision.why}.`);
  return 0;
};

const due = () => {
  const result = releaseDue({ common: commonDir(), tip: fetchNext() });
  console.info(JSON.stringify(result, null, 2));
  return 0;
};

const causeOf = (cause, version) => {
  if (cause === 'none') return 'older than the history or outside it';
  const status = contains(cause, tagRef(version));
  if (status === 0) return `in ${tagOf(version)}, so users have this bug`;
  if (status === 1) return 'in no published beta, so no user has this bug';
  return 'a commit this clone lacks';
};

const pending = () => {
  const { version } = published();
  fetchTag(version);
  const consumed = new Set(
    JSON.parse(readFileSync(join(root, '.changeset', 'pre.json'), 'utf-8'))
      .changesets
  );
  const names = readdirSync(join(root, '.changeset'))
    .filter(
      (name) =>
        name.endsWith('.md') &&
        name !== 'README.md' &&
        !consumed.has(name.slice(0, -'.md'.length))
    )
    .sort();
  console.info(
    `${names.length} changesets wait for the beta after ${tagOf(version)}.`
  );
  for (const name of names) {
    const path = `.changeset/${name}`;
    const [, front = '', body = ''] =
      /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u.exec(
        readFileSync(join(root, path), 'utf-8')
      ) ?? [];
    console.info(`\n${path} (${front.split('\n').join(', ')})`);
    for (const line of body.trim().split('\n')) console.info(`  ${line}`);
    const [sha, subject] = sh('git', [
      'log',
      '--diff-filter=A',
      '-n',
      '1',
      '--format=%H%x09%s',
      '--',
      path,
    ])
      .stdout.trim()
      .split('\t');
    if (!sha) {
      console.info('  added by no commit yet');
      continue;
    }
    console.info(`  added in ${sha.slice(0, 10)} ${subject}`);
    for (const [, cause] of git('log', '-1', '--format=%B', sha).matchAll(
      /^Introduced-by: (\S+)$/gmu
    )) {
      console.info(`  introduced by ${cause}: ${causeOf(cause, version)}`);
    }
  }
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
        join(here, 'close-released-issues.mjs'),
        '--version',
        version,
        '--repo',
        REPO,
        ...(args.includes('--dry') ? ['--dry-run'] : []),
      ],
      { cwd: root, stdio: 'inherit' }
    ).status ?? 1
  );
};

const waitFor = async (check, deadline) => {
  for (;;) {
    const value = check();
    if (value) return value;
    if (Date.now() + POLL_MS > deadline) return null;
    await sleep(POLL_MS);
  }
};

const ship = async (args) => {
  const dry = args.includes('--dry');
  const at = args.indexOf('--wait');
  const minutes = at === -1 ? WAIT_MINUTES : Number(args[at + 1]);
  if (!(minutes >= 0)) {
    return usage('--wait takes a number of minutes, such as 0');
  }
  const deadline = Date.now() + minutes * 60_000;
  const tip = fetchNext();
  let version = versionAt('origin/next');
  const mergedEarlier = !onNpm(version);
  const decision = mergedEarlier
    ? null
    : releaseDue({ common: commonDir(), tip });
  if (mergedEarlier) {
    console.info(
      `An earlier run merged ${tagOf(version)}, which waits for npm.`
    );
  } else if (!decision.due && !args.includes('--force')) {
    console.info(`No beta is due: ${decision.why}.`);
  } else {
    const pr = await waitFor(() => {
      const open = versionPr();
      if (!open) return null;
      sh('git', ['fetch', '--quiet', 'origin', VERSION_BRANCH]);
      return contains(tip, open.headRefOid) === 0 ? open : null;
    }, deadline);
    if (!pr) {
      console.error(
        `The version PR does not hold next's tip ${tip.slice(0, 10)} yet; run ship again.`
      );
      return WAITING;
    }
    version = versionAt(pr.headRefOid);
    if (dry) {
      console.info(`Would merge ${pr.url} to publish ${tagOf(version)}.`);
      return 0;
    }
    out('gh', [
      'pr',
      'merge',
      String(pr.number),
      '--repo',
      REPO,
      '--squash',
      '--delete-branch',
      '--admin',
    ]);
    console.info(`Merged ${pr.url}, which publishes ${tagOf(version)}.`);
  }
  // Every run ends with the close, because a run that stopped while npm
  // published the beta never closed its issues.
  const shipped = await waitFor(
    () => onNpm(version) && fetchTag(version),
    deadline
  );
  if (!shipped) {
    console.error(
      `${tagOf(version)} is not on npm with its tag yet; run ship again.`
    );
    return WAITING;
  }
  return close([version, ...(dry ? ['--dry'] : [])]);
};

const COMMANDS = { due, pending, ship, close, wake };

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
