import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';

const DEFAULT_SOURCE = 'tooling/data/plate-ui-changelog.mdx';
const DEFAULT_OUT_DIR = 'apps/www/src/registry/changelog';
const DEFAULT_REGISTRY_ROOT = 'apps/www/src/registry';
const DEFAULT_RELEASE_INDEX = 'apps/www/src/generated/release-index.json';
const GITHUB_REPO_URL = 'https://github.com/udecode/plate';
const REGISTRY_CHANGELOG_PUBLIC_PATH = '/registry/changelog';

const MONTHS = new Map([
  ['January', '01'],
  ['February', '02'],
  ['March', '03'],
  ['April', '04'],
  ['May', '05'],
  ['June', '06'],
  ['July', '07'],
  ['August', '08'],
  ['September', '09'],
  ['October', '10'],
  ['November', '11'],
  ['December', '12'],
]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.mts']);
const BACKTICK_ID_PATTERN = /`([^`]+)`/g;
const BOLD_MARKER_PATTERN = /\*\*/g;
const COMPONENT_PATH_PATTERN = /[^a-z0-9-]/g;
const CODE_IDENTIFIER_PATTERN = /^[a-z0-9_-]+$/i;
const DATE_HEADING_PATTERN = /^([A-Za-z]+)\s+(\d{1,2})$/;
const DETAIL_MARKER_PATTERN = /^-\s+/;
const EMPTY_GIT_COMMIT_PATTERN = /^0+$/;
const ENTRY_HEADING_PATTERN = /^###\s+(.+?)\s+#([\d.]+)\s*$/;
const HEADING_PATTERN = /^#{2,3}\s/;
const KIND_FIX_PATTERN = /\bfix(?:ed|es)?\b/;
const KIND_NEW_PATTERN = /\(new\)|\bnew\b|^add(?:ed)?\b/;
const KIND_REMOVE_PATTERN = /\b(drop|remove|removed)\b/;
const KIND_RENAME_PATTERN = /\brename(?:d)?\b/;
const KIND_WIRING_PATTERN = /\b(register|map|wire|re-export|export)\b/;
const INLINE_CODE_PATTERN = /`[^`]+`/g;
const MIGRATION_NOTE_PATTERN =
  /^(set|use|register|map|rename|drop|remove|replace|move|export|import)\b/i;
const MULTIPLE_DASHES_PATTERN = /-+/g;
const PROVENANCE_COMMIT_PATTERN =
  /^<!--\s*changelog:\s*commit=([a-f0-9]{40})\s*-->\s*$/i;
const PR_URL_PATTERN = /\/pull\/(\d+)(?:\D|$)/;
const REGEXP_SPECIAL_PATTERN = /[.*+?^${}()|[\]\\]/g;
const REGISTRY_ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
const SECTION_HEADING_PATTERN = /^##\s+(.+?)\s+#(\d+)\s*$/;
const SENTENCE_PATTERN = /[^.!?]+[.!?]?/g;
const SPEC_OR_TEST_FILE_PATTERN = /[./](?:spec|test)\.[cm]?[tj]sx?$/;
const STOP_WORDS = new Set([
  'a',
  'add',
  'and',
  'as',
  'component',
  'for',
  'hide',
  'in',
  'it',
  'new',
  'of',
  'on',
  'only',
  'or',
  'read',
  'rendering',
  'selected',
  'set',
  'show',
  'static',
  'the',
  'to',
  'use',
  'with',
]);
const TITLE_PREFIX_PATTERN =
  /^(?:build|chore|docs|feat|fix|perf|refactor|test)(?:\([^)]+\))?:\s*/i;
const TITLE_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'for',
  'in',
  'of',
  'or',
  'the',
  'to',
  'with',
]);
const TOP_LEVEL_ITEM_MARKER_PATTERN = /^- /;
const VERSION_PREFIX_PATTERN = /^v/;
const WHITESPACE_PATTERN = /\s+/g;
const YEAR_PATTERN = /\b(\d{4})\b/;
const ITEM_SLUG_SUFFIX_WORDS = new Set([
  'base',
  'button',
  'classic',
  'demo',
  'kit',
  'node',
  'static',
]);

function assertPositiveInteger(value, label) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed <= 0 || String(parsed) !== value) {
    throw new Error(`${label} must be a positive integer`);
  }

  return parsed;
}

function escapeRegExp(value) {
  return value.replace(REGEXP_SPECIAL_PATTERN, '\\$&');
}

function formatSourceId(row) {
  const release = row.release.entry.replaceAll('.', '-');

  return `${row.date}-${release}-${String(row.row).padStart(3, '0')}`;
}

function formatChangeUnitId(changeUnit) {
  return `${changeUnit.date}-${formatChangeUnitSlug(changeUnit)}`;
}

function formatEventSlug(row) {
  const itemTokens = getItemSlugTokens(row.items);
  const itemTokenSet = new Set(itemTokens);
  const summaryTokens = tokenizeSlug(row.summary)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => !itemTokenSet.has(token))
    .slice(0, 4);
  const codeTokens = getInlineCodeSlugTokens(row.summary)
    .filter((token) => !STOP_WORDS.has(token))
    .filter((token) => !itemTokenSet.has(token))
    .slice(0, 2);
  const tokens = [...itemTokens, ...summaryTokens, ...codeTokens].slice(0, 8);

  return tokens.length > 0
    ? tokens.join('-')
    : `row-${String(row.row).padStart(3, '0')}`;
}

function formatChangeUnitSlug(changeUnit) {
  if (changeUnit.title) {
    const title = changeUnit.title.replace(TITLE_PREFIX_PATTERN, '');
    const titleTokens = tokenizeSlug(title)
      .filter((token) => !TITLE_STOP_WORDS.has(token))
      .slice(0, 8);

    if (titleTokens.length > 0) return titleTokens.join('-');
  }

  return formatEventSlug(changeUnit.rows[0]);
}

function formatDateOnly(value) {
  return value?.slice(0, 10) ?? null;
}

function getPrNumberFromRelease(release) {
  const url = release?.versionPackagePrUrl ?? release?.url;
  const match = url?.match(PR_URL_PATTERN);

  return match ? Number.parseInt(match[1], 10) : null;
}

function getProvenanceWarning(provenance) {
  if (!provenance) return ['No git provenance found for source row.'];

  return provenance.warnings ?? [];
}

function getDiagnosticCode(message) {
  if (message.startsWith('No generated release-index entry')) {
    return 'release-missing';
  }
  if (message.startsWith('Multiple generated release-index entries')) {
    return 'release-ambiguous';
  }
  if (message.startsWith('Matched PR')) return 'pull-request-not-merged';
  if (message.startsWith('No exact registry source file')) {
    return 'registry-file-missing';
  }
  if (message.startsWith('No git provenance')) return 'provenance-missing';
  if (message.startsWith('No GitHub pull request found')) {
    return 'pull-request-missing';
  }
  if (message.startsWith('GitHub PR lookup failed')) {
    return 'pull-request-lookup-failed';
  }

  return 'warning';
}

function getChangeUnitForRows(rows, provenanceBySourceId) {
  const provenance = getPrimaryProvenance(rows, provenanceBySourceId);
  const pr = provenance?.pr ?? null;
  const commit = provenance?.commit ?? null;
  const date = formatDateOnly(pr?.mergedAt) ?? commit?.date ?? rows[0].date;

  return {
    key: pr?.number
      ? `pr:${pr.number}`
      : commit?.oid
        ? `commit:${commit.oid}`
        : `source:${rows[0].sourceId}`,
    commit,
    date,
    pr,
    provenance,
    rows,
    title: pr?.title ?? commit?.subject ?? null,
  };
}

function getChangeUnitKey(row, provenance) {
  if (provenance?.pr?.number) return `pr:${provenance.pr.number}`;
  if (provenance?.commit?.oid) return `commit:${provenance.commit.oid}`;

  return `source:${row.sourceId}`;
}

function getPrimaryProvenance(rows, provenanceBySourceId) {
  for (const row of rows) {
    const provenance = provenanceBySourceId.get(row.sourceId);

    if (provenance?.pr || provenance?.commit) return provenance;
  }

  return provenanceBySourceId.get(rows[0].sourceId) ?? null;
}

function getItemSlugTokens(items) {
  const firstItemTokens = tokenizeSlug(items[0] ?? '').filter(
    (token) => !ITEM_SLUG_SUFFIX_WORDS.has(token)
  );

  return firstItemTokens.length > 0
    ? firstItemTokens
    : tokenizeSlug(items[0] ?? '');
}

function getInlineCodeSlugTokens(value) {
  return unique(
    [...value.matchAll(BACKTICK_ID_PATTERN)]
      .map((match) => match[1].trim())
      .filter((token) => CODE_IDENTIFIER_PATTERN.test(token))
      .filter((token) => token.includes('-') || token.includes('_'))
      .flatMap(tokenizeSlug)
  );
}

function inferKind(row) {
  const text = `${row.prefix} ${row.summary}`.toLowerCase();

  if (KIND_NEW_PATTERN.test(text)) return 'new';
  if (KIND_RENAME_PATTERN.test(text)) return 'rename';
  if (KIND_FIX_PATTERN.test(text)) return 'fix';
  if (KIND_REMOVE_PATTERN.test(text)) return 'remove';
  if (KIND_WIRING_PATTERN.test(text)) return 'wiring';

  return 'behavior';
}

function inferMigrationNotes(row) {
  const sentences = [row.summary, ...row.details]
    .flatMap((line) => line.match(SENTENCE_PATTERN) ?? [])
    .map((line) => line.trim())
    .filter(Boolean);

  return unique(
    sentences.filter((sentence) =>
      MIGRATION_NOTE_PATTERN.test(stripMarkdown(sentence))
    )
  );
}

function isLikelyRegistryId(value) {
  return REGISTRY_ID_PATTERN.test(value);
}

function parseArgs(argv) {
  const args = {
    inferProvenance: true,
    limit: null,
    outDir: DEFAULT_OUT_DIR,
    registryRoot: DEFAULT_REGISTRY_ROOT,
    releaseIndex: DEFAULT_RELEASE_INDEX,
    source: DEFAULT_SOURCE,
    write: false,
  };

  const iterator = argv[Symbol.iterator]();

  for (const arg of iterator) {
    const nextValue = () => {
      const next = iterator.next();

      if (next.done) {
        throw new Error(`${arg} requires a value`);
      }

      return next.value;
    };

    if (arg === '--write') {
      args.write = true;
      continue;
    }

    if (arg === '--no-provenance') {
      args.inferProvenance = false;
      continue;
    }

    if (arg === '--limit') {
      args.limit = assertPositiveInteger(nextValue(), '--limit');
      continue;
    }

    if (arg === '--source') {
      args.source = nextValue();
      continue;
    }

    if (arg === '--out-dir') {
      args.outDir = nextValue();
      continue;
    }

    if (arg === '--registry-root') {
      args.registryRoot = nextValue();
      continue;
    }

    if (arg === '--release-index') {
      args.releaseIndex = nextValue();
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function parseDate(label, section) {
  const match = label.match(DATE_HEADING_PATTERN);

  if (!match) return null;

  const month = MONTHS.get(match[1]);

  if (!month || !section?.year) return null;

  return `${section.year}-${month}-${match[2].padStart(2, '0')}`;
}

function parseEntryHeading(line, section) {
  const match = line.match(ENTRY_HEADING_PATTERN);

  if (!match) return null;

  return {
    date: parseDate(match[1], section),
    entry: match[2],
    label: `${match[1]} #${match[2]}`,
    major: section?.major ?? null,
    section: section?.label ?? null,
  };
}

function parseSectionHeading(line) {
  const match = line.match(SECTION_HEADING_PATTERN);

  if (!match) return null;

  const year = match[1].match(YEAR_PATTERN)?.[1] ?? null;

  return {
    label: `${match[1]} #${match[2]}`,
    major: match[2],
    year,
  };
}

function parseItemLines(lines, release, row, line, provenanceCommit = null) {
  const firstLine = lines[0].replace(TOP_LEVEL_ITEM_MARKER_PATTERN, '').trim();
  const colonIndex = firstLine.indexOf(':');
  const prefix = colonIndex === -1 ? firstLine : firstLine.slice(0, colonIndex);
  const summary =
    colonIndex === -1 ? '' : firstLine.slice(colonIndex + 1).trim();
  const details = lines
    .slice(1)
    .map((detail) => detail.trim())
    .filter(Boolean)
    .map((detail) => detail.replace(DETAIL_MARKER_PATTERN, '').trim());
  const prefixItems = extractRegistryItemNames(prefix);
  const detailItems = details.flatMap((detail) => {
    const detailPrefix = detail.split(':', 1)[0];

    return extractRegistryItemNames(detailPrefix);
  });
  const items = unique([...prefixItems, ...detailItems]);

  return {
    date: release?.date,
    details,
    items,
    line,
    prefix,
    provenanceCommit,
    release,
    row,
    sourceId: null,
    summary: stripMarkdown(summary),
  };
}

function printUsage() {
  console.log(`Usage:
  node tooling/scripts/generate-ui-changelog-entries.mjs [--limit 10] [--write]

Options:
  --source <path>         MDX changelog source. Defaults to ${DEFAULT_SOURCE}
  --out-dir <path>        JSON output directory. Defaults to ${DEFAULT_OUT_DIR}
  --registry-root <path>  Registry source root. Defaults to ${DEFAULT_REGISTRY_ROOT}
  --release-index <path>  Release index JSON. Defaults to ${DEFAULT_RELEASE_INDEX}
  --limit <n>             Limit source changelog rows.
  --no-provenance         Skip git blame and GitHub PR lookup.
  --write                 Write files. Omit for a dry run.`);
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON array`);
  }

  return parsed;
}

function readRegistryDefinitions(registryFiles) {
  return registryFiles
    .filter((filePath) => path.basename(filePath).startsWith('registry-'))
    .filter((filePath) => filePath.endsWith('.ts'))
    .map((filePath) => ({
      content: fs.readFileSync(filePath, 'utf8'),
      path: filePath,
    }));
}

function relativePath(filePath, cwd = process.cwd()) {
  return path.relative(cwd, filePath).replaceAll(path.sep, '/');
}

function sanitizeFileSegment(value) {
  return value
    .replace(COMPONENT_PATH_PATTERN, '-')
    .replace(MULTIPLE_DASHES_PATTERN, '-');
}

function stripMarkdown(value) {
  return value
    .replace(BOLD_MARKER_PATTERN, '')
    .replace(WHITESPACE_PATTERN, ' ')
    .trim();
}

function tokenizeSlug(value) {
  const normalized = stripMarkdown(value)
    .replace(INLINE_CODE_PATTERN, ' ')
    .toLowerCase();

  return unique(sanitizeFileSegment(normalized).split('-')).filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueCommits(commits) {
  const commitsByOid = new Map();

  for (const commit of commits) {
    commitsByOid.set(commit.oid, commit);
  }

  return [...commitsByOid.values()];
}

function toChangeMetadata(changeUnit, commits) {
  const change = {
    type: changeUnit.pr
      ? 'pull_request'
      : commits.length > 0
        ? 'commit'
        : 'source',
    date: changeUnit.date,
    commits: commits.map(toCommitMetadata),
  };

  if (changeUnit.pr) {
    change.pullRequest = {
      number: changeUnit.pr.number,
      url: changeUnit.pr.url,
      state: changeUnit.pr.state,
      title: changeUnit.pr.title,
    };

    if (changeUnit.pr.mergedAt) {
      change.pullRequest.mergedAt = changeUnit.pr.mergedAt;
    }
  }

  return change;
}

function toCommitMetadata(commit) {
  return {
    sha: commit.oid,
    shortSha: commit.shortOid,
    url: `${GITHUB_REPO_URL}/commit/${commit.oid}`,
    date: commit.date,
    committedAt: commit.committedAt,
    subject: commit.subject,
  };
}

function toDiagnostics(messages) {
  return unique(messages).map((message) => ({
    severity: 'warning',
    code: getDiagnosticCode(message),
    message,
  }));
}

function buildRegistryChangelogTargets(
  rows,
  { registryDefinitions = [], registryFiles = [] } = {}
) {
  return unique(rows.flatMap((row) => row.items)).map((name) => {
    const registryHints = inferRegistryHints(name, {
      registryDefinitions,
      registryFiles,
    });
    const diagnostics =
      registryHints.files.length === 0
        ? toDiagnostics([`No exact registry source file found for ${name}.`])
        : [];

    return {
      name,
      files: registryHints.files,
      definitionFiles: registryHints.definitionFiles,
      diagnostics,
    };
  });
}

function toLegacyReleaseMetadata(release) {
  return {
    date: release.date,
    entry: release.entry,
    section: release.section,
  };
}

function toReleaseState(release, changeUnit) {
  if (release) return release;

  return {
    status:
      changeUnit.pr?.state && changeUnit.pr.state !== 'MERGED'
        ? 'unreleased'
        : 'unresolved',
  };
}

export function buildRegistryChangelogIndexes(outputs) {
  const sortedOutputs = [...outputs].sort((a, b) =>
    b.entry.change.date.localeCompare(a.entry.change.date)
  );
  const index = {
    schemaVersion: 1,
    events: sortedOutputs.map(({ entry }) => ({
      id: entry.id,
      href: `${REGISTRY_CHANGELOG_PUBLIC_PATH}/${entry.id}.json`,
      status: entry.status,
      kind: entry.kind,
      summary: entry.summary,
      change: entry.change,
      release: entry.release,
      targets: entry.targets.map((target) => target.name),
      entries: entry.entries.length,
      diagnostics: entry.diagnostics.map(({ code, severity }) => ({
        code,
        severity,
      })),
    })),
  };
  const components = {
    schemaVersion: 1,
    components: {},
  };

  for (const { entry } of sortedOutputs) {
    for (const target of entry.targets) {
      components.components[target.name] ??= [];
      components.components[target.name].push(entry.id);
    }
  }

  return { components, index };
}

function getRegistryChangelogArtifactOutputs(outputs, outDir) {
  const { components, index } = buildRegistryChangelogIndexes(outputs);

  return [
    ...outputs,
    {
      entry: index,
      targetPath: path.join(outDir, 'index.json'),
    },
    {
      entry: components,
      targetPath: path.join(outDir, 'components.json'),
    },
  ];
}

export function buildRegistryChangelogEvents(
  rows,
  {
    outDir = DEFAULT_OUT_DIR,
    provenanceBySourceId = new Map(),
    registryDefinitions = [],
    registryFiles = [],
    releases = [],
    sourcePath = DEFAULT_SOURCE,
  } = {}
) {
  const groups = new Map();

  for (const row of rows) {
    if (!row.date || !row.release || row.items.length === 0) continue;

    const sourceId = row.sourceId ?? formatSourceId(row);
    const provenance = provenanceBySourceId.get(sourceId);
    const key = getChangeUnitKey(row, provenance);
    const groupRows = groups.get(key) ?? [];

    groups.set(key, [...groupRows, row]);
  }

  return [...groups.values()].map((groupRows) => {
    const changeUnit = getChangeUnitForRows(groupRows, provenanceBySourceId);
    const eventId = formatChangeUnitId(changeUnit);
    const { release, warnings: releaseWarnings } = resolveReleaseForChangeUnit(
      changeUnit,
      releases
    );
    const entries = groupRows.map((row) => buildRegistryChangelogEntry(row));
    const commits = uniqueCommits(
      groupRows
        .map((row) => provenanceBySourceId.get(row.sourceId)?.commit)
        .filter(Boolean)
    );
    const diagnostics = toDiagnostics([
      ...releaseWarnings,
      ...unique(
        groupRows.flatMap((row) =>
          getProvenanceWarning(provenanceBySourceId.get(row.sourceId))
        )
      ),
    ]);
    const event = {
      schemaVersion: 1,
      id: eventId,
      status: 'draft',
      source: {
        kind: 'legacy-mdx',
        path: sourcePath.replaceAll(path.sep, '/'),
      },
      change: toChangeMetadata(changeUnit, commits),
      release: toReleaseState(release, changeUnit),
      kind: getChangeUnitKind(entries),
      summary: changeUnit.title ?? entries[0].summary,
      targets: buildRegistryChangelogTargets(groupRows, {
        registryDefinitions,
        registryFiles,
      }),
      entries,
      diagnostics,
    };
    const targetPath = path.join(
      outDir,
      `${sanitizeFileSegment(eventId)}.json`
    );

    return { entry: event, targetPath };
  });
}

function buildRegistryChangelogEntry(row) {
  return {
    id: row.sourceId ?? formatSourceId(row),
    kind: inferKind(row),
    summary: row.summary,
    details: row.details,
    migrationNotes: inferMigrationNotes(row),
    targets: row.items,
    source: {
      line: row.line,
      row: row.row,
      legacyRelease: toLegacyReleaseMetadata(row.release),
    },
  };
}

function getChangeUnitKind(entries) {
  const kinds = unique(entries.map((entry) => entry.kind));

  return kinds.length === 1 ? kinds[0] : 'mixed';
}

export function extractRegistryItemNames(value) {
  const backtickIds = [...value.matchAll(BACKTICK_ID_PATTERN)]
    .map((match) => match[1].trim())
    .filter(isLikelyRegistryId);

  if (backtickIds.length > 0) return unique(backtickIds);

  const plain = stripMarkdown(value);

  if (isLikelyRegistryId(plain) && plain.includes('-')) return [plain];

  return [];
}

export function inferRegistryHints(
  itemName,
  { registryDefinitions = [], registryFiles = [] } = {}
) {
  const exactFilePattern = new RegExp(
    `(?:^|/)${escapeRegExp(itemName)}\\.(?:ts|tsx|mts)$`
  );
  const namePattern = new RegExp(`name:\\s*['"]${escapeRegExp(itemName)}['"]`);
  const files = registryFiles
    .filter((filePath) => SOURCE_EXTENSIONS.has(path.extname(filePath)))
    .filter((filePath) => !SPEC_OR_TEST_FILE_PATTERN.test(filePath))
    .filter((filePath) => exactFilePattern.test(filePath))
    .map((filePath) => relativePath(filePath))
    .sort();
  const definitionFiles = registryDefinitions
    .filter(({ content }) => namePattern.test(content))
    .map(({ path: filePath }) => relativePath(filePath))
    .sort();

  return { definitionFiles, files };
}

export function listFiles(root) {
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(root, entry.name);

    if (entry.isDirectory()) return listFiles(filePath);
    if (entry.isFile()) return [filePath];

    return [];
  });
}

export function parseComponentChangelog(content) {
  const lines = content.replaceAll('\r\n', '\n').split('\n');
  const rows = [];
  let section = null;
  let release = null;
  let provenanceCommit = null;
  let row = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const nextSection = parseSectionHeading(line);

    if (nextSection) {
      section = nextSection;
      release = null;
      provenanceCommit = null;
      continue;
    }

    const nextRelease = parseEntryHeading(line, section);

    if (nextRelease) {
      release = nextRelease;
      provenanceCommit = null;
      continue;
    }

    const nextProvenanceCommit = line.match(PROVENANCE_COMMIT_PATTERN)?.[1];

    if (nextProvenanceCommit) {
      provenanceCommit = nextProvenanceCommit.toLowerCase();
      continue;
    }

    if (!line.startsWith('- ')) continue;

    const itemLines = [line];
    const startLine = index + 1;
    let nextIndex = index + 1;

    while (
      nextIndex < lines.length &&
      !HEADING_PATTERN.test(lines[nextIndex]) &&
      !lines[nextIndex].startsWith('- ')
    ) {
      itemLines.push(lines[nextIndex]);
      nextIndex += 1;
    }

    row += 1;
    rows.push(
      parseItemLines(itemLines, release, row, startLine, provenanceCommit)
    );
    index = nextIndex - 1;
  }

  return rows.map((item) => ({
    ...item,
    sourceId: item.date && item.release ? formatSourceId(item) : null,
  }));
}

export function getGitProvenanceBySourceId(
  rows,
  { sourcePath = DEFAULT_SOURCE, lookupPullRequests = true } = {}
) {
  const provenanceBySourceId = new Map();
  const commitCache = new Map();
  const prCache = new Map();

  for (const row of rows) {
    if (!row.sourceId) continue;

    const warnings = [];
    const blameCommitOid = getBlameCommitForLine(sourcePath, row.line);
    const sourceHintCommitOid = row.provenanceCommit ?? null;
    const commitOid = blameCommitOid ?? sourceHintCommitOid;

    if (!commitOid) {
      provenanceBySourceId.set(row.sourceId, {
        commit: null,
        pr: null,
        source: 'git-blame',
        warnings: [`No blame commit found for ${sourcePath}:${row.line}.`],
      });
      continue;
    }

    const commit =
      commitCache.get(commitOid) ?? getCommitMetadata(commitOid, warnings);

    commitCache.set(commitOid, commit);

    const pr =
      lookupPullRequests && commit
        ? (prCache.get(commit.oid) ??
          getPullRequestForCommit(commit.oid, warnings))
        : null;

    if (commit && lookupPullRequests) {
      prCache.set(commit.oid, pr);
    }

    if (lookupPullRequests && commit && !pr) {
      warnings.push(
        `No GitHub pull request found for commit ${commit.shortOid}.`
      );
    }

    if (pr?.state && pr.state !== 'MERGED') {
      warnings.push(`Matched PR ${pr.number}, but it is ${pr.state}.`);
    }

    provenanceBySourceId.set(row.sourceId, {
      commit,
      pr,
      source: blameCommitOid
        ? pr
          ? 'git-blame+github-pr-search'
          : 'git-blame'
        : pr
          ? 'source-hint+github-pr-search'
          : 'source-hint',
      warnings,
    });
  }

  return provenanceBySourceId;
}

function getBlameCommitForLine(sourcePath, line) {
  try {
    const output = execFileSync(
      'git',
      ['blame', '--porcelain', '-M', '-L', `${line},${line}`, '--', sourcePath],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    const commitOid = output.split('\n')[0]?.split(' ')[0];

    if (!commitOid || EMPTY_GIT_COMMIT_PATTERN.test(commitOid)) return null;

    return commitOid;
  } catch {
    return null;
  }
}

function getCommitMetadata(commitOid, warnings) {
  try {
    const output = execFileSync(
      'git',
      ['show', '-s', '--format=%H%n%h%n%cs%n%cI%n%s%n%an%n%ae', commitOid],
      { encoding: 'utf8' }
    );
    const [oid, shortOid, date, committedAt, subject, authorName, authorEmail] =
      output.trimEnd().split('\n');

    return {
      oid,
      shortOid,
      date,
      committedAt,
      subject,
      author: {
        name: authorName,
        email: authorEmail,
      },
    };
  } catch {
    warnings.push(`Could not read git commit metadata for ${commitOid}.`);

    return null;
  }
}

function getPullRequestForCommit(commitOid, warnings) {
  try {
    const output = execFileSync(
      'gh',
      [
        'pr',
        'list',
        '--state',
        'all',
        '--search',
        commitOid,
        '--json',
        'number,title,state,mergedAt,mergeCommit,url',
        '--limit',
        '10',
      ],
      { encoding: 'utf8' }
    );
    const pullRequests = JSON.parse(output);

    if (!Array.isArray(pullRequests) || pullRequests.length === 0) return null;

    if (pullRequests.length > 1) {
      warnings.push(
        `Multiple GitHub pull requests matched commit ${commitOid}; using ${pullRequests[0].number}.`
      );
    }

    const pullRequest = pullRequests[0];

    return {
      number: pullRequest.number,
      title: pullRequest.title,
      state: pullRequest.state,
      mergedAt: pullRequest.mergedAt,
      mergeCommit: pullRequest.mergeCommit?.oid ?? null,
      url: pullRequest.url,
    };
  } catch {
    warnings.push(
      'GitHub PR lookup failed; install/authenticate `gh` or run without PR inference.'
    );

    return null;
  }
}

export function resolveReleaseForChangeUnit(changeUnit, releases) {
  const prNumber = changeUnit.pr?.number;

  if (prNumber) {
    const prReleases = releases.filter((release) =>
      releaseMentionsPullRequest(release, prNumber)
    );

    if (prReleases.length === 0) {
      return {
        release: null,
        warnings: [
          `No generated release-index entry found for PR ${prNumber}.`,
        ],
      };
    }

    if (prReleases.length > 1) {
      return {
        release: null,
        warnings: [
          `Multiple generated release-index entries found for PR ${prNumber}; refusing to guess release dependency.`,
        ],
      };
    }

    return {
      release: toReleaseMetadata(prReleases[0], 'release-index-pr-match'),
      warnings: [],
    };
  }

  return resolveReleaseForDate(changeUnit.date, releases);
}

export function resolveReleaseForRow(row, releases) {
  return resolveReleaseForDate(row.date, releases);
}

function releaseMentionsPullRequest(release, prNumber) {
  const content = release.content ?? '';

  return (
    content.includes(`[#${prNumber}]`) ||
    content.includes(`/pull/${prNumber}`) ||
    content.includes(`pull/${prNumber}`)
  );
}

function resolveReleaseForDate(date, releases) {
  const sameDayReleases = releases.filter((release) => release.date === date);

  if (sameDayReleases.length === 0) {
    return {
      release: null,
      warnings: [`No generated release-index entry found for ${date}.`],
    };
  }

  if (sameDayReleases.length > 1) {
    return {
      release: null,
      warnings: [
        `Multiple generated release-index entries found for ${date}; refusing to guess release dependency.`,
      ],
    };
  }

  return {
    release: toReleaseMetadata(sameDayReleases[0], 'same-day-release-index'),
    warnings: [],
  };
}

function toReleaseMetadata(release, source) {
  const versionPackagePr = getPrNumberFromRelease(release);
  const metadata = {
    status: 'released',
    tag: release.tag,
    source,
    packageTag: release.packageTag ?? null,
    requiresPlate: release.tag
      ? `>=${release.tag.replace(VERSION_PREFIX_PATTERN, '')}`
      : null,
    changelogUrl: release.changelogUrl ?? null,
    url: release.url ?? null,
  };

  if (versionPackagePr) {
    metadata.versionPackagePullRequest = {
      number: versionPackagePr,
      url: release.versionPackagePrUrl ?? release.url ?? null,
    };
  }

  return metadata;
}

export function writeRegistryChangelogEvents(outputs) {
  for (const output of outputs) {
    fs.mkdirSync(path.dirname(output.targetPath), { recursive: true });
    fs.writeFileSync(
      output.targetPath,
      `${JSON.stringify(output.entry, null, 2)}\n`
    );
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = fs.readFileSync(args.source, 'utf8');
  const rows = parseComponentChangelog(source);
  const selectedRows = args.limit ? rows.slice(0, args.limit) : rows;
  const registryFiles = listFiles(args.registryRoot);
  const registryDefinitions = readRegistryDefinitions(registryFiles);
  const releases = readJsonArray(args.releaseIndex);
  const provenanceBySourceId = args.inferProvenance
    ? getGitProvenanceBySourceId(selectedRows, {
        sourcePath: args.source,
        lookupPullRequests: true,
      })
    : new Map();
  const outputs = buildRegistryChangelogEvents(selectedRows, {
    outDir: args.outDir,
    provenanceBySourceId,
    registryDefinitions,
    registryFiles,
    releases,
    sourcePath: args.source,
  });
  const skippedRows = selectedRows.filter((row) => row.items.length === 0);
  const artifactOutputs = getRegistryChangelogArtifactOutputs(
    outputs,
    args.outDir
  );

  if (args.write) {
    writeRegistryChangelogEvents(artifactOutputs);
  }

  console.log(
    `${args.write ? 'Wrote' : 'Would write'} ${outputs.length} registry changelog events from ${selectedRows.length} source rows.`
  );

  if (skippedRows.length > 0) {
    console.log(
      `Skipped ${skippedRows.length} source rows without registry item names.`
    );
  }

  for (const output of outputs) {
    console.log(relativePath(output.targetPath));
  }

  console.log(relativePath(path.join(args.outDir, 'index.json')));
  console.log(relativePath(path.join(args.outDir, 'components.json')));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    printUsage();
    process.exitCode = 1;
  }
}
