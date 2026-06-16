#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
export const mainToNextSyncCommitMessage = 'chore: sync main to next';
export const mainToNextSyncSkipReleaseCommitMessage =
  'chore: sync main to next [skip release]';
const newlinePattern = /\r?\n/;
const shellSafeArgPattern = /^[A-Za-z0-9_./:=@-]+$/;
const stableVersionPattern = /^\d+\.\d+\.\d+$/;
const semverPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;
const conflictMarkerPattern = /^(?:<<<<<<<|=======|>>>>>>>)(?:\s|$)/m;
const packageDirectoryPattern = /^(packages\/(?:udecode\/)?[^/]+)\//;
const packageScopePattern = /^@/;
const numericIdentifierPattern = /^\d+$/;
const nonPackageFilenameCharacterPattern = /[^a-zA-Z0-9]+/g;
const surroundingHyphenPattern = /^-+|-+$/g;
const whitespacePattern = /\s+/;
const mainToNextSyncChangesetPrefix = 'auto-main-to-next-sync-';
const dependencyFieldNames = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

export function getStableVersion(version) {
  const stableVersion = String(version ?? '').split('-')[0];

  if (!stableVersionPattern.test(stableVersion)) {
    throw new Error(`Invalid package version: ${JSON.stringify(version)}`);
  }

  return stableVersion;
}

export function buildPromotePullRequest({ version }) {
  const stableVersion = getStableVersion(version);

  return {
    base: 'main',
    body: [
      `Promotes v${stableVersion} from beta to stable.`,
      '',
      'Merging this PR publishes Plate packages to npm with the `latest` tag.',
      '',
      '**Merge with `Create a merge commit`**. Do not squash or rebase; this is required for branch ancestry, not a style preference. If GitHub shows multiple merge buttons, choose `Create a merge commit`.',
      '',
      'After this PR lands:',
      '',
      '1. Wait for `release.yml` on `main`.',
      '2. Run the `release-lanes` autogoal workflow to sync `main` directly into `next`, re-enter beta when needed, and verify the beta lane.',
      '3. Do not wait for a generated `main -> next` sync PR; release-lanes owns that deterministic metadata repair loop.',
    ].join('\n'),
    head: 'next',
    title: `chore: promote v${stableVersion} to stable`,
  };
}

function formatVersionList(versions) {
  return versions.map((version) => `\`${version}\``).join(', ');
}

export function formatMainToNextSyncResolutionReport(report) {
  const decisions = [];

  for (const item of report.packageManifests ?? []) {
    const name = item.packageName ? ` (${item.packageName})` : '';

    decisions.push(
      `- \`${item.file}\`${name}: kept next/beta version \`${item.keptVersion}\` over main/stable \`${item.mainVersion}\`.`
    );
  }

  for (const item of report.preJsonFiles ?? []) {
    decisions.push(`- \`${item.file}\`: kept next beta pre-release state.`);
  }

  for (const item of report.changelogs ?? []) {
    const pieces = [];

    if (item.insertedStableVersions.length > 0) {
      pieces.push(
        `inserted stable sections ${formatVersionList(item.insertedStableVersions)}`
      );
    }

    if (item.refreshedStableVersions.length > 0) {
      pieces.push(
        `refreshed stable sections ${formatVersionList(item.refreshedStableVersions)} from main`
      );
    }

    decisions.push(
      `- \`${item.file}\`: ${pieces.length > 0 ? pieces.join('; ') : 'kept existing changelog order'}.`
    );
  }

  if (decisions.length === 0) {
    decisions.push(
      '- No release metadata conflicts required automatic resolution.'
    );
  }

  const checks =
    report.checks && report.checks.length > 0
      ? report.checks
      : [
          'no conflict markers in resolved release metadata',
          'next/beta package versions preserved',
          'stable changelog sections inserted deterministically',
          'package manifests checked for unexpected third-state edits',
        ];

  return [
    '## Automated release metadata resolution',
    '',
    ...decisions,
    '',
    '### Verification',
    '',
    ...checks.map((check) => `- ${check}`),
  ].join('\n');
}

function run(command, args, { allowFailure = false, capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0 && !allowFailure) {
    throw new Error(
      `${command} ${args.join(' ')} exited with ${result.status}`
    );
  }

  return capture ? result.stdout.trim() : '';
}

function logDryRun(command, args) {
  console.log(`dry-run: ${command} ${args.map(formatArg).join(' ')}`);
}

function formatArg(arg) {
  if (shellSafeArgPattern.test(arg)) {
    return arg;
  }

  return JSON.stringify(arg);
}

function runGh(args, { capture = false, dryRun = false } = {}) {
  if (dryRun) {
    logDryRun('gh', args);
    return '';
  }

  return run('gh', args, { capture });
}

function runGit(
  args,
  { allowFailure = false, capture = false, dryRun = false } = {}
) {
  if (dryRun) {
    logDryRun('git', args);
    return '';
  }

  return run('git', args, { allowFailure, capture });
}

function runPnpm(args, { dryRun = false } = {}) {
  if (dryRun) {
    logDryRun('pnpm', args);
    return;
  }

  run('pnpm', args);
}

function runGitProcess(args) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function requireRepository(env) {
  const repository = env.GITHUB_REPOSITORY;

  if (!repository) {
    throw new Error('GITHUB_REPOSITORY is required.');
  }

  return repository;
}

function readGitStage(stage, file) {
  return runGit(['show', `:${stage}:${file}`], { capture: true });
}

function writeRepoFile(file, content) {
  writeFileSync(
    path.join(repoRoot, file),
    content.endsWith('\n') ? content : `${content}\n`
  );
}

function readRepoJson(file) {
  return JSON.parse(readFileSync(path.join(repoRoot, file), 'utf8'));
}

function readRepoJsonIfExists(file) {
  const absolutePath = path.join(repoRoot, file);

  if (!existsSync(absolutePath)) return null;

  return JSON.parse(readFileSync(absolutePath, 'utf8'));
}

function normalizeText(content) {
  return `${String(content).replace(/\r\n/g, '\n').trimEnd()}\n`;
}

function assertNoConflictMarkers(file, content) {
  if (conflictMarkerPattern.test(content)) {
    throw new Error(`${file} still contains merge conflict markers.`);
  }
}

function getUnmergedFiles() {
  const output = runGit(['diff', '--name-only', '--diff-filter=U'], {
    capture: true,
  });

  return output.split(newlinePattern).filter(Boolean);
}

function assertCleanWorktreeForDirectSync({ dryRun = false } = {}) {
  if (dryRun) return;

  const status = runGit(['status', '--porcelain', '--untracked-files=all'], {
    capture: true,
  });

  if (!status) return;

  throw new Error(
    [
      'Direct main -> next sync requires a clean worktree before mutating next.',
      'Commit, stash, or move local changes first:',
      status,
    ].join('\n')
  );
}

function isPackageManifest(file) {
  return file === 'package.json' || file.endsWith('/package.json');
}

function isChangelog(file) {
  return file.endsWith('/CHANGELOG.md') || file === 'CHANGELOG.md';
}

function isMainToNextMetadataFile(file) {
  return (
    isPackageManifest(file) ||
    isChangelog(file) ||
    file === '.changeset/pre.json'
  );
}

function getWorkspacePackageDir(file) {
  const match = file.match(packageDirectoryPattern);

  return match?.[1] ?? null;
}

function getWorkspacePackageDirs() {
  const rootPackageJson = readRepoJson('package.json');
  const workspacePatterns = rootPackageJson.workspaces;
  const packageDirs = [];

  if (!Array.isArray(workspacePatterns)) {
    throw new Error('Root package.json must define workspaces.');
  }

  for (const pattern of workspacePatterns) {
    if (!pattern.endsWith('/*')) {
      throw new Error(`Unsupported workspace pattern: ${pattern}`);
    }

    const baseDir = pattern.slice(0, -2);
    const absoluteBaseDir = path.join(repoRoot, baseDir);

    if (!existsSync(absoluteBaseDir)) continue;

    for (const entry of readdirSync(absoluteBaseDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const packageDir = `${baseDir}/${entry.name}`;

      if (existsSync(path.join(repoRoot, packageDir, 'package.json'))) {
        packageDirs.push(packageDir);
      }
    }
  }

  return packageDirs.sort();
}

export function getMainToNextChangedPackages(files) {
  const packageNames = new Set();

  for (const file of files) {
    const packageDir = getWorkspacePackageDir(file);

    if (!packageDir) continue;

    const packageJsonPath = `${packageDir}/package.json`;
    const absolutePackageJsonPath = path.join(repoRoot, packageJsonPath);

    if (!existsSync(absolutePackageJsonPath)) continue;

    const packageJson = readRepoJson(packageJsonPath);

    if (packageJson.private) continue;
    if (typeof packageJson.name !== 'string') continue;

    packageNames.add(packageJson.name);
  }

  return [...packageNames].sort();
}

export function createMainToNextBetaPreState() {
  const initialVersions = {};

  for (const packageDir of getWorkspacePackageDirs()) {
    const packageJson = readRepoJson(`${packageDir}/package.json`);

    if (
      typeof packageJson.name !== 'string' ||
      typeof packageJson.version !== 'string'
    ) {
      continue;
    }

    initialVersions[packageJson.name] = packageJson.version;
  }

  return {
    mode: 'pre',
    tag: 'beta',
    initialVersions,
    changesets: [],
  };
}

export function validateMainToNextBetaPreState(preState) {
  if (preState?.mode !== 'pre') {
    throw new Error(
      `next must be in active Changesets pre-release mode before direct sync, found ${JSON.stringify(preState?.mode ?? null)}.`
    );
  }

  if (preState?.tag !== 'beta') {
    throw new Error(
      `next must use the beta pre-release tag before direct sync, found ${JSON.stringify(preState?.tag ?? null)}.`
    );
  }
}

function ensureMainToNextBetaPreMode() {
  const existingPreState = readRepoJsonIfExists('.changeset/pre.json');

  if (existingPreState) {
    validateMainToNextBetaPreState(existingPreState);
    return { action: 'kept' };
  }

  writeRepoFile(
    '.changeset/pre.json',
    JSON.stringify(createMainToNextBetaPreState(), null, 2)
  );

  return { action: 'created' };
}

export function createMainToNextSyncChangesetContent(packageName) {
  return `---\n"${packageName}": patch\n---\n\nSynced latest changes from \`main\` into the beta lane.\n`;
}

function getMainToNextSyncChangesetFilename(packageName) {
  const safeName = packageName
    .replace(packageScopePattern, '')
    .replace(nonPackageFilenameCharacterPattern, '-')
    .replace(surroundingHyphenPattern, '')
    .toLowerCase();

  return `${mainToNextSyncChangesetPrefix}${safeName}.md`;
}

export function getMainToNextSyncChangesetFiles(packageNames) {
  return packageNames.map(
    (packageName) =>
      `.changeset/${getMainToNextSyncChangesetFilename(packageName)}`
  );
}

function cleanupMainToNextSyncChangesets() {
  const changesetDir = path.join(repoRoot, '.changeset');

  if (!existsSync(changesetDir)) return;

  for (const entry of readdirSync(changesetDir, { withFileTypes: true })) {
    if (
      entry.isFile() &&
      entry.name.startsWith(mainToNextSyncChangesetPrefix) &&
      entry.name.endsWith('.md')
    ) {
      rmSync(path.join(changesetDir, entry.name));
    }
  }
}

function writeMainToNextSyncChangesets(packageNames) {
  cleanupMainToNextSyncChangesets();

  if (packageNames.length === 0) return [];

  const changesetDir = path.join(repoRoot, '.changeset');
  const files = getMainToNextSyncChangesetFiles(packageNames);

  mkdirSync(changesetDir, { recursive: true });

  for (const [index, packageName] of packageNames.entries()) {
    const file = files[index];
    writeRepoFile(file, createMainToNextSyncChangesetContent(packageName));
  }

  return files;
}

function normalizePackageForVersionOnlyCompare(packageJson) {
  return JSON.stringify({
    ...packageJson,
    version: '__plate_sync_version__',
  });
}

function normalizePackageForVersionAndDependenciesCompare(packageJson) {
  const normalized = {
    ...packageJson,
    version: '__plate_sync_version__',
  };

  for (const field of dependencyFieldNames) {
    delete normalized[field];
  }

  return JSON.stringify(normalized);
}

function getWorkspacePackageNames() {
  return new Set(
    getWorkspacePackageDirs()
      .map((packageDir) => readRepoJson(`${packageDir}/package.json`).name)
      .filter((name) => typeof name === 'string')
  );
}

function validateVersionedDependencyChanges({ oursJson, resolvedJson }) {
  const workspacePackageNames = getWorkspacePackageNames();
  const invalidChanges = [];

  for (const field of dependencyFieldNames) {
    const oursDependencies = oursJson[field] ?? {};
    const resolvedDependencies = resolvedJson[field] ?? {};
    const dependencyNames = new Set([
      ...Object.keys(oursDependencies),
      ...Object.keys(resolvedDependencies),
    ]);

    for (const dependencyName of dependencyNames) {
      if (
        oursDependencies[dependencyName] ===
        resolvedDependencies[dependencyName]
      ) {
        continue;
      }

      if (!workspacePackageNames.has(dependencyName)) {
        invalidChanges.push(`${field}.${dependencyName}`);
      }
    }
  }

  if (invalidChanges.length > 0) {
    throw new Error(
      `Package manifest beta versioning changed non-workspace dependencies: ${invalidChanges.join(', ')}.`
    );
  }
}

export function resolvePackageManifestForMainToNextSync({ ours, theirs }) {
  const oursJson = JSON.parse(ours);
  const theirsJson = JSON.parse(theirs);

  if (
    typeof oursJson.version !== 'string' ||
    typeof theirsJson.version !== 'string'
  ) {
    throw new Error('Package manifest conflict does not include versions.');
  }

  if (
    normalizePackageForVersionOnlyCompare(oursJson) !==
    normalizePackageForVersionOnlyCompare(theirsJson)
  ) {
    throw new Error(
      'Package manifest conflict changed fields other than version.'
    );
  }

  return `${JSON.stringify(oursJson, null, 2)}\n`;
}

function recordPackageManifestResolution({ file, ours, report, theirs }) {
  const oursJson = JSON.parse(ours);
  const theirsJson = JSON.parse(theirs);

  report.packageManifests.push({
    file,
    keptVersion: oursJson.version,
    mainVersion: theirsJson.version,
    packageName: oursJson.name,
  });
}

function parseSemver(version) {
  const match = version.match(semverPattern);

  if (!match) return null;

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    pre: match[4] ?? '',
  };
}

function comparePrerelease(left, right) {
  const leftParts = left.split('.');
  const rightParts = right.split('.');
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index++) {
    const leftPart = leftParts[index];
    const rightPart = rightParts[index];

    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    if (leftPart === rightPart) continue;

    const leftNumber = numericIdentifierPattern.test(leftPart)
      ? Number(leftPart)
      : null;
    const rightNumber = numericIdentifierPattern.test(rightPart)
      ? Number(rightPart)
      : null;

    if (leftNumber !== null && rightNumber !== null) {
      return Math.sign(leftNumber - rightNumber);
    }

    if (leftNumber !== null) return -1;
    if (rightNumber !== null) return 1;

    return leftPart < rightPart ? -1 : 1;
  }

  return 0;
}

function compareSemver(left, right) {
  const leftVersion = parseSemver(left);
  const rightVersion = parseSemver(right);

  if (!leftVersion || !rightVersion) {
    throw new Error(
      `Cannot compare invalid semver versions: ${left}, ${right}`
    );
  }

  for (const key of ['major', 'minor', 'patch']) {
    if (leftVersion[key] !== rightVersion[key]) {
      return Math.sign(leftVersion[key] - rightVersion[key]);
    }
  }

  if (leftVersion.pre === rightVersion.pre) return 0;
  if (!leftVersion.pre) return 1;
  if (!rightVersion.pre) return -1;

  return comparePrerelease(leftVersion.pre, rightVersion.pre);
}

function parseChangelog(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const sectionMatches = [...normalized.matchAll(/^##\s+(.+?)\s*$/gm)];

  if (sectionMatches.length === 0) {
    return {
      header: normalized.trimEnd(),
      sections: [],
    };
  }

  const header = normalized.slice(0, sectionMatches[0].index).trimEnd();
  const sections = sectionMatches.map((match, index) => {
    const start = match.index;
    const end =
      index + 1 < sectionMatches.length
        ? sectionMatches[index + 1].index
        : normalized.length;
    const version = match[1].trim().replace(/^`|`$/g, '');

    return {
      index,
      raw: normalized.slice(start, end).trimEnd(),
      version,
    };
  });

  return { header, sections };
}

function isStableChangelogSection(section) {
  const version = parseSemver(section.version);

  return !!version && !version.pre;
}

function collectStableChangelogInsertions({ oursVersions, theirsSections }) {
  const sectionsByAnchorVersion = new Map();
  const pendingSections = [];
  for (const section of theirsSections) {
    if (!isStableChangelogSection(section)) continue;

    if (!oursVersions.has(section.version)) {
      pendingSections.push(section);
      continue;
    }

    if (pendingSections.length > 0) {
      sectionsByAnchorVersion.set(section.version, [...pendingSections]);
      pendingSections.length = 0;
    }
  }

  return {
    sectionsByAnchorVersion,
    trailingSections: pendingSections,
  };
}

export function getMainToNextChangelogResolution({ ours, theirs }) {
  const oursChangelog = parseChangelog(ours);
  const theirsChangelog = parseChangelog(theirs);
  const oursVersions = new Set(
    oursChangelog.sections.map((section) => section.version)
  );
  const theirsByVersion = new Map(
    theirsChangelog.sections.map((section) => [section.version, section])
  );
  const stableInsertions = collectStableChangelogInsertions({
    oursVersions,
    theirsSections: theirsChangelog.sections,
  });
  const sections = [];
  const insertedStableVersions = [];
  const refreshedStableVersions = [];

  for (const section of oursChangelog.sections) {
    const sectionsToInsert = stableInsertions.sectionsByAnchorVersion.get(
      section.version
    );
    const theirsSection = theirsByVersion.get(section.version);

    if (sectionsToInsert) {
      sections.push(...sectionsToInsert);
      insertedStableVersions.push(
        ...sectionsToInsert.map((sectionToInsert) => sectionToInsert.version)
      );
    }

    if (
      theirsSection &&
      isStableChangelogSection(section) &&
      theirsSection.raw !== section.raw
    ) {
      refreshedStableVersions.push(section.version);
    }

    sections.push(
      theirsSection && isStableChangelogSection(section)
        ? theirsSection
        : section
    );
  }

  sections.push(...stableInsertions.trailingSections);
  insertedStableVersions.push(
    ...stableInsertions.trailingSections.map((section) => section.version)
  );

  const header = oursChangelog.header || theirsChangelog.header;

  return {
    content: `${header}\n\n${sections.map((section) => section.raw).join('\n\n')}\n`,
    insertedStableVersions,
    refreshedStableVersions,
  };
}

export function mergeChangelogsForMainToNextSync({ ours, theirs }) {
  return getMainToNextChangelogResolution({ ours, theirs }).content;
}

function createMainToNextResolutionReport() {
  return {
    changelogs: [],
    checks: [
      'no conflict markers in resolved release metadata',
      'next/beta package versions preserved',
      'stable changelog sections inserted deterministically',
      'package manifests checked for unexpected third-state edits',
    ],
    packageManifests: [],
    preJsonFiles: [],
  };
}

function resolveMainToNextMetadataConflict(file, report) {
  if (isPackageManifest(file)) {
    const ours = readGitStage(2, file);
    const theirs = readGitStage(3, file);

    writeRepoFile(
      file,
      resolvePackageManifestForMainToNextSync({ ours, theirs })
    );
    recordPackageManifestResolution({ file, ours, report, theirs });
    runGit(['add', file]);
    return true;
  }

  if (file === '.changeset/pre.json') {
    writeRepoFile(file, readGitStage(2, file));
    report.preJsonFiles.push({ file });
    runGit(['add', file]);
    return true;
  }

  if (isChangelog(file)) {
    const resolution = getMainToNextChangelogResolution({
      ours: readGitStage(2, file),
      theirs: readGitStage(3, file),
    });

    writeRepoFile(file, resolution.content);
    report.changelogs.push({
      file,
      insertedStableVersions: resolution.insertedStableVersions,
      refreshedStableVersions: resolution.refreshedStableVersions,
    });
    runGit(['add', file]);
    return true;
  }

  return false;
}

function resolveMainToNextMetadataConflicts() {
  const report = createMainToNextResolutionReport();
  const unmergedFiles = getUnmergedFiles();
  const unresolvedFiles = [];

  for (const file of unmergedFiles) {
    try {
      if (!resolveMainToNextMetadataConflict(file, report)) {
        unresolvedFiles.push(file);
      }
    } catch (error) {
      unresolvedFiles.push(`${file} (${error.message})`);
    }
  }

  if (unresolvedFiles.length > 0) {
    throw new Error(
      [
        'Manual main -> next sync conflict resolution required:',
        ...unresolvedFiles.map((file) => `- ${file}`),
      ].join('\n')
    );
  }

  const remainingFiles = getUnmergedFiles();

  if (remainingFiles.length > 0) {
    throw new Error(
      [
        'Manual main -> next sync conflict resolution required:',
        ...remainingFiles.map((file) => `- ${file}`),
      ].join('\n')
    );
  }

  return report;
}

function getGitCommitParents(commit) {
  const line = runGit(['rev-list', '--parents', '-n', '1', commit], {
    capture: true,
  });
  const [resolvedCommit, ...parents] = line
    .split(whitespacePattern)
    .filter(Boolean);

  return { parents, resolvedCommit };
}

function listGitDiffFiles(from, to) {
  const output = runGit(['diff', '--name-only', from, to], { capture: true });

  return output.split(newlinePattern).filter(Boolean);
}

function getGitMergeBase(left, right) {
  return runGit(['merge-base', left, right], { capture: true });
}

export function getMainToNextSyncMetadataFiles({
  mainChangedFiles,
  resolvedChangedFiles,
}) {
  return [
    ...new Set(
      [...mainChangedFiles, ...resolvedChangedFiles].filter(
        isMainToNextMetadataFile
      )
    ),
  ].sort();
}

export function getMainToNextSyncCommitMessage({ changesets = [] } = {}) {
  return changesets.length > 0
    ? mainToNextSyncCommitMessage
    : mainToNextSyncSkipReleaseCommitMessage;
}

function tryReadGitCommitFile(commit, file) {
  const result = runGitProcess(['show', `${commit}:${file}`]);

  if (result.status !== 0) {
    return null;
  }

  return result.stdout;
}

function isPrereleaseVersion(version) {
  return !!parseSemver(version)?.pre;
}

export function verifyMainToNextResolvedFile({ file, ours, resolved, theirs }) {
  assertNoConflictMarkers(file, resolved);

  if (isPackageManifest(file)) {
    const oursJson = JSON.parse(ours);
    const resolvedJson = JSON.parse(resolved);
    const theirsJson = JSON.parse(theirs);
    const resolvedAdvancedPrerelease =
      resolvedJson.name === oursJson.name &&
      resolvedJson.version !== oursJson.version &&
      isPrereleaseVersion(resolvedJson.version) &&
      compareSemver(resolvedJson.version, oursJson.version) > 0;

    if (resolvedJson.name !== oursJson.name) {
      throw new Error(
        `${file} changed package name from ${oursJson.name} to ${resolvedJson.name}.`
      );
    }

    if (
      resolvedJson.version !== oursJson.version &&
      !resolvedAdvancedPrerelease
    ) {
      throw new Error(
        `${file} downgraded next/beta version ${oursJson.version} to ${resolvedJson.version}.`
      );
    }

    const normalizedResolved =
      normalizePackageForVersionOnlyCompare(resolvedJson);
    const normalizedOurs = normalizePackageForVersionOnlyCompare(oursJson);
    const normalizedTheirs = normalizePackageForVersionOnlyCompare(theirsJson);

    if (
      normalizedResolved !== normalizedOurs &&
      normalizedResolved !== normalizedTheirs
    ) {
      if (!resolvedAdvancedPrerelease) {
        throw new Error(
          `${file} contains package manifest fields that match neither next nor main.`
        );
      }

      const normalizedVersionedResolved =
        normalizePackageForVersionAndDependenciesCompare(resolvedJson);
      const normalizedVersionedOurs =
        normalizePackageForVersionAndDependenciesCompare(oursJson);
      const normalizedVersionedTheirs =
        normalizePackageForVersionAndDependenciesCompare(theirsJson);

      if (
        normalizedVersionedResolved !== normalizedVersionedOurs &&
        normalizedVersionedResolved !== normalizedVersionedTheirs
      ) {
        throw new Error(
          `${file} contains package manifest fields outside beta versioning that match neither next nor main.`
        );
      }

      validateVersionedDependencyChanges({ oursJson, resolvedJson });
    }

    return {
      file,
      message: resolvedAdvancedPrerelease
        ? `advanced beta package version ${oursJson.version} to ${resolvedJson.version}`
        : `kept package version ${resolvedJson.version}`,
      type: 'package-manifest',
    };
  }

  if (file === '.changeset/pre.json') {
    if (normalizeText(resolved) !== normalizeText(ours)) {
      throw new Error(`${file} did not keep next beta pre-release state.`);
    }

    return {
      file,
      message: 'kept next beta pre-release state',
      type: 'pre-json',
    };
  }

  if (isChangelog(file)) {
    const expected = getMainToNextChangelogResolution({ ours, theirs });

    if (normalizeText(resolved) !== normalizeText(expected.content)) {
      const expectedStableSections = parseChangelog(
        expected.content
      ).sections.filter(isStableChangelogSection);
      const resolvedSectionsByVersion = new Map(
        parseChangelog(resolved).sections.map((section) => [
          section.version,
          section,
        ])
      );
      const missingOrChangedSections = expectedStableSections.filter(
        (section) =>
          normalizeText(resolvedSectionsByVersion.get(section.version)?.raw) !==
          normalizeText(section.raw)
      );

      if (missingOrChangedSections.length > 0) {
        throw new Error(
          `${file} does not match the deterministic main-to-next changelog merge.`
        );
      }

      return {
        file,
        insertedStableVersions: expected.insertedStableVersions,
        message:
          expected.insertedStableVersions.length > 0
            ? `verified versioned changelog with stable sections ${expected.insertedStableVersions.join(', ')}`
            : 'verified versioned changelog stable history',
        type: 'changelog',
      };
    }

    return {
      file,
      insertedStableVersions: expected.insertedStableVersions,
      message:
        expected.insertedStableVersions.length > 0
          ? `inserted stable sections ${expected.insertedStableVersions.join(', ')}`
          : 'verified changelog order',
      type: 'changelog',
    };
  }

  throw new Error(`${file} is not a supported main-to-next metadata file.`);
}

export function verifyMainToNextSyncMergeCommit({ commit = 'HEAD' } = {}) {
  const { parents, resolvedCommit } = getGitCommitParents(commit);

  if (parents.length < 2) {
    throw new Error(
      `${resolvedCommit} is not a merge commit; main -> next sync must preserve the main merge parent.`
    );
  }

  const [nextParent, mainParent] = parents;
  const mergeBase = getGitMergeBase(nextParent, mainParent);
  const files = getMainToNextSyncMetadataFiles({
    mainChangedFiles: listGitDiffFiles(mergeBase, mainParent),
    resolvedChangedFiles: listGitDiffFiles(nextParent, resolvedCommit),
  });
  const results = [];

  for (const file of files) {
    const ours = tryReadGitCommitFile(nextParent, file);
    const theirs = tryReadGitCommitFile(mainParent, file);
    const resolved = tryReadGitCommitFile(resolvedCommit, file);

    if (resolved) {
      assertNoConflictMarkers(file, resolved);
    }

    if (!ours || !theirs || !resolved) {
      continue;
    }

    results.push(
      verifyMainToNextResolvedFile({
        file,
        ours,
        resolved,
        theirs,
      })
    );
  }

  console.log('Main -> next sync metadata verification passed.');

  if (results.length === 0) {
    console.log('- No shared release metadata files needed verification.');
  } else {
    for (const result of results) {
      console.log(`- ${result.file}: ${result.message}`);
    }
  }

  return {
    files,
    mainParent,
    mergeBase,
    nextParent,
    resolvedCommit,
    results,
  };
}

export function createOrUpdatePromotePullRequest({
  dryRun = false,
  env = process.env,
  version,
} = {}) {
  const repository = requireRepository(env);
  const pullRequest = buildPromotePullRequest({ version });
  const existing = runGh(
    [
      'pr',
      'list',
      '--base',
      pullRequest.base,
      '--head',
      pullRequest.head,
      '--state',
      'open',
      '--repo',
      repository,
      '--json',
      'number',
      '--jq',
      '.[0].number // empty',
    ],
    { capture: true, dryRun }
  );

  if (existing) {
    runGh(
      [
        'pr',
        'edit',
        existing,
        '--repo',
        repository,
        '--title',
        pullRequest.title,
        '--body',
        pullRequest.body,
      ],
      { dryRun }
    );
    console.log(`Updated promote PR #${existing}.`);
    return { action: 'updated', number: existing };
  }

  runGh(
    [
      'pr',
      'create',
      '--base',
      pullRequest.base,
      '--head',
      pullRequest.head,
      '--repo',
      repository,
      '--title',
      pullRequest.title,
      '--body',
      pullRequest.body,
    ],
    { dryRun }
  );
  console.log('Created promote PR.');

  return { action: 'created' };
}

export function syncMainToNextDirect({
  dryRun = false,
  env = process.env,
  push = false,
} = {}) {
  runGit(['fetch', 'origin', 'main', 'next'], { dryRun });

  const aheadText = dryRun
    ? (env.PLATE_SYNC_AHEAD ?? '1')
    : runGit(['rev-list', '--count', 'origin/next..origin/main'], {
        capture: true,
      });
  const ahead = Number(aheadText);

  if (!Number.isInteger(ahead) || ahead < 0) {
    throw new Error(`Invalid main-to-next ahead count: ${aheadText}`);
  }

  if (ahead === 0) {
    console.log('No new commits to sync from main to next.');
    return { action: 'skipped', ahead };
  }

  assertCleanWorktreeForDirectSync({ dryRun });

  const mergeBase = getGitMergeBase('origin/next', 'origin/main');
  const mainChangedFiles = listGitDiffFiles(mergeBase, 'origin/main');
  const changedPackages = getMainToNextChangedPackages(mainChangedFiles);

  runGit(['config', 'user.name', 'github-actions[bot]'], { dryRun });
  runGit(
    [
      'config',
      'user.email',
      '41898282+github-actions[bot]@users.noreply.github.com',
    ],
    {
      dryRun,
    }
  );
  runGit(['checkout', '-B', 'next', 'origin/next'], { dryRun });
  runGit(['merge', '--no-ff', '--no-commit', 'origin/main'], {
    allowFailure: true,
    dryRun,
  });

  const resolutionReport = dryRun
    ? createMainToNextResolutionReport()
    : resolveMainToNextMetadataConflicts();
  const preMode = dryRun
    ? { action: 'dry-run' }
    : ensureMainToNextBetaPreMode();
  const changesets = dryRun
    ? getMainToNextSyncChangesetFiles(changedPackages)
    : writeMainToNextSyncChangesets(changedPackages);

  if (changesets.length > 0) {
    runPnpm(['ci:version'], { dryRun });
  }
  const commitMessage = getMainToNextSyncCommitMessage({ changesets });

  runGit(
    ['add', '.changeset', 'apps', 'packages', 'package.json', 'pnpm-lock.yaml'],
    {
      dryRun,
    }
  );
  runGit(['commit', '--allow-empty', '-m', commitMessage], { dryRun });

  if (!dryRun) {
    verifyMainToNextSyncMergeCommit({ commit: 'HEAD' });
  }

  if (push) {
    runGit(['push', 'origin', 'HEAD:next'], { dryRun });
    console.log(
      `Synced ${ahead} main commit(s) directly into next with ${changesets.length} beta changeset(s).`
    );

    return {
      action: dryRun ? 'dry-run' : 'pushed',
      ahead,
      changedPackages,
      changesets,
      preMode,
      resolutionReport,
    };
  }

  if (dryRun) {
    console.log(
      'Dry run: would ensure next is in beta pre-release mode in the sync commit.'
    );
    console.log(
      `Dry run: would sync ${ahead} main commit(s) into next. Re-run with --push to update origin/next.`
    );
  } else {
    console.log(
      `Created local main -> next sync commit for ${ahead} commit(s) with ${changesets.length} beta changeset(s). Re-run with --push to update origin/next.`
    );
  }

  return {
    action: dryRun ? 'dry-run' : 'committed',
    ahead,
    changedPackages,
    changesets,
    preMode,
    resolutionReport,
  };
}

function readOption(args, name) {
  const index = args.indexOf(name);

  if (index === -1) {
    const inline = args.find((arg) => arg.startsWith(`${name}=`));

    return inline ? inline.slice(name.length + 1) : undefined;
  }

  return args[index + 1];
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}

if (isMainModule()) {
  try {
    const [command, ...args] = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');

    if (command === 'promote') {
      createOrUpdatePromotePullRequest({
        dryRun,
        version: readOption(args, '--version'),
      });
    } else if (command === 'sync-main-to-next') {
      syncMainToNextDirect({ dryRun, push: args.includes('--push') });
    } else if (command === 'verify-main-to-next-sync') {
      verifyMainToNextSyncMergeCommit({
        commit: readOption(args, '--commit') ?? 'HEAD',
      });
    } else {
      throw new Error(
        'Usage: release-branch-prs.mjs <promote --version x.y.z | sync-main-to-next [--push] | verify-main-to-next-sync> [--dry-run]'
      );
    }
  } catch (error) {
    console.error(`::error::${error.message}`);
    process.exit(1);
  }
}
