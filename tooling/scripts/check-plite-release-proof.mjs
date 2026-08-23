#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import extractZip from 'extract-zip';

export const PLITE_RELEASE_READY_LANES = [
  'browser-chromium',
  'browser-firefox',
  'browser-mobile',
  'browser-mobile-webkit',
  'browser-webkit',
  'extension-runtime-contracts',
  'integration-local',
  'kernel-authority-contracts',
  'package-release',
  'persistent-browser-soak',
  'public-hard-cut-contracts',
  'raw-mobile',
  'react-core-performance',
  'read-update-runtime-contracts',
  'typecheck-lint',
];
export const PLITE_RELEASE_PROOF_WORKFLOW_PATH =
  '.github/workflows/plite-ci.yml';
export const PLITE_RELEASE_PROOF_EVENT = 'workflow_dispatch';
export const PLITE_RELEASE_PROOF_REPOSITORY = 'udecode/plate';
export const PLITE_RELEASE_PROOF_ARTIFACT_NAME = 'plite-release-proof';
const GITHUB_API_URL = 'https://api.github.com';
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

const isRecord = (value) => typeof value === 'object' && value !== null;
const isGitCommit = (value) =>
  typeof value === 'string' && /^[\da-f]{40}$/i.test(value);
const isSha256 = (value) =>
  typeof value === 'string' && /^[\da-f]{64}$/i.test(value);
const isTimestamp = (value) =>
  typeof value === 'string' && Number.isFinite(Date.parse(value));
const isNonemptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;
const isPositiveInteger = (value) =>
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const isRunId = (value) =>
  (isPositiveInteger(value) ||
    (typeof value === 'string' && /^\d+$/.test(value) && Number(value) > 0)) &&
  Number.isSafeInteger(Number(value));

const commitsMatch = (left, right) =>
  isGitCommit(left) &&
  isGitCommit(right) &&
  left.toLowerCase() === right.toLowerCase();

const parseArguments = (argv) => {
  const values = new Map();
  const allowedArguments = new Set([
    '--expected-commit',
    '--producer-run-id',
    '--profile',
  ]);
  let fromEnv = false;

  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];

    if (argument === '--from-env') {
      fromEnv = true;
      continue;
    }
    if (!argument.startsWith('--')) {
      throw new Error(`Unexpected argument: ${argument}`);
    }
    if (!allowedArguments.has(argument)) {
      throw new Error(`Unexpected argument: ${argument}`);
    }

    const value = argv[index + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`${argument} requires a value`);
    }

    values.set(argument, value);
    index += 1;
  }

  return { fromEnv, values };
};

/** Resolve the optional release-claim gate from CLI arguments or CI input. */
export const resolvePliteReleaseProofRequest = ({
  argv = process.argv.slice(2),
  env = process.env,
} = {}) => {
  const { fromEnv, values } = parseArguments(argv);

  if (fromEnv) {
    const profile = env.PLITE_RELEASE_CLAIM_PROFILE?.trim();

    if (!profile) return { mode: 'package-only' };

    return {
      expectedCommit:
        env.PLITE_RELEASE_EXPECTED_COMMIT?.trim() || env.GITHUB_SHA?.trim(),
      mode: 'claim',
      producerRunId: env.PLITE_RELEASE_PROOF_RUN_ID?.trim(),
      profile,
    };
  }

  return {
    expectedCommit: values.get('--expected-commit'),
    mode: 'claim',
    producerRunId: values.get('--producer-run-id'),
    profile: values.get('--profile'),
  };
};

/** Prove that the release inputs are exactly the declared Git commit. */
export const validatePliteReleaseCheckout = ({
  declaredCommit,
  headCommit,
  statusOutput,
}) => {
  const issues = [];

  if (!isGitCommit(declaredCommit)) {
    issues.push('Declared release commit must be a 40-character Git commit');
  }
  if (!isGitCommit(headCommit)) {
    issues.push('Release checkout HEAD must be a 40-character Git commit');
  }
  if (
    isGitCommit(declaredCommit) &&
    isGitCommit(headCommit) &&
    !commitsMatch(declaredCommit, headCommit)
  ) {
    issues.push(
      `Declared release commit ${declaredCommit} does not match checkout ${headCommit}`
    );
  }
  if (typeof statusOutput !== 'string') {
    issues.push('Release checkout status is unavailable');
  } else if (statusOutput.trim()) {
    issues.push(
      `Release checkout contains tracked or untracked changes:\n${statusOutput.trim()}`
    );
  }

  return { issues, ok: issues.length === 0 };
};

/** Validate the GitHub Actions run that owns a release-proof artifact. */
export const validatePliteReleaseProofRun = ({
  expectedCommit,
  expectedRunId,
  run,
  workflow,
}) => {
  const issues = [];

  if (!isGitCommit(expectedCommit)) {
    issues.push('Expected commit must be a 40-character Git commit');
  }
  if (!isRunId(expectedRunId)) {
    issues.push('Expected producer run ID must be a positive integer');
  }
  if (!isRecord(run)) {
    return {
      issues: [...issues, 'Producer run metadata is missing'],
      ok: false,
    };
  }
  if (!isRunId(run.id) || String(run.id) !== String(expectedRunId)) {
    issues.push(
      `Producer run ${String(run.id)} does not match ${String(expectedRunId)}`
    );
  }
  if (
    !isRecord(run.repository) ||
    run.repository.full_name !== PLITE_RELEASE_PROOF_REPOSITORY
  ) {
    issues.push(
      `Producer run repository ${String(isRecord(run.repository) ? run.repository.full_name : undefined)} is not authoritative`
    );
  }
  if (
    !isRecord(run.head_repository) ||
    run.head_repository.full_name !== PLITE_RELEASE_PROOF_REPOSITORY
  ) {
    issues.push('Producer run head repository is not authoritative');
  }
  if (!commitsMatch(run.head_sha, expectedCommit)) {
    issues.push(
      `Producer run commit ${String(run.head_sha)} does not match ${String(expectedCommit)}`
    );
  }
  if (run.status !== 'completed' || run.conclusion !== 'success') {
    issues.push('Producer run did not complete successfully');
  }
  if (run.event !== PLITE_RELEASE_PROOF_EVENT) {
    issues.push(
      `Producer run event ${String(run.event)} is not ${PLITE_RELEASE_PROOF_EVENT}`
    );
  }
  if (!isPositiveInteger(run.run_attempt)) {
    issues.push('Producer run attempt is missing');
  }
  if (!isRecord(workflow)) {
    return {
      issues: [...issues, 'Producer workflow metadata is missing'],
      ok: false,
    };
  }
  if (!isPositiveInteger(run.workflow_id) || run.workflow_id !== workflow.id) {
    issues.push('Producer run does not belong to the resolved workflow');
  }
  if (workflow.path !== PLITE_RELEASE_PROOF_WORKFLOW_PATH) {
    issues.push(
      `Producer workflow ${String(workflow.path)} is not authoritative`
    );
  }

  return { issues, ok: issues.length === 0 };
};

/** Select the one immutable bundle emitted by the authoritative producer run. */
export const resolvePliteReleaseProofArtifact = ({
  expectedCommit,
  expectedRunId,
  payload,
}) => {
  const issues = [];

  if (!isRecord(payload) || !Array.isArray(payload.artifacts)) {
    return {
      issues: ['Producer artifact metadata is missing'],
      ok: false,
    };
  }

  const artifacts = payload.artifacts.filter(
    (artifact) =>
      isRecord(artifact) && artifact.name === PLITE_RELEASE_PROOF_ARTIFACT_NAME
  );

  if (payload.total_count !== 1 || artifacts.length !== 1) {
    issues.push(
      `Producer run must contain exactly one ${PLITE_RELEASE_PROOF_ARTIFACT_NAME} artifact`
    );

    return { issues, ok: false };
  }

  const [artifact] = artifacts;

  if (!isPositiveInteger(artifact.id)) {
    issues.push('Producer artifact ID is missing');
  }
  if (!isPositiveInteger(artifact.size_in_bytes)) {
    issues.push('Producer artifact is empty or has no size');
  }
  if (artifact.expired !== false) {
    issues.push('Producer artifact is expired');
  }
  if (
    typeof artifact.digest !== 'string' ||
    !/^sha256:[\da-f]{64}$/i.test(artifact.digest)
  ) {
    issues.push('Producer artifact is missing its GitHub SHA-256 digest');
  }

  const workflowRun = artifact.workflow_run;

  if (!isRecord(workflowRun)) {
    issues.push('Producer artifact is missing workflow-run identity');
  } else {
    if (
      !isRunId(workflowRun.id) ||
      String(workflowRun.id) !== String(expectedRunId)
    ) {
      issues.push(
        `Producer artifact run ${String(workflowRun.id)} does not match ${String(expectedRunId)}`
      );
    }
    if (!commitsMatch(workflowRun.head_sha, expectedCommit)) {
      issues.push(
        `Producer artifact commit ${String(workflowRun.head_sha)} does not match ${String(expectedCommit)}`
      );
    }
    if (
      !isPositiveInteger(workflowRun.repository_id) ||
      workflowRun.repository_id !== workflowRun.head_repository_id
    ) {
      issues.push('Producer artifact head repository is not authoritative');
    }
  }

  return {
    ...(issues.length === 0 ? { artifact } : {}),
    issues,
    ok: issues.length === 0,
  };
};

const readGitHubJson = async ({ fetchImpl, path, token }) => {
  const response = await fetchImpl(`${GITHUB_API_URL}${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'plate-plite-release-proof',
      'x-github-api-version': '2022-11-28',
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub release-proof lookup failed with HTTP ${response.status}`
    );
  }

  return response.json();
};

const validateArchiveEntry = (entry, seenEntries) => {
  if (!isRecord(entry) || !isNonemptyString(entry.fileName)) {
    throw new Error('Release proof archive contains an unnamed entry');
  }

  const entryName = entry.fileName;

  if (
    entryName.includes('\\') ||
    entryName.includes('\0') ||
    entryName.startsWith('/') ||
    /^[A-Za-z]:/.test(entryName) ||
    entryName.split('/').includes('..')
  ) {
    throw new Error(`Release proof archive contains unsafe path ${entryName}`);
  }

  const canonicalName = entryName.replace(/\/+$/, '');

  if (!canonicalName || seenEntries.has(canonicalName)) {
    throw new Error(
      `Release proof archive contains duplicate or empty path ${entryName}`
    );
  }
  seenEntries.add(canonicalName);

  const mode = (Number(entry.externalFileAttributes) >>> 16) & 0xff_ff;
  const fileType = mode & 0o17_0000;

  if (fileType === 0o12_0000) {
    throw new Error(`Release proof archive contains symlink ${entryName}`);
  }
  if (![0, 0o04_0000, 0o10_0000].includes(fileType)) {
    throw new Error(`Release proof archive contains special file ${entryName}`);
  }
};

/** Download the producer-selected bundle and verify GitHub's archive digest. */
export const downloadPliteReleaseProofBundle = async ({
  artifact,
  extractZipImpl = extractZip,
  fetchImpl = globalThis.fetch,
  githubToken,
}) => {
  if (
    !isRecord(artifact) ||
    !isPositiveInteger(artifact.id) ||
    typeof artifact.digest !== 'string' ||
    !/^sha256:[\da-f]{64}$/i.test(artifact.digest)
  ) {
    throw new Error('Cannot download an invalid producer artifact');
  }
  if (!isNonemptyString(githubToken)) {
    throw new Error('GitHub token is required to download release proof');
  }
  if (typeof fetchImpl !== 'function') {
    throw new Error('GitHub artifact download is unavailable');
  }

  const temporaryDirectory = mkdtempSync(
    join(tmpdir(), 'plite-release-proof-')
  );
  const archivePath = join(temporaryDirectory, 'proof.zip');
  const bundleDirectory = join(temporaryDirectory, 'bundle');

  try {
    const [owner, repository] = PLITE_RELEASE_PROOF_REPOSITORY.split('/');
    const response = await fetchImpl(
      `${GITHUB_API_URL}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions/artifacts/${artifact.id}/zip`,
      {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${githubToken}`,
          'user-agent': 'plate-plite-release-proof',
          'x-github-api-version': '2022-11-28',
        },
        redirect: 'follow',
      }
    );

    if (!response.ok) {
      throw new Error(
        `GitHub release-proof download failed with HTTP ${response.status}`
      );
    }

    const archive = Buffer.from(await response.arrayBuffer());
    const expectedDigest = artifact.digest.slice('sha256:'.length);
    const actualDigest = createHash('sha256').update(archive).digest('hex');

    if (actualDigest.toLowerCase() !== expectedDigest.toLowerCase()) {
      throw new Error('Downloaded release-proof archive digest does not match');
    }

    writeFileSync(archivePath, archive);
    mkdirSync(bundleDirectory, { recursive: true });
    const seenEntries = new Set();

    await extractZipImpl(archivePath, {
      dir: bundleDirectory,
      onEntry: (entry) => validateArchiveEntry(entry, seenEntries),
    });

    const manifestPath = join(bundleDirectory, 'manifest.json');

    if (!existsSync(manifestPath)) {
      throw new Error(
        'Downloaded release-proof artifact is missing manifest.json'
      );
    }

    return { manifestPath, temporaryDirectory };
  } catch (error) {
    rmSync(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }
};

/** Resolve and validate the authoritative GitHub Actions producer run. */
export const verifyPliteReleaseProofProducer = async ({
  expectedCommit,
  expectedRunId,
  fetchImpl = globalThis.fetch,
  githubToken,
}) => {
  const issues = [];

  if (!isNonemptyString(githubToken)) {
    issues.push('PLITE_RELEASE_PROOF_GITHUB_TOKEN or GITHUB_TOKEN is required');
  }
  if (!isRunId(expectedRunId)) {
    issues.push('Expected producer run ID must be a positive integer');
  }
  if (typeof fetchImpl !== 'function') {
    issues.push('GitHub producer lookup is unavailable');
  }
  if (issues.length > 0) return { issues, ok: false };

  const [owner, repository] = PLITE_RELEASE_PROOF_REPOSITORY.split('/');
  const basePath = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}/actions`;
  const run = await readGitHubJson({
    fetchImpl,
    path: `${basePath}/runs/${expectedRunId}`,
    token: githubToken,
  });
  const workflow = await readGitHubJson({
    fetchImpl,
    path: `${basePath}/workflows/${run.workflow_id}`,
    token: githubToken,
  });
  const producer = validatePliteReleaseProofRun({
    expectedCommit,
    expectedRunId,
    run,
    workflow,
  });

  if (!producer.ok) return producer;

  const artifacts = await readGitHubJson({
    fetchImpl,
    path: `${basePath}/runs/${expectedRunId}/artifacts?name=${encodeURIComponent(PLITE_RELEASE_PROOF_ARTIFACT_NAME)}&per_page=100`,
    token: githubToken,
  });

  const artifact = resolvePliteReleaseProofArtifact({
    expectedCommit,
    expectedRunId,
    payload: artifacts,
  });

  return artifact.ok ? { ...artifact, runAttempt: run.run_attempt } : artifact;
};

/** Validate release-ready lane coverage and exact source identity. */
export const validatePliteReleaseProofManifest = ({
  expectedCommit,
  expectedProducerRunAttempt,
  expectedProducerRunId,
  manifest,
  profile,
}) => {
  const issues = [];

  if (profile !== 'release-ready') {
    issues.push(
      `Unsupported Plite release claim profile: ${profile ?? '<missing>'}`
    );
  }
  if (!isGitCommit(expectedCommit)) {
    issues.push('Expected commit must be a 40-character Git commit');
  }
  if (!isRunId(expectedProducerRunId)) {
    issues.push('Expected producer run ID must be a positive integer');
  }
  if (!isPositiveInteger(expectedProducerRunAttempt)) {
    issues.push('Expected producer run attempt must be a positive integer');
  }
  if (!isRecord(manifest) || manifest.schemaVersion !== 1) {
    return {
      issues: [...issues, 'Release proof manifest must use schemaVersion 1'],
      ok: false,
    };
  }
  if (manifest.profile !== profile) {
    issues.push(
      `Release proof manifest profile ${String(manifest.profile)} does not match ${String(profile)}`
    );
  }
  if (!commitsMatch(manifest.commit, expectedCommit)) {
    issues.push(
      `Release proof manifest commit ${String(manifest.commit)} does not match ${String(expectedCommit)}`
    );
  }
  if (!isTimestamp(manifest.createdAt)) {
    issues.push(
      'Release proof manifest is missing a valid createdAt timestamp'
    );
  }
  const { producer } = manifest;

  if (!isRecord(producer)) {
    issues.push('Release proof manifest is missing producer identity');
  } else {
    if (
      !isRunId(producer.runId) ||
      String(producer.runId) !== String(expectedProducerRunId)
    ) {
      issues.push(
        `Release proof producer run ${String(producer.runId)} does not match ${String(expectedProducerRunId)}`
      );
    }
    if (
      !isPositiveInteger(producer.runAttempt) ||
      producer.runAttempt !== expectedProducerRunAttempt
    ) {
      issues.push(
        `Release proof producer attempt ${String(producer.runAttempt)} does not match ${String(expectedProducerRunAttempt)}`
      );
    }
    if (producer.repository !== PLITE_RELEASE_PROOF_REPOSITORY) {
      issues.push(
        `Release proof producer repository ${String(producer.repository)} is not authoritative`
      );
    }
    if (producer.workflowPath !== PLITE_RELEASE_PROOF_WORKFLOW_PATH) {
      issues.push(
        `Release proof producer workflow ${String(producer.workflowPath)} is not authoritative`
      );
    }
    if (producer.event !== PLITE_RELEASE_PROOF_EVENT) {
      issues.push(
        `Release proof producer event ${String(producer.event)} is not authoritative`
      );
    }
  }
  if (!Array.isArray(manifest.lanes)) {
    return {
      issues: [...issues, 'Release proof manifest must contain a lanes array'],
      ok: false,
    };
  }

  const requiredLanes = new Set(PLITE_RELEASE_READY_LANES);
  const seenLanes = new Set();

  for (const [index, lane] of manifest.lanes.entries()) {
    if (!isRecord(lane)) {
      issues.push(`Release proof lane ${index} must be an object`);
      continue;
    }

    const { id } = lane;
    const label = isNonemptyString(id) ? id : `lane ${index}`;

    if (!isNonemptyString(id) || !requiredLanes.has(id)) {
      issues.push(`Unsupported release-ready proof lane: ${String(id)}`);
      continue;
    }
    if (seenLanes.has(id)) {
      issues.push(`Duplicate release-ready proof lane: ${id}`);
    }
    seenLanes.add(id);

    if (lane.status !== 'passed') {
      issues.push(`${label} did not pass`);
    }
    if (!commitsMatch(lane.commit, expectedCommit)) {
      issues.push(`${label} does not prove commit ${String(expectedCommit)}`);
    }
    if (!isTimestamp(lane.capturedAt)) {
      issues.push(`${label} is missing a valid capturedAt timestamp`);
    }
    if (!isNonemptyString(lane.command)) {
      issues.push(`${label} is missing its proof command`);
    }

    const { environment } = lane;

    if (
      !isRecord(environment) ||
      !isNonemptyString(environment.os) ||
      !isNonemptyString(environment.arch) ||
      !isNonemptyString(environment.runtime)
    ) {
      issues.push(`${label} is missing os, arch, or runtime identity`);
    }
    if (id === 'raw-mobile') {
      const devices = isRecord(environment) ? environment.devices : undefined;

      if (!Array.isArray(devices)) {
        issues.push(`${label} is missing raw-device identity`);
      } else {
        for (const [platform, osName, browserName] of [
          ['android-chrome', 'Android', 'Chrome'],
          ['ios-safari', 'iOS', 'Safari'],
        ]) {
          const device = devices.find(
            (candidate) =>
              isRecord(candidate) && candidate.platform === platform
          );

          if (
            !isRecord(device) ||
            device.realDevice !== true ||
            device.directAppium !== true ||
            device.osName !== osName ||
            device.browserName !== browserName ||
            !isNonemptyString(device.deviceName) ||
            !isNonemptyString(device.model) ||
            !isNonemptyString(device.osVersion) ||
            !isNonemptyString(device.browserVersion)
          ) {
            issues.push(
              `${label} is missing direct ${platform} device identity`
            );
          }
        }
      }
    }
    if (
      id === 'persistent-browser-soak' &&
      (!isRecord(environment) ||
        environment.persistentProfile !== true ||
        !isNonemptyString(environment.profileName) ||
        !isNonemptyString(environment.browserName) ||
        !isNonemptyString(environment.browserVersion))
    ) {
      issues.push(`${label} is missing persistent browser profile identity`);
    }
    if (!Array.isArray(lane.artifacts) || lane.artifacts.length === 0) {
      issues.push(`${label} is missing artifact pointers`);
      continue;
    }

    for (const [artifactIndex, artifact] of lane.artifacts.entries()) {
      const artifactLabel = `${label} artifact ${artifactIndex}`;

      if (!isRecord(artifact) || !isNonemptyString(artifact.path)) {
        issues.push(`${artifactLabel} is missing a path`);
      }
      if (!isRecord(artifact) || !isSha256(artifact.sha256)) {
        issues.push(`${artifactLabel} is missing a SHA-256 digest`);
      }
    }
  }

  for (const lane of PLITE_RELEASE_READY_LANES) {
    if (!seenLanes.has(lane)) {
      issues.push(`Missing release-ready proof lane: ${lane}`);
    }
  }

  return { issues, ok: issues.length === 0 };
};

const digestFile = (path) =>
  new Promise((resolveDigest, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolveDigest(hash.digest('hex')));
  });

const isPathInside = (root, target) => {
  const pathFromRoot = relative(root, target);

  return (
    pathFromRoot !== '' &&
    pathFromRoot !== '..' &&
    !pathFromRoot.startsWith(`..${sep}`) &&
    !isAbsolute(pathFromRoot)
  );
};

/** Read every referenced artifact and verify its path and digest. */
export const verifyPliteReleaseProofArtifacts = async ({
  manifest,
  manifestPath,
}) => {
  const issues = [];

  if (!isRecord(manifest) || !Array.isArray(manifest.lanes)) {
    return {
      issues: ['Cannot verify artifacts from an invalid manifest'],
      ok: false,
    };
  }

  const artifactRoot = realpathSync(dirname(manifestPath));

  for (const lane of manifest.lanes) {
    if (!isRecord(lane) || !Array.isArray(lane.artifacts)) continue;

    for (const [index, artifact] of lane.artifacts.entries()) {
      if (
        !isRecord(artifact) ||
        !isNonemptyString(artifact.path) ||
        !isSha256(artifact.sha256)
      ) {
        continue;
      }

      const label = `${String(lane.id)} artifact ${index}`;

      if (isAbsolute(artifact.path)) {
        issues.push(`${label} path must be relative to the manifest`);
        continue;
      }

      const unresolvedPath = resolve(artifactRoot, artifact.path);

      if (!existsSync(unresolvedPath)) {
        issues.push(`${label} is missing at ${artifact.path}`);
        continue;
      }

      const artifactPath = realpathSync(unresolvedPath);

      if (!isPathInside(artifactRoot, artifactPath)) {
        issues.push(`${label} escapes the release proof bundle`);
        continue;
      }
      if (!statSync(artifactPath).isFile()) {
        issues.push(`${label} is not a file`);
        continue;
      }

      const actualDigest = await digestFile(artifactPath);

      if (actualDigest.toLowerCase() !== artifact.sha256.toLowerCase()) {
        issues.push(`${label} digest does not match ${artifact.path}`);
      }
    }
  }

  return { issues, ok: issues.length === 0 };
};

const run = async () => {
  const request = resolvePliteReleaseProofRequest();

  if (request.mode === 'package-only') {
    console.log(
      '[plite-release-proof] package-only publication selected; behavioral release proof is not claimed'
    );
    return;
  }
  if (!request.expectedCommit) {
    throw new Error(
      'PLITE_RELEASE_EXPECTED_COMMIT, GITHUB_SHA, or --expected-commit is required'
    );
  }
  if (!request.producerRunId) {
    throw new Error(
      'PLITE_RELEASE_PROOF_RUN_ID or --producer-run-id is required'
    );
  }
  const githubToken =
    process.env.PLITE_RELEASE_PROOF_GITHUB_TOKEN?.trim() ||
    process.env.GITHUB_TOKEN?.trim();

  if (!isNonemptyString(githubToken)) {
    throw new Error(
      'Plite release proof failed:\n- PLITE_RELEASE_PROOF_GITHUB_TOKEN or GITHUB_TOKEN is required'
    );
  }
  const currentCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf-8',
  }).trim();
  const checkout = validatePliteReleaseCheckout({
    declaredCommit: request.expectedCommit,
    headCommit: currentCommit,
    statusOutput: execFileSync(
      'git',
      ['status', '--porcelain=v1', '--untracked-files=all'],
      {
        cwd: repoRoot,
        encoding: 'utf-8',
      }
    ),
  });

  if (!checkout.ok) {
    throw new Error(
      `Plite release proof failed:\n${checkout.issues.map((issue) => `- ${issue}`).join('\n')}`
    );
  }

  const producer = await verifyPliteReleaseProofProducer({
    expectedCommit: currentCommit,
    expectedRunId: request.producerRunId,
    githubToken,
  });

  if (!producer.ok) {
    throw new Error(
      `Plite release proof failed:\n${producer.issues.map((issue) => `- ${issue}`).join('\n')}`
    );
  }

  const bundle = await downloadPliteReleaseProofBundle({
    artifact: producer.artifact,
    githubToken,
  });

  try {
    const manifest = JSON.parse(readFileSync(bundle.manifestPath, 'utf-8'));
    const structural = validatePliteReleaseProofManifest({
      expectedCommit: currentCommit,
      expectedProducerRunAttempt: producer.runAttempt,
      expectedProducerRunId: request.producerRunId,
      manifest,
      profile: request.profile,
    });
    const artifacts = structural.ok
      ? await verifyPliteReleaseProofArtifacts({
          manifest,
          manifestPath: bundle.manifestPath,
        })
      : { issues: [], ok: false };
    const issues = [...structural.issues, ...artifacts.issues];

    if (issues.length > 0) {
      throw new Error(
        `Plite release proof failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`
      );
    }
  } finally {
    rmSync(bundle.temporaryDirectory, { force: true, recursive: true });
  }

  console.log(
    `[plite-release-proof] ${PLITE_RELEASE_READY_LANES.length} release-ready proof lanes passed for ${request.expectedCommit}`
  );
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
