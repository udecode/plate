#!/usr/bin/env node

import { appendFile, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const repo = 'udecode/plate';
const packageRoots = [
  path.join(repoRoot, 'packages'),
  path.join(repoRoot, 'packages', 'udecode'),
];
const semverPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const releaseTypeHeadingPattern =
  /^###\s+(Major|Minor|Patch) Changes[^\S\r\n]*$/gm;
const nextVersionHeadingPattern = /^##\s+/m;
const packageHeadingPattern = /^## `[^`]+`[^\S\r\n]*$/gm;
const changeHeadingPattern = /^###\s+(Major|Minor|Patch) Changes[^\S\r\n]*$/gm;
const changelogLinkPattern =
  /For detailed changes, see \[`CHANGELOG`\]\([^)]+\)/g;
const pullRequestLinkPattern = /\[#\d+\]\(https:\/\/github\.com\/[^)]+\)/g;
const commitLinkPattern =
  /\[`[0-9a-f]{7,40}`\]\(https:\/\/github\.com\/udecode\/plate\/commit\/[0-9a-f]{7,40}\)/g;
const bulletEntryPattern = /^-\s+/gm;
const migrationPattern = /\bMigration\b/g;
const contributorPattern =
  /by \[@([A-Za-z0-9-]+)\]\(https:\/\/github\.com\/[^)]+\)/g;
const contributorHandlePattern = /(?:^|[\s,])@([A-Za-z0-9-]+)(?=$|[\s,.;)])/gm;
const contributorsHeadingPattern = /^## Contributors[^\n]*\n/m;
const headingBoundaryPattern = /\n##\s+/;
const releaseTypes = ['major', 'minor', 'patch'];
const releaseTypeLabels = {
  major: 'Major',
  minor: 'Minor',
  patch: 'Patch',
};

if (isMainModule()) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    console.error(error?.message ?? error);
    process.exit(1);
  }
}

function isMainModule() {
  const entrypoint = process.argv[1];

  return (
    !!entrypoint && path.resolve(entrypoint) === fileURLToPath(import.meta.url)
  );
}

async function main(args) {
  if (args[0] === 'validate') {
    const [, rawPath, finalPath] = args;

    if (!rawPath || !finalPath) {
      throw new Error('Usage: release-notes.mjs validate <raw> <final>');
    }

    const result = await validateAiReleaseNotesFiles(rawPath, finalPath);

    if (!result.valid) {
      for (const error of result.errors) {
        console.warn(`::warning::${error}`);
      }

      await rm(finalPath, { force: true });
      return;
    }

    console.log('AI release notes passed validation.');
    return;
  }

  const publishedPackages = parsePublishedPackages(
    process.env.PUBLISHED_PACKAGES ?? process.env.PUBLISHED_PACKAGES_JSON ?? ''
  );
  const version = getGlobalReleaseVersion(publishedPackages);

  if (!version) {
    throw new Error('No published package version found.');
  }

  const workspacePackages = await getWorkspacePackages();
  const body = await generateRawReleaseNotes({
    commitRef: process.env.GITHUB_SHA ?? 'main',
    publishedPackages,
    workspacePackages,
  });
  const rawFile = path.join(repoRoot, `.release-notes-raw-${version}.md`);

  await writeFile(rawFile, body);
  await setOutput('version', version);
  await setOutput('raw_changelog_path', rawFile);

  console.log(`Wrote raw release notes to ${rawFile}`);
}

export function parsePublishedPackages(publishedPackagesJson) {
  try {
    const publishedPackages = JSON.parse(publishedPackagesJson || '[]');

    return Array.isArray(publishedPackages) ? publishedPackages : [];
  } catch {
    return [];
  }
}

export function getGlobalReleaseVersion(publishedPackages) {
  return publishedPackages
    .map((publishedPackage) => publishedPackage?.version)
    .filter((version) => typeof version === 'string')
    .filter((version) => semverPattern.test(version))
    .sort(compareVersionsDesc)[0];
}

export async function getWorkspacePackages(roots = packageRoots) {
  const workspacePackages = new Map();

  for (const root of roots) {
    let entries;

    try {
      entries = await readdir(root, { withFileTypes: true });
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const directory = path.join(root, entry.name);
      const packageJson = await readPackageJson(directory);

      if (packageJson?.name) {
        workspacePackages.set(packageJson.name, {
          directory,
          packageJson,
        });
      }
    }
  }

  return workspacePackages;
}

export async function generateRawReleaseNotes({
  commitRef,
  publishedPackages,
  workspacePackages,
}) {
  const lines = [];
  const contributors = new Set();
  const packages = publishedPackages
    .filter(
      (publishedPackage) =>
        typeof publishedPackage?.name === 'string' &&
        typeof publishedPackage?.version === 'string'
    )
    .sort(
      (a, b) =>
        compareVersionsDesc(a.version, b.version) ||
        a.name.localeCompare(b.name)
    );

  for (const publishedPackage of packages) {
    const workspacePackage = workspacePackages.get(publishedPackage.name);
    const changelog = workspacePackage
      ? await readOptionalFile(
          path.join(workspacePackage.directory, 'CHANGELOG.md')
        )
      : null;
    const releaseChanges = changelog
      ? extractReleaseChanges(changelog, publishedPackage.version)
      : null;

    lines.push(`## \`${publishedPackage.name}\``);
    lines.push('');

    if (releaseChanges) {
      lines.push(releaseChanges.body);
      collectContributors(contributors, releaseChanges.body);
    } else {
      lines.push(
        `Published \`${publishedPackage.name}@${publishedPackage.version}\`.`
      );
    }

    lines.push('');

    if (workspacePackage) {
      const changelogUrl = packageToChangelogUrl(
        workspacePackage.directory,
        commitRef
      );

      lines.push(`For detailed changes, see [\`CHANGELOG\`](${changelogUrl})`);
      lines.push('');
    }
  }

  if (contributors.size > 0) {
    lines.push('## Contributors');
    lines.push('');
    lines.push('Thanks to everyone who contributed to this release:');
    lines.push('');
    lines.push(
      [...contributors]
        .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
        .map((contributor) => `@${contributor}`)
        .join(', ')
    );
    lines.push('');
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

export function extractReleaseChanges(changelog, version) {
  const versionSection = extractVersionSection(changelog, version);

  if (!versionSection) return null;

  const sections = extractReleaseTypeSections(versionSection);

  if (sections.length === 0) return null;

  return {
    body: sections
      .map(
        (section) =>
          `### ${releaseTypeLabels[section.type]} Changes\n\n${section.body}`
      )
      .join('\n\n'),
    type: sections[0].type,
  };
}

export function validateAiReleaseNotes(raw, final) {
  const errors = [];
  const rawPackageHeadings = matchAll(raw, packageHeadingPattern);
  const finalPackageHeadings = matchAll(final, packageHeadingPattern);
  const rawChangeHeadings = matchAll(raw, changeHeadingPattern);
  const finalChangeHeadings = matchAll(final, changeHeadingPattern);
  const rawChangelogLinks = matchAll(raw, changelogLinkPattern);
  const finalChangelogLinks = matchAll(final, changelogLinkPattern);
  const rawPullRequestLinks = matchAll(raw, pullRequestLinkPattern);
  const finalPullRequestLinks = matchAll(final, pullRequestLinkPattern);
  const rawCommitLinks = matchAll(raw, commitLinkPattern);
  const finalCommitLinks = matchAll(final, commitLinkPattern);
  const rawContributorsSection = getContributorsSection(raw);
  const finalContributorsSection = getContributorsSection(final);
  const didDropContributorsSection =
    rawContributorsSection.trim().length > 0 &&
    finalContributorsSection.trim().length === 0;
  const missingSectionContributors = didDropContributorsSection
    ? []
    : extractContributorSectionHandles(rawContributorsSection).filter(
        (handle) => !hasContributorHandle(finalContributorsSection, handle)
      );
  const missingContributors = extractContributorHandles(raw).filter(
    (handle) => !hasContributorHandle(final, handle)
  );

  if (final.trim().length === 0) {
    errors.push('AI output is empty.');
  }

  if (!sameList(rawPackageHeadings, finalPackageHeadings)) {
    errors.push('AI output changed package headings.');
  }

  if (!sameList(rawChangeHeadings, finalChangeHeadings)) {
    errors.push('AI output changed change-type headings.');
  }

  if (!sameList(rawChangelogLinks, finalChangelogLinks)) {
    errors.push('AI output changed package changelog links.');
  }

  if (!sameList(rawPullRequestLinks, finalPullRequestLinks)) {
    errors.push('AI output changed PR links.');
  }

  if (!sameList(rawCommitLinks, finalCommitLinks)) {
    errors.push('AI output changed commit links.');
  }

  if (
    countMatches(final, bulletEntryPattern) !==
    countMatches(raw, bulletEntryPattern)
  ) {
    errors.push('AI output changed release entry count.');
  }

  if (
    countMatches(final, migrationPattern) < countMatches(raw, migrationPattern)
  ) {
    errors.push('AI output dropped migration notes.');
  }

  if (didDropContributorsSection) {
    errors.push('AI output dropped Contributors section.');
  }

  if (missingContributors.length > 0 || missingSectionContributors.length > 0) {
    errors.push('AI output dropped contributors.');
  }

  return {
    errors,
    valid: errors.length === 0,
  };
}

async function validateAiReleaseNotesFiles(rawPath, finalPath) {
  const [raw, final] = await Promise.all([
    readFile(rawPath, 'utf8'),
    readFile(finalPath, 'utf8'),
  ]);

  return validateAiReleaseNotes(raw, final);
}

function extractVersionSection(changelog, version) {
  const versionHeadingPattern = new RegExp(
    `^##\\s+${escapeRegExp(version)}(?:\\s|$).*`,
    'm'
  );
  const match = versionHeadingPattern.exec(changelog);

  if (!match) return null;

  const bodyStart = match.index + match[0].length;
  const rest = changelog.slice(bodyStart);
  const nextMatch = rest.match(nextVersionHeadingPattern);
  const bodyEnd =
    nextMatch?.index === undefined
      ? changelog.length
      : bodyStart + nextMatch.index;

  return changelog.slice(bodyStart, bodyEnd);
}

function extractReleaseTypeSections(content) {
  const matches = [...content.matchAll(releaseTypeHeadingPattern)];

  return matches
    .map((match, index) => {
      const bodyStart = match.index + match[0].length;
      const nextMatch = matches[index + 1];
      const bodyEnd = nextMatch?.index ?? content.length;
      const body = content.slice(bodyStart, bodyEnd).trim();

      if (!body) return null;

      return {
        body,
        type: match[1].toLowerCase(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => compareReleaseTypes(a.type, b.type));
}

function packageToChangelogUrl(directory, commitRef) {
  const relativePath = path.relative(
    repoRoot,
    path.join(directory, 'CHANGELOG.md')
  );

  return `https://github.com/${repo}/blob/${commitRef}/${relativePath}`;
}

async function readPackageJson(directory) {
  const content = await readOptionalFile(path.join(directory, 'package.json'));

  return content ? JSON.parse(content) : null;
}

async function readOptionalFile(filePath) {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function collectContributors(contributors, content) {
  for (const match of content.matchAll(contributorPattern)) {
    contributors.add(match[1]);
  }
}

function collectContributorSectionHandles(contributors, content) {
  for (const match of content.matchAll(contributorHandlePattern)) {
    contributors.add(match[1]);
  }
}

function extractContributorHandles(content) {
  const contributors = new Set();

  collectContributors(contributors, content);
  collectContributorSectionHandles(
    contributors,
    getContributorsSection(content)
  );

  return [...contributors];
}

function extractContributorSectionHandles(content) {
  const contributors = new Set();

  collectContributorSectionHandles(contributors, content);

  return [...contributors];
}

function getContributorsSection(content) {
  const match = contributorsHeadingPattern.exec(content);

  if (!match) return '';

  const sectionStart = match.index + match[0].length;
  const rest = content.slice(sectionStart);
  const nextHeading = headingBoundaryPattern.exec(rest);

  return rest.slice(0, nextHeading?.index ?? rest.length);
}

function hasContributorHandle(content, handle) {
  const escapedHandle = escapeRegExp(handle);

  return new RegExp(
    `(?:^|[^A-Za-z0-9_/-])@${escapedHandle}\\b|github\\.com/${escapedHandle}\\b`,
    'm'
  ).test(content);
}

function compareVersionsDesc(a, b) {
  const parsedA = parseVersion(a);
  const parsedB = parseVersion(b);

  for (let index = 0; index < 3; index++) {
    const delta = parsedB.parts[index] - parsedA.parts[index];

    if (delta !== 0) return delta;
  }

  if (parsedA.prerelease && !parsedB.prerelease) return 1;
  if (!parsedA.prerelease && parsedB.prerelease) return -1;

  return parsedB.prerelease.localeCompare(parsedA.prerelease);
}

function parseVersion(version) {
  const [core, prerelease = ''] = version.split('-');

  return {
    parts: core.split('.').map(Number),
    prerelease,
  };
}

function compareReleaseTypes(a, b) {
  return releaseTypes.indexOf(a) - releaseTypes.indexOf(b);
}

function matchAll(content, pattern) {
  return [...content.matchAll(pattern)].map((match) => match[0]);
}

function countMatches(content, pattern) {
  return matchAll(content, pattern).length;
}

function sameList(left, right) {
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;

  await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}
