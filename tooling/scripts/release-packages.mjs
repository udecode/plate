#!/usr/bin/env node

import { existsSync, renameSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  readBetaPreState,
  validateBetaPreState,
} from './guard-beta-pre-release.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const prePath = path.join(repoRoot, '.changeset/pre.json');
const hiddenPrePath = path.join(
  repoRoot,
  '.changeset/pre.json.beta-publish-backup'
);

export function resolveReleaseChannel({
  argv = process.argv.slice(2),
  env = process.env,
} = {}) {
  const channelIndex = argv.indexOf('--channel');

  if (channelIndex !== -1) {
    return argv[channelIndex + 1] ?? '';
  }

  const inlineChannel = argv.find((arg) => arg.startsWith('--channel='));

  if (inlineChannel) {
    return inlineChannel.slice('--channel='.length);
  }

  if (env.PLATE_RELEASE_CHANNEL) {
    return env.PLATE_RELEASE_CHANNEL;
  }

  if (env.GITHUB_REF_NAME === 'next') {
    return 'beta';
  }

  return 'latest';
}

export function getReleasePlan(channel) {
  if (channel === 'beta') {
    return {
      build: ['pnpm', ['build']],
      hidePreStateForPublish: true,
      publish: ['pnpm', ['changeset', 'publish', '--tag', 'beta']],
    };
  }

  if (channel === 'latest' || channel === 'main' || channel === '') {
    return {
      release: ['pnpm', ['release']],
    };
  }

  throw new Error(`Unsupported release channel: ${channel}`);
}

function runBetaRelease() {
  validateBetaPreState(readBetaPreState());

  runCommand('pnpm', ['build']);

  // Changesets rejects --tag in pre mode, but without it only-pre packages
  // can publish prereleases to latest. Hide pre state only for publish.
  withHiddenPreState(() => {
    runCommand('pnpm', ['changeset', 'publish', '--tag', 'beta']);
  });
}

function withHiddenPreState(callback) {
  if (existsSync(hiddenPrePath)) {
    throw new Error(
      `${hiddenPrePath} already exists. Remove the stale backup before publishing.`
    );
  }

  renameSync(prePath, hiddenPrePath);

  try {
    callback();
  } finally {
    if (existsSync(hiddenPrePath)) {
      renameSync(hiddenPrePath, prePath);
    }
  }
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} exited with ${result.status}`
    );
  }
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}

if (isMainModule()) {
  try {
    const channel = resolveReleaseChannel();

    getReleasePlan(channel);

    if (channel === 'beta') {
      runBetaRelease();
    } else {
      runCommand('pnpm', ['release']);
    }
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exit(1);
  }
}
