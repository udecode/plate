#!/usr/bin/env node

import { execFile as execFileCallback } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const defaultOutputPath = 'apps/www/src/generated/release-index.json';
const githubRepo = 'udecode/plate';
const githubBaseUrl = `https://github.com/${githubRepo}`;
const versionPackagesTitlePattern =
  /^\[Release\] Version packages(?: \([^)]+\))?$/i;
const packageReleaseHeadingPattern =
  /^##\s+(?<packageName>.+)@(?<version>\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)[^\S\r\n]*$/gm;
const releaseTypeHeadingPattern =
  /^###\s+(Major|Minor|Patch) Changes[^\S\r\n]*$/gm;
const releaseSectionHeadingPattern =
  /^###\s+(?<type>Major|Minor|Patch) Changes[^\S\r\n]*$/gm;
const releaseIntroPattern = /^#\s+Releases[^\S\r\n]*$/m;
const listIndentPattern = /^-\s{3}/gm;
const continuationLinePattern = /^\s{2,}\S/;
const generatedFooterPattern =
  /\n*(?:For detailed changes, see \[`CHANGELOG`\]\([^)]+\)(?:\n\nThanks to [\s\S]*?)?(?:\n\nFull changelog: \[`[^`]+`\]\([^)]+\))?|\[`CHANGELOG`\]\([^)]+\)(?:\s+·\s+\[`[^`]+`\]\([^)]+\))?(?:\s+·\s+(?:Thanks to|By) [^\n]+)?|\[`v[^`]+`\]\([^)]+\)(?:\s+·\s+(?:Thanks to|By) [^\n]+)?)\s*$/;
const changesetChangeLinePattern =
  /^-\s+\[(?<changeLabel>#\d+|`[0-9a-f]{7,40}`)\]\((?<changeUrl>[^)]+)\)\s+by\s+\[(?<username>@[A-Za-z0-9-]+(?:\\?\[bot\\?\])?)\]\((?<userUrl>[^)]+)\)\s+[–-]\s*(?<summary>.*)$/;
const leadingIndentPattern = /^\s{4}/;
const nestedListIndentPattern = /^(\s*)-\s{3}/;
const semverTagPattern = /^v/;
const releaseTypes = ['major', 'minor', 'patch'];
const releaseHeadingLabels = {
  Major: 'Breaking Changes',
  Minor: 'Features',
  Patch: 'Bug Fixes',
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
  return (
    !!process.argv[1] &&
    path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  );
}

async function main(args) {
  const options = parseArgs(args);
  const existingReleases = await readExistingReleases(options.output);
  const pullRequests =
    options.pullRequestNumber !== undefined
      ? [await readPullRequest(options.pullRequestNumber)]
      : await readLatestPullRequests(options.limit);
  const parsedReleases = pullRequests.flatMap((pullRequest) =>
    parseVersionPackagesPullRequest(pullRequest)
  );
  const releaseUrlsByTag = await readGitHubReleaseUrls(
    mergeReleaseLists(existingReleases, parsedReleases).map(
      (release) => release.tag
    )
  );
  const releases = filterReleasesFromVersion(
    mergeReleases(existingReleases, parsedReleases, { releaseUrlsByTag }),
    options.fromVersion
  );

  await writeReleaseIndex(options.output, releases);

  console.log(`Synced ${releases.length} release entries to ${options.output}`);
}

function parseArgs(args) {
  const options = {
    fromVersion: undefined,
    limit: 20,
    output: defaultOutputPath,
    pullRequestNumber: undefined,
  };

  let index = 0;

  while (index < args.length) {
    const arg = args[index];

    if (arg === '--latest') {
      options.limit = Number(args[index + 1] ?? options.limit);
      index += 2;
    } else if (arg === '--from') {
      options.fromVersion = args[index + 1];
      index += 2;
    } else if (arg === '--output') {
      options.output = args[index + 1] ?? options.output;
      index += 2;
    } else if (arg === '--pr') {
      options.pullRequestNumber = Number(args[index + 1]);
      index += 2;
    } else {
      index++;
    }
  }

  return options;
}

export function filterReleasesFromVersion(releases, fromVersion) {
  if (!fromVersion) return releases;

  return releases.filter(
    (release) => compareVersionsDesc(release.tag, fromVersion) <= 0
  );
}

async function readPullRequest(number) {
  const { stdout } = await execFile('gh', [
    'pr',
    'view',
    String(number),
    '--repo',
    githubRepo,
    '--json',
    'number,title,body,createdAt,mergedAt,mergeCommit,updatedAt,url',
  ]);

  return JSON.parse(stdout);
}

async function readLatestPullRequests(limit) {
  const { stdout } = await execFile('gh', [
    'pr',
    'list',
    '--repo',
    githubRepo,
    '--state',
    'merged',
    '--search',
    '"[Release] Version packages"',
    '--json',
    'number,title,body,createdAt,mergedAt,mergeCommit,updatedAt,url',
    '--limit',
    String(limit),
  ]);

  return filterMergedVersionPackagePullRequests(JSON.parse(stdout));
}

async function readGitHubReleaseUrls(tags) {
  if (tags.length === 0) return new Map();

  try {
    const { stdout } = await execFile('gh', [
      'release',
      'list',
      '--repo',
      githubRepo,
      '--limit',
      String(Math.max(tags.length, 30)),
      '--json',
      'tagName',
    ]);
    const requestedTags = new Set(tags);

    return new Map(
      JSON.parse(stdout)
        .filter((release) => requestedTags.has(release.tagName))
        .map((release) => [
          release.tagName,
          `${githubBaseUrl}/releases/tag/${encodeTag(release.tagName)}`,
        ])
    );
  } catch {
    return new Map();
  }
}

export function filterMergedVersionPackagePullRequests(pullRequests) {
  return pullRequests.filter(
    (pullRequest) =>
      isVersionPackagesPullRequest(pullRequest) && pullRequest.mergedAt
  );
}

export function parseVersionPackagesPullRequest(pullRequest) {
  if (!isVersionPackagesPullRequest(pullRequest)) return [];

  const releasesBody = extractReleasesBody(pullRequest.body ?? '');
  const packageChanges = parsePackageChanges(releasesBody);

  if (packageChanges.length === 0) return [];

  return [...groupPackageChangesByVersion(packageChanges).entries()].map(
    ([version, sameVersionPackageChanges]) =>
      compileVersionPackageRelease({
        packageChanges: sameVersionPackageChanges,
        pullRequest,
        version,
      })
  );
}

function compileVersionPackageRelease({
  packageChanges,
  pullRequest,
  version,
}) {
  const selectedPackage =
    packageChanges.find(
      (packageChange) => packageChange.packageName === 'platejs'
    ) ?? packageChanges[0];
  const selectedTag = getPackageTag(selectedPackage);
  const { content, contributors } = compileReleaseContent(packageChanges);

  return {
    changelogUrl: getPackageChangelogUrl(
      selectedPackage.packageName,
      pullRequest.mergeCommit?.oid ?? 'main'
    ),
    content,
    contributors,
    date: formatDate(
      pullRequest.mergedAt ?? pullRequest.updatedAt ?? pullRequest.createdAt
    ),
    packageTag: selectedTag,
    tag: `v${version}`,
    title: `v${version}`,
    type: getReleaseType(packageChanges),
    versionPackagePrUrl: pullRequest.url,
  };
}

function groupPackageChangesByVersion(packageChanges) {
  const packageChangesByVersion = new Map();

  for (const packageChange of packageChanges) {
    const versionPackageChanges =
      packageChangesByVersion.get(packageChange.version) ?? [];

    versionPackageChanges.push(packageChange);
    packageChangesByVersion.set(packageChange.version, versionPackageChanges);
  }

  return packageChangesByVersion;
}

export function mergeReleases(
  existingReleases,
  nextReleases,
  { releaseUrlsByTag = new Map() } = {}
) {
  const releases = mergeReleaseLists(existingReleases, nextReleases);

  return releases.map((release, index) => {
    const previousRelease = releases[index + 1];
    const releaseUrl = releaseUrlsByTag.get(release.tag);
    const previousReleaseUrl = previousRelease
      ? releaseUrlsByTag.get(previousRelease.tag)
      : undefined;
    const url =
      releaseUrl ??
      release.versionPackagePrUrl ??
      getPackageReleaseUrl(release.packageTag);
    const fullChangelogUrl =
      previousRelease?.tag && releaseUrl && previousReleaseUrl
        ? getCompareUrl(previousRelease.tag, release.tag)
        : previousRelease?.packageTag && release.packageTag
          ? getCompareUrl(previousRelease.packageTag, release.packageTag)
          : url;
    const changelogLabel = previousRelease
      ? `${previousRelease.tag}...${release.tag}`
      : release.tag;

    return {
      ...release,
      content: getReleaseContentWithFooter({
        changelogLabel,
        content: release.content,
        contributors: release.contributors,
        detailedChangesUrl: releaseUrl
          ? undefined
          : (release.versionPackagePrUrl ?? url),
        fullChangelogUrl,
      }),
      url,
    };
  });
}

function mergeReleaseLists(existingReleases, nextReleases) {
  const releasesByTag = new Map();

  for (const release of [...existingReleases, ...nextReleases]) {
    releasesByTag.set(release.tag, release);
  }

  return [...releasesByTag.values()].sort((a, b) =>
    compareVersionsDesc(a.tag, b.tag)
  );
}

function getReleaseContentWithFooter({
  changelogLabel,
  content,
  contributors = [],
  detailedChangesUrl,
  fullChangelogUrl,
}) {
  const footer = [
    detailedChangesUrl ? `[\`CHANGELOG\`](${detailedChangesUrl})` : undefined,
    `[\`${changelogLabel}\`](${fullChangelogUrl})`,
    contributors.length > 0
      ? `By ${formatContributorList(contributors)}`
      : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return [content.replace(generatedFooterPattern, '').trim(), footer].join(
    '\n\n'
  );
}

function isVersionPackagesPullRequest(pullRequest) {
  return versionPackagesTitlePattern.test(pullRequest?.title ?? '');
}

function extractReleasesBody(body) {
  const match = releaseIntroPattern.exec(body);

  return match ? body.slice(match.index + match[0].length) : body;
}

function parsePackageChanges(body) {
  const matches = [...body.matchAll(packageReleaseHeadingPattern)];

  return matches.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const nextMatch = matches[index + 1];
    const bodyEnd = nextMatch?.index ?? body.length;

    return {
      body: body.slice(bodyStart, bodyEnd).trim(),
      packageName: match.groups.packageName,
      version: match.groups.version,
    };
  });
}

function compileReleaseContent(packageChanges) {
  const contributorsByUsername = new Map();
  const content = packageChanges
    .map((packageChange) =>
      compilePackageChange(packageChange, contributorsByUsername)
    )
    .filter(Boolean)
    .join('\n\n');

  return {
    content,
    contributors: [...contributorsByUsername.values()],
  };
}

function compilePackageChange(packageChange, contributorsByUsername) {
  const sections = parseReleaseSections(packageChange.body);
  const content = sections
    .map((section) => compileReleaseSection(section, contributorsByUsername))
    .filter(Boolean)
    .join('\n\n');

  if (!content) return '';

  return [`\`${packageChange.packageName}\``, '', content].join('\n').trim();
}

function parseReleaseSections(body) {
  const matches = [...body.matchAll(releaseSectionHeadingPattern)];

  if (matches.length === 0) {
    return [{ body, type: undefined }];
  }

  return matches.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const nextMatch = matches[index + 1];
    const bodyEnd = nextMatch?.index ?? body.length;

    return {
      body: body.slice(bodyStart, bodyEnd).trim(),
      type: match.groups.type,
    };
  });
}

function compileReleaseSection(section, contributorsByUsername) {
  const body = formatChangeLines(section.body, contributorsByUsername);

  if (!body) return '';

  return [`### ${formatReleaseSectionHeading(section.type)}`, '', body].join(
    '\n'
  );
}

function formatReleaseSectionHeading(type) {
  if (!type) return 'Changes';

  return releaseHeadingLabels[type] ?? `${type} Changes`;
}

function formatChangeLine(line, contributorsByUsername) {
  const match = changesetChangeLinePattern.exec(line);

  if (!match) return line;

  const { changeLabel, changeUrl, summary } = match.groups;

  collectChangeContributor(match, contributorsByUsername);

  return `- ${summary.trim()} ([${changeLabel}](${changeUrl}))`;
}

function formatChangeLines(body, contributorsByUsername) {
  const lines = normalizePackageBody(body).split('\n');
  const formattedLines = [];

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const match = changesetChangeLinePattern.exec(line);

    if (!match) {
      formattedLines.push(line);
      continue;
    }

    collectChangeContributor(match, contributorsByUsername);

    if (!match.groups.summary.trim()) {
      const continuationLines = [];

      while ((lines[index + 1] ?? '').trim() === '') {
        index++;
      }

      while (continuationLinePattern.test(lines[index + 1] ?? '')) {
        index++;
        continuationLines.push(formatWrapperContinuationLine(lines[index]));
      }

      if (continuationLines.length > 0) {
        formattedLines.push(
          ...formatWrapperOnlyChangeLines(match, continuationLines)
        );
      }

      continue;
    }

    const summaryParts = [match.groups.summary.trim()];

    while (continuationLinePattern.test(lines[index + 1] ?? '')) {
      index++;
      summaryParts.push(lines[index].trim());
    }

    formattedLines.push(
      formatChangeLine(
        line.replace(match.groups.summary, summaryParts.join(' ')),
        contributorsByUsername
      )
    );
  }

  return formattedLines.join('\n').trim();
}

function collectChangeContributor(match, contributorsByUsername) {
  const { username, userUrl } = match.groups;

  if (!contributorsByUsername.has(username)) {
    contributorsByUsername.set(username, { url: userUrl, username });
  }
}

function formatWrapperContinuationLine(line) {
  return line
    .replace(leadingIndentPattern, '')
    .replace(nestedListIndentPattern, '$1- ');
}

function formatWrapperOnlyChangeLines(match, continuationLines) {
  const [firstLine, ...restLines] = continuationLines;
  const changeLink = `([${match.groups.changeLabel}](${match.groups.changeUrl}))`;

  if (!firstLine) return restLines;

  const firstLineWithLink = firstLine.startsWith('- ')
    ? `${firstLine} ${changeLink}`
    : `- ${firstLine} ${changeLink}`;

  return [firstLineWithLink, ...restLines];
}

function formatContributorList(contributors) {
  return contributors
    .map((contributor) => `[${contributor.username}](${contributor.url})`)
    .join(', ');
}

function normalizePackageBody(body) {
  return body
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(listIndentPattern, '- ')
    .trim();
}

function getReleaseType(packageChanges) {
  return packageChanges
    .flatMap((packageChange) =>
      [...packageChange.body.matchAll(releaseTypeHeadingPattern)].map((match) =>
        match[1].toLowerCase()
      )
    )
    .sort((a, b) => releaseTypes.indexOf(a) - releaseTypes.indexOf(b))[0];
}

function getPackageTag(packageChange) {
  return `${packageChange.packageName}@${packageChange.version}`;
}

function getCompareUrl(fromTag, toTag) {
  return `${githubBaseUrl}/compare/${encodeTag(fromTag)}...${encodeTag(toTag)}`;
}

function getPackageReleaseUrl(tag) {
  if (!tag) return;

  return `${githubBaseUrl}/releases/tag/${encodeTag(tag)}`;
}

function getPackageChangelogUrl(packageName, commitRef) {
  const directory = getPackageDirectory(packageName);

  if (!directory) return;

  return `${githubBaseUrl}/blob/${commitRef}/${directory}/CHANGELOG.md`;
}

function getPackageDirectory(packageName) {
  if (packageName === 'platejs') return 'packages/plate';
  if (packageName === 'depset') return 'packages/udecode/depset';

  if (packageName.startsWith('@platejs/')) {
    return `packages/${packageName.slice('@platejs/'.length)}`;
  }

  if (packageName.startsWith('@udecode/')) {
    const name = packageName.slice('@udecode/'.length);

    if (name.startsWith('plate-')) {
      return `packages/${name.slice('plate-'.length)}`;
    }

    return `packages/udecode/${name}`;
  }
}

function encodeTag(tag) {
  return encodeURIComponent(tag);
}

async function readExistingReleases(outputPath) {
  try {
    return JSON.parse(await readFile(outputPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeReleaseIndex(outputPath, releases) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(releases, null, 2)}\n`);
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
  const [core, prerelease = ''] = version
    .replace(semverTagPattern, '')
    .split('-');
  const parts = core.split('.').map(Number);

  while (parts.length < 3) {
    parts.push(0);
  }

  return {
    parts,
    prerelease,
  };
}

function formatDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);

  return new Date(value).toISOString().slice(0, 10);
}
