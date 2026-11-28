#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  appendLocalCiEvent,
  readLocalCiEvents,
  readLocalCiState,
} from './local-ci-events.mjs';

const USAGE = `Usage: node tooling/scripts/beta-release.mjs <command>
  due              print whether a beta is due and why, as JSON
  pending          list each pending changeset, the commit that added it and
                   whether a published beta holds the bug it fixes
  ship [--dry] [--force] [--auto | --manual] [--wait <minutes>]
                   merge the green-pinned version PR, wait for npm and the
                   package tag, then close the issues the beta fixed; --force
                   ships a manual beta even when not due, and a run that still
                   waits after --wait minutes, 50 by default, exits 75
  close <version> [--dry]
                   close each open public issue that beta fixed
  wake             trigger the hands-free daily beta workflow when due (at most
                   once in 12 hours), or sync the version PR to a newer green tip`;

export const REPO = 'udecode/plate';
export const PACKAGE = 'platejs';
export const VERSION_BRANCH = 'changeset-release/next';
export const GREEN_REF = 'refs/pstack/local-ci-green';
export const BETA = /^\d+\.\d+\.\d+-beta\.\d+$/u;
export const AUTO_RELEASE_INTERVAL_MS = 24 * 3_600_000;
export const AUTO_RELEASE_MARKER = '<!-- beta-release:auto -->';
export const MANUAL_RELEASE_MARKER = '<!-- beta-release:manual -->';
export const BETA_RELEASE_AUTO_RE = /<!--\s*beta-release:auto\s*-->/u;
export const GREEN_TIP_MARKER_RE =
  /<!--\s*beta-green-tip:([0-9a-f]{40})\s*-->/u;

const POLL_MS = 30_000;
// Stays under the hour any command may run; a rerun continues the wait.
const WAIT_MINUTES = 50;
const WAITING = 75;
const WAKE_GAP_MS = 12 * 3_600_000;
const SYNC_GAP_MS = 3_600_000;

const here = dirname(fileURLToPath(import.meta.url));
const resolveRoot = () =>
  spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf-8',
  }).stdout.trim() || process.cwd();

export function makeRunner(cwd = resolveRoot()) {
  const sh = (command, args) =>
    spawnSync(command, args, {
      cwd,
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
  const revParseCommit = (ref) => {
    if (!ref) return null;
    const result = sh('git', [
      'rev-parse',
      '--verify',
      '--quiet',
      `${ref}^{commit}`,
    ]);
    return result.status === 0 ? result.stdout.trim() : null;
  };
  return { contains, cwd, git, out, revParseCommit, sh };
}

export const tagOf = (version) => `${PACKAGE}@${version}`;
export const tagRef = (version) => `refs/tags/${tagOf(version)}`;
export const greenTipMarker = (sha) => `<!-- beta-green-tip:${sha} -->`;

export const fetchTag = (runner, version) =>
  runner.sh('git', [
    'fetch',
    '--quiet',
    'origin',
    `+${tagRef(version)}:${tagRef(version)}`,
  ]).status === 0;

export const fetchNext = (runner) => {
  runner.git('fetch', '--quiet', 'origin', 'next');
  return runner.git('rev-parse', 'origin/next');
};

export const fetchGreenRef = (runner) => {
  runner.sh('git', [
    'fetch',
    '--quiet',
    'origin',
    `+${GREEN_REF}:${GREEN_REF}`,
  ]);
  return runner.revParseCommit(GREEN_REF);
};

export const versionAt = (runner, ref) =>
  JSON.parse(runner.git('show', `${ref}:packages/${PACKAGE}/package.json`))
    .version;

export const onNpm = (runner, version) =>
  runner.sh('npm', ['view', tagOf(version), 'version']).stdout.trim() ===
  version;

export const checkNpmPublished = (runner, version) => {
  const result = runner.sh('npm', [
    'view',
    tagOf(version),
    'version',
    '--json',
  ]);
  if (result.status === 0) return { published: true };
  let errorCode = '';
  try {
    errorCode = JSON.parse(result.stdout || result.stderr)?.error?.code ?? '';
  } catch {
    errorCode = '';
  }
  if (errorCode === 'E404') return { published: false };
  throw new Error(
    `npm could not say whether ${tagOf(version)} is published: ${(result.stderr || result.stdout).trim().split('\n')[0]}`
  );
};

export const published = (runner) => {
  const facts = JSON.parse(
    runner.out('npm', ['view', PACKAGE, 'dist-tags', 'time', '--json'])
  );
  const version = facts['dist-tags'].beta;
  return { version, at: facts.time[version] };
};

export const versionPr = (runner, repo = REPO) =>
  JSON.parse(
    runner.out('gh', [
      'pr',
      'list',
      '--repo',
      repo,
      '--base',
      'next',
      '--head',
      VERSION_BRANCH,
      '--state',
      'open',
      '--json',
      'number,url,headRefOid,body',
    ])
  )[0] ?? null;

export const findLatestAutoRelease = (releases) => {
  const auto = (Array.isArray(releases) ? releases : [])
    .filter((release) => {
      if (!release || release.draft || !release.prerelease) return false;
      const version = String(release.tag_name ?? '').replace(/^v/u, '');
      if (!BETA.test(version)) return false;
      return BETA_RELEASE_AUTO_RE.test(release.body ?? '');
    })
    .map((release) => ({
      at: release.published_at || release.created_at || null,
      version: String(release.tag_name).replace(/^v/u, ''),
    }))
    .filter((release) => Number.isFinite(Date.parse(release.at ?? '')))
    .toSorted((a, b) => Date.parse(b.at) - Date.parse(a.at));
  return auto[0] ?? null;
};

export const latestAutoRelease = (runner, repo = REPO) => {
  const releases = JSON.parse(
    runner.out('gh', ['api', `repos/${repo}/releases?per_page=100`])
  );
  return findLatestAutoRelease(releases);
};

export const resolveGreenTip = (runner, common) => {
  const remoteGreen = fetchGreenRef(runner);
  const localGreen = common
    ? runner.revParseCommit(readLocalCiState(common).green)
    : null;
  if (remoteGreen && localGreen) {
    if (remoteGreen === localGreen) return remoteGreen;
    if (runner.contains(localGreen, remoteGreen) === 0) return remoteGreen;
    if (runner.contains(remoteGreen, localGreen) === 0) return localGreen;
    return remoteGreen;
  }
  return remoteGreen ?? localGreen ?? null;
};

const consumedChangesetsAt = (runner, ref) => {
  const result = runner.sh('git', ['show', `${ref}:.changeset/pre.json`]);
  if (result.status !== 0) return new Set();
  const pre = JSON.parse(result.stdout);
  return new Set(Array.isArray(pre?.changesets) ? pre.changesets : []);
};

export const unreleasedChangesetsAt = (runner, green, publishedVersion) => {
  if (runner.contains(green, tagRef(publishedVersion)) === 0) return [];
  const list = runner.sh('git', [
    'ls-tree',
    '--name-only',
    `${green}:.changeset`,
  ]);
  if (list.status !== 0) return [];
  const consumed = new Set([
    ...consumedChangesetsAt(runner, green),
    ...consumedChangesetsAt(runner, tagRef(publishedVersion)),
  ]);
  return list.stdout
    .split('\n')
    .map((name) => name.trim())
    .filter(
      (name) =>
        name.endsWith('.md') &&
        name !== 'README.md' &&
        !consumed.has(name.slice(0, -'.md'.length))
    )
    .toSorted();
};

export const hasCommitsAhead = (runner, ref, publishedVersion) => {
  const result = runner.sh('git', [
    'rev-list',
    '--count',
    `${tagRef(publishedVersion)}..${ref}`,
  ]);
  return result.status === 0 && Number(result.stdout.trim()) > 0;
};

export const isPrPinnedToGreen = (runner, pr, green) => {
  if (!pr?.headRefOid || !green) return false;
  const marker = GREEN_TIP_MARKER_RE.exec(pr.body ?? '');
  if (marker && marker[1] !== green) return false;
  runner.sh('git', ['fetch', '--quiet', 'origin', VERSION_BRANCH]);
  if (!runner.revParseCommit(pr.headRefOid)) return false;
  const parent = runner.revParseCommit(`${pr.headRefOid}^`);
  const secondParent = runner.revParseCommit(`${pr.headRefOid}^2`);
  return parent === green && secondParent === null;
};

export function releaseDue({
  common = null,
  now = new Date(),
  repo = REPO,
  runner = makeRunner(),
} = {}) {
  fetchNext(runner);
  const beta = published(runner);
  const pr = versionPr(runner, repo);
  const green = resolveGreenTip(runner, common);
  const lastAuto = latestAutoRelease(runner, repo);
  const prSummary = pr
    ? { headRefOid: pr.headRefOid, number: pr.number, url: pr.url }
    : null;
  const facts = {
    changesets: [],
    green,
    lastAuto,
    pr: prSummary,
    prPinnedToGreen: false,
    published: beta,
  };
  if (!fetchTag(runner, beta.version)) {
    return {
      ...facts,
      due: false,
      why: `${tagOf(beta.version)} has no tag yet, so its release is still running`,
    };
  }
  const nextVersion = versionAt(runner, 'origin/next');
  if (nextVersion !== beta.version && !onNpm(runner, nextVersion)) {
    return {
      ...facts,
      due: false,
      why: `${tagOf(nextVersion)} is already on next and waiting for npm`,
    };
  }
  if (!green) {
    return {
      ...facts,
      due: false,
      why: 'Local CI has not recorded a green commit yet',
    };
  }
  if (runner.contains(green, 'origin/next') !== 0) {
    return {
      ...facts,
      due: false,
      why: `Local CI green commit ${green.slice(0, 10)} is not on next`,
    };
  }
  const greenVersion = versionAt(runner, green);
  if (greenVersion !== beta.version) {
    return {
      ...facts,
      due: false,
      why: `Local CI green commit ${green.slice(0, 10)} is at ${tagOf(greenVersion)}, not ${tagOf(beta.version)}`,
    };
  }
  const changesets = unreleasedChangesetsAt(runner, green, beta.version);
  const prPinnedToGreen = isPrPinnedToGreen(runner, pr, green);
  const detailed = { ...facts, changesets, prPinnedToGreen };
  if (changesets.length === 0) {
    return {
      ...detailed,
      due: false,
      why: `green tip ${green.slice(0, 10)} has no unreleased changesets ahead of ${tagOf(beta.version)}`,
    };
  }
  if (
    lastAuto &&
    now.getTime() - Date.parse(lastAuto.at) <= AUTO_RELEASE_INTERVAL_MS
  ) {
    return {
      ...detailed,
      due: false,
      why: `last auto beta ${tagOf(lastAuto.version)} went out at ${lastAuto.at}, within 24h`,
    };
  }
  return {
    ...detailed,
    due: true,
    reason: 'daily',
    why: lastAuto
      ? `last auto beta ${tagOf(lastAuto.version)} went out at ${lastAuto.at} (>24h ago), and green tip ${green.slice(0, 10)} has ${changesets.length} unreleased changeset(s)`
      : `no auto beta recorded yet, and green tip ${green.slice(0, 10)} has ${changesets.length} unreleased changeset(s)`,
  };
}

const commonDir = (runner) =>
  runner.git('rev-parse', '--path-format=absolute', '--git-common-dir');

const usage = (message) => {
  console.error(`${message}\n${USAGE}`);
  return 2;
};

const dispatchReleaseWorkflow = (runner, mode) =>
  runner.out('gh', [
    'workflow',
    'run',
    'release.yml',
    '--repo',
    REPO,
    '--ref',
    'next',
    '-f',
    `mode=${mode}`,
  ]);

// Triggers the hands-free daily beta workflow when due (at most once in 12h),
// or keeps the open version PR synced to a newer green tip with pending changesets.
const wake = () => {
  const runner = makeRunner();
  const common = commonDir(runner);
  const events = readLocalCiEvents(common);
  const decision = releaseDue({ common, runner });
  if (decision.due) {
    const since = Date.now() - WAKE_GAP_MS;
    if (
      events.some(
        (event) => event.kind === 'release' && Date.parse(event.at) > since
      )
    ) {
      console.info('A release event came in the last 12 hours.');
      return 0;
    }
    dispatchReleaseWorkflow(runner, 'auto');
    appendLocalCiEvent(common, {
      kind: 'release',
      mode: 'auto',
      reason: decision.reason,
      tip: decision.green,
      wake: false,
      why: decision.why,
    });
    console.info(
      `Triggered beta auto-release for green tip ${decision.green.slice(0, 10)}: ${decision.why}.`
    );
    return 0;
  }
  if (
    decision.green &&
    decision.changesets.length > 0 &&
    !decision.prPinnedToGreen
  ) {
    const syncSince = Date.now() - SYNC_GAP_MS;
    const syncedRecently = events.some(
      (event) =>
        event.kind === 'release-sync' &&
        event.tip === decision.green &&
        Date.parse(event.at) > syncSince
    );
    if (!syncedRecently) {
      dispatchReleaseWorkflow(runner, 'sync');
      appendLocalCiEvent(common, {
        kind: 'release-sync',
        tip: decision.green,
        wake: false,
      });
      console.info(
        `No beta is due: ${decision.why}. Synced version PR to green tip ${decision.green.slice(0, 10)}.`
      );
      return 0;
    }
  }
  console.info(`No beta is due: ${decision.why}.`);
  return 0;
};

const due = () => {
  const runner = makeRunner();
  const result = releaseDue({ common: commonDir(runner), runner });
  console.info(JSON.stringify(result, null, 2));
  return 0;
};

const causeOf = (runner, cause, version) => {
  if (cause === 'none') return 'older than the history or outside it';
  const status = runner.contains(cause, tagRef(version));
  if (status === 0) return `in ${tagOf(version)}, so users have this bug`;
  if (status === 1) return 'in no published beta, so no user has this bug';
  return 'a commit this clone lacks';
};

const pending = () => {
  const runner = makeRunner();
  const { version } = published(runner);
  fetchTag(runner, version);
  const consumed = new Set(
    JSON.parse(
      readFileSync(join(runner.cwd, '.changeset', 'pre.json'), 'utf-8')
    ).changesets
  );
  const names = readdirSync(join(runner.cwd, '.changeset'))
    .filter(
      (name) =>
        name.endsWith('.md') &&
        name !== 'README.md' &&
        !consumed.has(name.slice(0, -'.md'.length))
    )
    .toSorted();
  console.info(
    `${names.length} changesets wait for the beta after ${tagOf(version)}.`
  );
  for (const name of names) {
    const path = `.changeset/${name}`;
    const [, front = '', body = ''] =
      /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/u.exec(
        readFileSync(join(runner.cwd, path), 'utf-8')
      ) ?? [];
    console.info(`\n${path} (${front.split('\n').join(', ')})`);
    for (const line of body.trim().split('\n')) console.info(`  ${line}`);
    const [sha, subject] = runner
      .sh('git', [
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
    for (const [, cause] of runner
      .git('log', '-1', '--format=%B', sha)
      .matchAll(/^Introduced-by: (\S+)$/gmu)) {
      console.info(
        `  introduced by ${cause}: ${causeOf(runner, cause, version)}`
      );
    }
  }
  return 0;
};

const close = (args) => {
  const runner = makeRunner();
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
      { cwd: runner.cwd, stdio: 'inherit' }
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
  const runner = makeRunner();
  const dry = args.includes('--dry');
  const force = args.includes('--force');
  const explicitAuto = args.includes('--auto');
  const explicitManual = args.includes('--manual');
  if (explicitAuto && explicitManual) {
    return usage('pass either --auto or --manual, not both');
  }
  const at = args.indexOf('--wait');
  const minutes = at === -1 ? WAIT_MINUTES : Number(args[at + 1]);
  if (!(minutes >= 0)) {
    return usage('--wait takes a number of minutes, such as 0');
  }
  const deadline = Date.now() + minutes * 60_000;
  fetchNext(runner);
  let version = versionAt(runner, 'origin/next');
  const mergedEarlier = !onNpm(runner, version);
  const decision = mergedEarlier
    ? null
    : releaseDue({ common: commonDir(runner), runner });
  if (mergedEarlier) {
    console.info(
      `An earlier run merged ${tagOf(version)}, which waits for npm.`
    );
  } else if (!decision.due && !force) {
    console.info(`No beta is due: ${decision.why}.`);
  } else {
    const { green } = decision;
    if (!green || runner.contains(green, 'origin/next') !== 0) {
      console.error('Local CI has no green commit on next to release.');
      return 1;
    }
    const greenVersion = versionAt(runner, green);
    if (greenVersion !== decision.published.version) {
      console.error(
        `Local CI green commit ${green.slice(0, 10)} is at ${tagOf(greenVersion)}, not ${tagOf(decision.published.version)}.`
      );
      return 1;
    }
    const releaseMode = explicitAuto
      ? 'auto'
      : explicitManual || force
        ? 'manual'
        : 'auto';
    let synced = false;
    const pr = await waitFor(() => {
      const open = versionPr(runner);
      if (isPrPinnedToGreen(runner, open, green)) return open;
      if (!dry && !synced) {
        synced = true;
        dispatchReleaseWorkflow(runner, 'sync');
      }
      return null;
    }, deadline);
    if (!pr) {
      console.error(
        `The version PR is not pinned to green tip ${green.slice(0, 10)} yet; run ship again.`
      );
      return WAITING;
    }
    version = versionAt(runner, pr.headRefOid);
    if (dry) {
      console.info(
        `Would merge ${pr.url} to publish ${tagOf(version)} from green tip ${green.slice(0, 10)} (${releaseMode}).`
      );
      return 0;
    }
    runner.out('gh', [
      'pr',
      'merge',
      String(pr.number),
      '--repo',
      REPO,
      '--merge',
      '--delete-branch',
      '--admin',
      '--match-head-commit',
      pr.headRefOid,
      '--subject',
      '[Release] Version packages (beta)',
      '--body',
      `Beta-Release: ${releaseMode}\nGreen-Tip: ${green}`,
    ]);
    console.info(
      `Merged ${pr.url}, which publishes ${tagOf(version)} from green tip ${green.slice(0, 10)} (${releaseMode}).`
    );
  }
  // Every run ends with the close, because a run that stopped while npm
  // published the beta never closed its issues.
  const shipped = await waitFor(
    () => onNpm(runner, version) && fetchTag(runner, version),
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

const COMMANDS = { close, due, pending, ship, wake };

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
