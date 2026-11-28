#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  checkNpmPublished,
  fetchGreenRef,
  fetchNext,
  fetchTag,
  greenTipMarker,
  hasCommitsAhead,
  isPrPinnedToGreen,
  makeRunner,
  PACKAGE,
  releaseDue,
  REPO,
  tagOf,
  unreleasedChangesetsAt,
  VERSION_BRANCH,
  versionAt,
  versionPr,
} from './beta-release.mjs';

const USAGE = `Usage: node tooling/scripts/beta-release-ci.mjs <plan | version | publish>`;
const BETA_RELEASE_TRAILER_RE = /^Beta-Release:\s*(auto|manual)\s*$/imu;
const NEW_TAG_RE = /New tag:\s+(@[^/]+\/[^@]+|[^/]+)@([^\s]+)/u;
const RELEASE_TYPE_HEADING_RE =
  /^###\s+(Major|Minor|Patch) Changes[^\S\r\n]*$/gm;
const NEXT_VERSION_HEADING_RE = /^##\s+/m;
const RELEASE_TYPES = ['major', 'minor', 'patch'];
const RELEASE_TYPE_LABELS = { major: 'Major', minor: 'Minor', patch: 'Patch' };
const BOT_NAME = 'github-actions[bot]';
const BOT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';

const setOutputs = (outputs, outputFile = process.env.GITHUB_OUTPUT) => {
  if (!outputFile) return;
  const lines = Object.entries(outputs).map(
    ([key, value]) => `${key}=${value ?? ''}`
  );
  appendFileSync(outputFile, `${lines.join('\n')}\n`);
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function extractChangelogSection(changelog, version) {
  const versionHeading = new RegExp(
    `^##\\s+${escapeRegExp(version)}(?:\\s|$).*`,
    'm'
  );
  const match = versionHeading.exec(changelog);
  if (!match) return '';
  const bodyStart = match.index + match[0].length;
  const rest = changelog.slice(bodyStart);
  const nextMatch = NEXT_VERSION_HEADING_RE.exec(rest);
  const section =
    nextMatch?.index === undefined ? rest : rest.slice(0, nextMatch.index);
  const matches = [...section.matchAll(RELEASE_TYPE_HEADING_RE)];
  const parts = matches
    .map((heading, index) => {
      const start = heading.index + heading[0].length;
      const end = matches[index + 1]?.index ?? section.length;
      const body = section.slice(start, end).trim();
      if (!body) return null;
      return { body, type: heading[1].toLowerCase() };
    })
    .filter(Boolean)
    .toSorted(
      (a, b) => RELEASE_TYPES.indexOf(a.type) - RELEASE_TYPES.indexOf(b.type)
    );
  return parts
    .map(
      (part) => `### ${RELEASE_TYPE_LABELS[part.type]} Changes\n\n${part.body}`
    )
    .join('\n\n');
}

export function buildVersionPrBody({ changedPackages, greenSha, version }) {
  const sections = changedPackages
    .map((pkg) => {
      const header = `## ${pkg.name}@${pkg.version}`;
      return pkg.content ? `${header}\n\n${pkg.content}` : header;
    })
    .join('\n\n');
  return [
    `This PR was opened by the beta release workflow pinned to Local CI green commit \`${greenSha}\`. Merging this PR publishes \`${tagOf(version)}\` from that green commit so newer commits on \`next\` never sneak in untested.`,
    '',
    '⚠️⚠️⚠️⚠️⚠️⚠️',
    '',
    '`next` is currently in **pre mode** so this branch has prereleases rather than normal releases. If you want to exit prereleases, run `changeset pre exit` on `next`.',
    '',
    '⚠️⚠️⚠️⚠️⚠️⚠️',
    '',
    greenTipMarker(greenSha),
    '',
    '# Releases',
    sections,
    '',
  ].join('\n');
}

export function parsePublishedTags(stdout) {
  const packages = [];
  const seen = new Set();
  for (const line of stdout.split('\n')) {
    const match = NEW_TAG_RE.exec(line);
    if (!match) continue;
    const [, name, version] = match;
    const key = `${name}@${version}`;
    if (seen.has(key)) continue;
    seen.add(key);
    packages.push({ name, version });
  }
  return packages;
}

export function parseReleaseModeFromMessage(message) {
  const match = BETA_RELEASE_TRAILER_RE.exec(message ?? '');
  return match ? match[1].toLowerCase() : null;
}

export function resolvePublishTarget(
  runner,
  { headSha, repo = REPO, version }
) {
  const secondParent = runner.revParseCommit(`${headSha}^2`);
  if (secondParent && versionAt(runner, secondParent) === version) {
    return secondParent;
  }
  const pullsResult = runner.sh('gh', [
    'api',
    `repos/${repo}/commits/${headSha}/pulls`,
  ]);
  if (pullsResult.status === 0) {
    try {
      const pulls = JSON.parse(pullsResult.stdout);
      const releasePr = (Array.isArray(pulls) ? pulls : []).find(
        (pr) => pr?.head?.ref === VERSION_BRANCH && pr?.head?.sha
      );
      if (releasePr) {
        const ref = `refs/remotes/origin/pr-${releasePr.number}`;
        runner.sh('git', [
          'fetch',
          '--quiet',
          'origin',
          `+refs/pull/${releasePr.number}/head:${ref}`,
        ]);
        const prHead = runner.revParseCommit(releasePr.head.sha);
        if (prHead && versionAt(runner, prHead) === version) {
          return prHead;
        }
      }
    } catch {
      // Fall back to headSha when associated PR metadata is unavailable.
    }
  }
  return headSha;
}

export function resolveReleaseMode(runner, { headSha, version }) {
  const direct = parseReleaseModeFromMessage(
    runner.git('log', '-1', '--format=%B', headSha)
  );
  if (direct) return direct;
  const introducing = runner.sh('git', [
    'log',
    '-n',
    '1',
    '--format=%B',
    '-S',
    `"version": "${version}"`,
    headSha,
    '--',
    `packages/${PACKAGE}/package.json`,
  ]);
  if (introducing.status === 0) {
    const found = parseReleaseModeFromMessage(introducing.stdout);
    if (found) return found;
  }
  return 'manual';
}

export function planBetaRelease({
  env = process.env,
  now = new Date(),
  runner = makeRunner(),
} = {}) {
  const eventName = env.GITHUB_EVENT_NAME || 'push';
  const inputMode = env.INPUT_MODE || '';
  const repo = env.GITHUB_REPOSITORY || REPO;
  const headSha = env.GITHUB_SHA || runner.git('rev-parse', 'HEAD');
  const nextVersion = versionAt(runner, headSha);
  const npmState = checkNpmPublished(runner, nextVersion);

  if (!npmState.published) {
    if (eventName !== 'push') {
      return {
        action: 'noop',
        auto_merge: 'false',
        published_version: '',
        reason: `${tagOf(nextVersion)} is already on next and waiting for npm`,
        release_mode: 'manual',
        target_sha: '',
      };
    }
    const targetSha = resolvePublishTarget(runner, {
      headSha,
      repo,
      version: nextVersion,
    });
    const releaseMode = resolveReleaseMode(runner, {
      headSha,
      version: nextVersion,
    });
    return {
      action: 'publish',
      auto_merge: 'false',
      published_version: '',
      reason: `publishing ${tagOf(nextVersion)} from ${targetSha.slice(0, 10)} (${releaseMode})`,
      release_mode: releaseMode,
      target_sha: targetSha,
      version: nextVersion,
    };
  }

  const publishedVersion = nextVersion;
  fetchNext(runner);
  const green = fetchGreenRef(runner);
  if (!green) {
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: 'refs/pstack/local-ci-green does not exist on origin yet',
      release_mode: 'manual',
      target_sha: '',
    };
  }
  if (runner.contains(green, 'origin/next') !== 0) {
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: `green commit ${green.slice(0, 10)} is not an ancestor of next`,
      release_mode: 'manual',
      target_sha: '',
    };
  }
  const greenVersion = versionAt(runner, green);
  if (greenVersion !== publishedVersion) {
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: `green commit ${green.slice(0, 10)} is at ${tagOf(greenVersion)}, not ${tagOf(publishedVersion)}`,
      release_mode: 'manual',
      target_sha: '',
    };
  }
  if (!fetchTag(runner, publishedVersion)) {
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: `${tagOf(publishedVersion)} has no git tag yet`,
      release_mode: 'manual',
      target_sha: '',
    };
  }

  const requestedMode =
    eventName === 'schedule'
      ? 'auto'
      : eventName === 'workflow_dispatch'
        ? inputMode || 'sync'
        : 'sync';
  const pr = versionPr(runner, repo);
  const prPinned = isPrPinnedToGreen(runner, pr, green);
  const changesets = unreleasedChangesetsAt(runner, green, publishedVersion);
  const commitsAhead = hasCommitsAhead(runner, green, publishedVersion);

  if (requestedMode === 'auto') {
    const decision = releaseDue({ now, repo, runner });
    if (decision.due) {
      return {
        action: 'version',
        allow_synthetic: 'false',
        auto_merge: 'true',
        published_version: publishedVersion,
        reason: decision.why,
        release_mode: 'auto',
        target_sha: green,
      };
    }
    if (changesets.length > 0 && !prPinned) {
      return {
        action: 'version',
        allow_synthetic: 'false',
        auto_merge: 'false',
        published_version: publishedVersion,
        reason: `not due (${decision.why}); syncing version PR to green tip ${green.slice(0, 10)}`,
        release_mode: 'manual',
        target_sha: green,
      };
    }
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: decision.why,
      release_mode: 'manual',
      target_sha: '',
    };
  }

  if (requestedMode === 'manual') {
    if (changesets.length === 0 && !commitsAhead) {
      return {
        action: 'noop',
        auto_merge: 'false',
        published_version: publishedVersion,
        reason: `green tip ${green.slice(0, 10)} has no commits ahead of ${tagOf(publishedVersion)}`,
        release_mode: 'manual',
        target_sha: '',
      };
    }
    return {
      action: 'version',
      allow_synthetic: 'true',
      auto_merge: 'true',
      published_version: publishedVersion,
      reason: `manual beta release from green tip ${green.slice(0, 10)}`,
      release_mode: 'manual',
      target_sha: green,
    };
  }

  if (prPinned) {
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: `version PR is already pinned to green tip ${green.slice(0, 10)}`,
      release_mode: 'manual',
      target_sha: '',
    };
  }
  if (changesets.length === 0 && !commitsAhead) {
    return {
      action: 'noop',
      auto_merge: 'false',
      published_version: publishedVersion,
      reason: `green tip ${green.slice(0, 10)} has no commits ahead of ${tagOf(publishedVersion)}`,
      release_mode: 'manual',
      target_sha: '',
    };
  }
  return {
    action: 'version',
    allow_synthetic: 'true',
    auto_merge: 'false',
    published_version: publishedVersion,
    reason: `syncing version PR to green tip ${green.slice(0, 10)}`,
    release_mode: 'manual',
    target_sha: green,
  };
}

const listWorkspacePackages = (cwd) => {
  const packagesDir = join(cwd, 'packages');
  const map = new Map();
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = join(packagesDir, entry.name);
    const pkgPath = join(dir, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (pkg.name) map.set(pkg.name, { dir, pkg });
  }
  return map;
};

const configureBotGitUser = (runner) => {
  runner.git('config', 'user.name', BOT_NAME);
  runner.git('config', 'user.email', BOT_EMAIL);
};

const remoteUrl = (repo, token) =>
  token ? `https://x-access-token:${token}@github.com/${repo}.git` : 'origin';

const runStreaming = (command, args, { cwd, env }) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf-8',
    env,
    maxBuffer: 64 << 20,
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
};

export function runBetaVersion({
  env = process.env,
  runner = makeRunner(),
} = {}) {
  const repo = env.GITHUB_REPOSITORY || REPO;
  const token = env.GH_TOKEN || env.GITHUB_TOKEN || '';
  const targetSha = env.TARGET_SHA || runner.git('rev-parse', 'HEAD');
  const publishedVersion =
    env.PUBLISHED_VERSION || versionAt(runner, targetSha);
  const allowSynthetic = env.ALLOW_SYNTHETIC === 'true';

  if (runner.git('rev-parse', 'HEAD') !== targetSha) {
    throw new Error(
      `Expected HEAD to be green tip ${targetSha}, found ${runner.git('rev-parse', 'HEAD')}.`
    );
  }

  fetchTag(runner, publishedVersion);
  const pendingChangesets = unreleasedChangesetsAt(
    runner,
    targetSha,
    publishedVersion
  );
  if (pendingChangesets.length === 0) {
    if (
      !allowSynthetic ||
      !hasCommitsAhead(runner, targetSha, publishedVersion)
    ) {
      console.info(
        `No pending changesets on green tip ${targetSha.slice(0, 10)}; skipping version PR.`
      );
      setOutputs({ headSha: '', pullRequestNumber: '' }, env.GITHUB_OUTPUT);
      return 0;
    }
    const syntheticPath = join(
      runner.cwd,
      '.changeset',
      `beta-${targetSha.slice(0, 10)}.md`
    );
    writeFileSync(
      syntheticPath,
      `---\n'${PACKAGE}': patch\n---\n\nShip [every change on \`next\` since \`${publishedVersion}\`](https://github.com/${repo}/compare/${tagOf(publishedVersion)}...${targetSha}).\n`
    );
    console.info(
      `Added ${syntheticPath} for green tip ${targetSha.slice(0, 10)}.`
    );
  }

  if (
    runner.sh('git', ['rev-parse', '--verify', '--quiet', 'refs/heads/main'])
      .status !== 0 &&
    runner.sh('git', [
      'rev-parse',
      '--verify',
      '--quiet',
      'refs/remotes/origin/main',
    ]).status === 0
  ) {
    runner.git('branch', 'main', 'origin/main');
  }
  const prepared = runStreaming(
    process.execPath,
    ['tooling/scripts/prepare-release-changesets.mjs'],
    { cwd: runner.cwd, env }
  );
  if (prepared.status !== 0) return prepared.status ?? 1;

  const beforeVersions = new Map(
    [...listWorkspacePackages(runner.cwd)].map(([name, info]) => [
      name,
      info.pkg.version,
    ])
  );

  runner.git('checkout', '-B', VERSION_BRANCH);
  const versioned = runStreaming('pnpm', ['ci:version'], {
    cwd: runner.cwd,
    env,
  });
  if (versioned.status !== 0) return versioned.status ?? 1;

  const afterPackages = listWorkspacePackages(runner.cwd);
  const changedPackages = [];
  for (const [name, info] of afterPackages) {
    if (info.pkg.version === beforeVersions.get(name)) continue;
    const changelogPath = join(info.dir, 'CHANGELOG.md');
    const changelog = existsSync(changelogPath)
      ? readFileSync(changelogPath, 'utf-8')
      : '';
    changedPackages.push({
      content: extractChangelogSection(changelog, info.pkg.version),
      name,
      private: Boolean(info.pkg.private),
      version: info.pkg.version,
    });
  }
  if (changedPackages.length === 0) {
    console.info('No package versions changed; skipping version PR.');
    setOutputs({ headSha: '', pullRequestNumber: '' }, env.GITHUB_OUTPUT);
    return 0;
  }
  changedPackages.sort((a, b) => a.name.localeCompare(b.name));
  const nextVersion =
    changedPackages.find((pkg) => pkg.name === PACKAGE)?.version ??
    changedPackages[0].version;

  configureBotGitUser(runner);
  runner.git('add', '-A');
  runner.git(
    'commit',
    '-m',
    '[Release] Version packages (beta)',
    '-m',
    `Green-Tip: ${targetSha}`
  );
  runner.git(
    'push',
    '--force',
    remoteUrl(repo, token),
    `HEAD:${VERSION_BRANCH}`
  );

  const prTitle = '[Release] Version packages (beta)';
  const prBody = buildVersionPrBody({
    changedPackages: changedPackages.filter((pkg) => !pkg.private),
    greenSha: targetSha,
    version: nextVersion,
  });
  const bodyFile = join(env.RUNNER_TEMP || '/tmp', 'beta-version-pr-body.md');
  writeFileSync(bodyFile, prBody);

  const existingPr = versionPr(runner, repo);
  let prNumber;
  if (existingPr) {
    prNumber = String(existingPr.number);
    runner.out('gh', [
      'pr',
      'edit',
      prNumber,
      '--repo',
      repo,
      '--title',
      prTitle,
      '--body-file',
      bodyFile,
    ]);
  } else {
    const createdUrl = runner.out('gh', [
      'pr',
      'create',
      '--repo',
      repo,
      '--base',
      'next',
      '--head',
      VERSION_BRANCH,
      '--title',
      prTitle,
      '--body-file',
      bodyFile,
    ]);
    prNumber = /(\d+)\s*$/u.exec(createdUrl)?.[1] ?? '';
    if (!prNumber) {
      throw new Error(`Could not parse PR number from: ${createdUrl}`);
    }
  }

  const syncScript = join(
    runner.cwd,
    'tooling/scripts/sync-version-package-releases.mjs'
  );
  if (existsSync(syncScript)) {
    const synced = runStreaming(
      process.execPath,
      [syncScript, '--pr', prNumber, '--from', 'v49'],
      { cwd: runner.cwd, env }
    );
    if (synced.status !== 0) return synced.status ?? 1;
    const releaseIndex = 'apps/www/src/generated/release-index.json';
    const dirty = runner.git(
      'status',
      '--porcelain',
      '--untracked-files=all',
      '--',
      releaseIndex
    );
    if (dirty) {
      runner.git('add', releaseIndex);
      runner.git('commit', '--amend', '--no-edit');
      runner.git(
        'push',
        '--force',
        remoteUrl(repo, token),
        `HEAD:${VERSION_BRANCH}`
      );
    }
  }

  const headSha = runner.git('rev-parse', 'HEAD');
  setOutputs({ headSha, pullRequestNumber: prNumber }, env.GITHUB_OUTPUT);
  console.info(
    `Updated Version Packages PR #${prNumber} at ${headSha.slice(0, 10)} (green tip ${targetSha.slice(0, 10)}).`
  );
  return 0;
}

const ensureNpmAuth = (env) => {
  if (!env.NPM_TOKEN || !env.HOME) return;
  const npmrcPath = join(env.HOME, '.npmrc');
  const authLine = `//registry.npmjs.org/:_authToken=${env.NPM_TOKEN}\n`;
  if (existsSync(npmrcPath)) {
    const content = readFileSync(npmrcPath, 'utf-8');
    if (/^\s*\/\/registry\.npmjs\.org\/:[_-]authToken=/im.test(content)) return;
    appendFileSync(npmrcPath, `\n${authLine}`);
    return;
  }
  writeFileSync(npmrcPath, authLine);
};

export function runBetaPublish({
  env = process.env,
  runner = makeRunner(),
} = {}) {
  configureBotGitUser(runner);
  ensureNpmAuth(env);
  const result = runStreaming('pnpm', ['ci:release'], {
    cwd: runner.cwd,
    env: { ...env, PLATE_RELEASE_CHANNEL: 'beta' },
  });
  const packages = parsePublishedTags(result.stdout ?? '');
  const published = packages.length > 0;
  setOutputs(
    {
      published: published ? 'true' : 'false',
      publishedPackages: JSON.stringify(packages),
    },
    env.GITHUB_OUTPUT
  );
  if (result.status !== 0) return result.status ?? 1;
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const [command] = process.argv.slice(2);
  try {
    if (command === 'plan') {
      const plan = planBetaRelease();
      setOutputs(plan);
      console.info(JSON.stringify(plan, null, 2));
      process.exitCode = 0;
    } else if (command === 'version') {
      process.exitCode = runBetaVersion();
    } else if (command === 'publish') {
      process.exitCode = runBetaPublish();
    } else {
      console.error(USAGE);
      process.exitCode = 2;
    }
  } catch (error) {
    console.error(`beta-release-ci ${command}: ${error.message}`);
    process.exitCode = 1;
  }
}
