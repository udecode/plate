#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../../..');
const syncDir = path.join(repoRoot, 'docs/sync/vision');
const statusPath = path.join(syncDir, 'status.json');
const args = process.argv.slice(2);
const DIFF_HUNK_RE = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/;
const LINE_SPLIT_RE = /\r?\n/;
const TAB_RE = /\t/g;

const sourcePathspecs = [
  'VISION.md',
  'docs/vision',
  '.agents/AGENTS.md',
  '.agents/rules',
  'docs/plans',
  'docs/sync',
  'docs/research',
  'docs/slate-v2',
  'docs/editor-behavior',
  'docs/solutions',
  'content/docs',
  '*.md',
  '*.mdx',
  '*.mdc',
];

const excludedPathPrefixes = [
  '.agents/skills/',
  '.changeset/',
  'docs/sync/vision/runs/',
  'docs/sync/shadcn/dashboard.html',
  'docs/sync/shadcn/dashboard.json',
];

const exactInputFiles = new Set(['VISION.md', '.agents/AGENTS.md']);

const inputPathPrefixes = [
  '.agents/rules/',
  'docs/vision/',
  'docs/plans/',
  'docs/sync/',
  'docs/research/',
  'docs/slate-v2/',
  'docs/editor-behavior/',
  'docs/solutions/',
  'content/docs/',
];

const trackedExts = new Set([
  '.md',
  '.mdx',
  '.mdc',
  '.json',
  '.jsonl',
  '.tsv',
  '.txt',
]);

const patterns = {
  vision: /\b(VISION\.md|vision|north[- ]star|taste|doctrine)\b/i,
  supervisor:
    /\b(sync-vision|slate-auto|autogoal|checkpoint|stopping|handoff|batch|timed|supervisor|loop)\b/i,
  editor_behavior:
    /\b(selection|caret|typing|paste|clipboard|undo|redo|IME|composition|beforeinput|native|browser|screenshot|geometry|huge[- ]doc|virtualized|staged)\b/i,
  api_dx:
    /\b(API|DX|alias|compat|root|extension|plugin|transaction|tx|state|public|docs|migration)\b/i,
  research:
    /\b(research|GitHub|OSS|external|Lexical|ProseMirror|CodeMirror|Monaco|Tiptap|issue harvest|source[- ]mining)\b/i,
  maintainer:
    /\b(issue|PR|maintainer|OpenClaw|clawsweeper|ledger|checkmark|triage)\b/i,
  proof:
    /\b(proof|oracle|benchmark|metric|p95|test|verify|verification|false positive|Browser)\b/i,
};

function runGit(gitArgs, options = {}) {
  const result = spawnSync('git', gitArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${gitArgs.join(' ')} failed`);
  }
  return result.stdout.trimEnd();
}

function parseArgs() {
  const parsed = {
    statusOnly: false,
    dryRun: false,
    advance: false,
    includeWorkingTree: true,
    base: null,
    target: null,
    plan: null,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === '--status' || arg === 'status') parsed.statusOnly = true;
    else if (arg === '--dry-run' || arg === 'preview') parsed.dryRun = true;
    else if (arg === '--advance' || arg === 'advance') parsed.advance = true;
    else if (arg === '--no-working-tree') parsed.includeWorkingTree = false;
    else if (arg === '--base') parsed.base = args[++i];
    else if (arg === '--target') parsed.target = args[++i];
    else if (arg === '--plan') parsed.plan = args[++i];
    else {
      throw new Error(`Unknown argument: ${arg}`);
    }
    i += 1;
  }

  return parsed;
}

function readStatus() {
  if (!fs.existsSync(statusPath)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(`${filePath}.tmp`, `${JSON.stringify(value, null, 2)}\n`);
  fs.renameSync(`${filePath}.tmp`, filePath);
}

function rel(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function isRelevantFile(file) {
  if (!file) return false;
  if (excludedPathPrefixes.some((prefix) => file.startsWith(prefix))) {
    return false;
  }
  const ext = path.extname(file);
  if (!trackedExts.has(ext) && file !== 'VISION.md') {
    return false;
  }
  return (
    exactInputFiles.has(file) ||
    inputPathPrefixes.some((prefix) => file.startsWith(prefix)) ||
    (!file.includes('/') && ['.md', '.mdx', '.mdc'].includes(ext))
  );
}

function pathspecArgs() {
  return ['--', ...sourcePathspecs];
}

function parseNameStatus(text, source) {
  if (!text.trim()) return [];
  return text.split('\n').flatMap((line) => {
    const parts = line.split('\t');
    const status = parts[0] ?? '';
    const file = parts[2] ?? parts[1] ?? '';
    if (!isRelevantFile(file)) return [];
    return [{ source, status, file }];
  });
}

function parseUntrackedFiles(text, source) {
  if (!text.trim()) return [];
  return text.split('\n').flatMap((file) => {
    if (!isRelevantFile(file)) return [];
    return [{ source, status: '??', file }];
  });
}

function categoryHits(text) {
  const hits = [];
  for (const [name, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) hits.push(name);
  }
  return hits;
}

function parseAddedLines(diffText, source) {
  const rows = [];
  let file = '';
  let newLine = 0;

  for (const line of diffText.split('\n')) {
    if (line.startsWith('+++ b/')) {
      file = line.slice('+++ b/'.length);
      continue;
    }
    if (line.startsWith('+++ /dev/null')) {
      file = '';
      continue;
    }
    const hunk = DIFF_HUNK_RE.exec(line);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (!file || !isRelevantFile(file)) continue;
    if (line.startsWith('+') && !line.startsWith('+++')) {
      const text = line.slice(1).trim();
      const hits = categoryHits(text);
      if (hits.length > 0) {
        rows.push({
          source,
          categories: hits.join(','),
          file,
          line: newLine,
          text: text.replace(/\s+/g, ' ').slice(0, 500),
        });
      }
      newLine += 1;
    } else if (!line.startsWith('-') && !line.startsWith('\\')) {
      newLine += 1;
    }
  }

  return rows;
}

function parseFileLines(files, source) {
  const rows = [];

  for (const file of files) {
    const absolutePath = path.join(repoRoot, file.file);

    if (!fs.existsSync(absolutePath)) continue;

    const lines = fs.readFileSync(absolutePath, 'utf8').split(LINE_SPLIT_RE);

    for (let index = 0; index < lines.length; index += 1) {
      const text = lines[index].trim();
      const hits = categoryHits(text);

      if (hits.length === 0) continue;

      rows.push({
        source,
        categories: hits.join(','),
        file: file.file,
        line: index + 1,
        text: text.replace(/\s+/g, ' ').slice(0, 500),
      });
    }
  }

  return rows;
}

function shortSha(sha) {
  return sha ? sha.slice(0, 7) : '';
}

function makeRunDir(base, target) {
  const date = new Date().toISOString().slice(0, 10);
  return path.join(
    syncDir,
    'runs',
    `${date}-${shortSha(base)}-to-${shortSha(target)}`
  );
}

function writeTsv(filePath, header, rows) {
  const escapeTsvCell = (value) =>
    String(value ?? '')
      .replace(TAB_RE, ' ')
      .replace(LINE_SPLIT_RE, ' ');
  const text = [
    header.join('\t'),
    ...rows.map((row) =>
      header.map((key) => escapeTsvCell(row[key])).join('\t')
    ),
  ].join('\n');
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${text}\n`);
}

function summarizeCounts(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    for (const value of String(row[key] ?? '')
      .split(',')
      .filter(Boolean)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
}

function main() {
  const options = parseArgs();
  const status = readStatus();
  const target = options.target ?? runGit(['rev-parse', 'HEAD']);
  const base =
    options.base ??
    status.lastSyncedCommit ??
    runGit(['rev-list', '--max-parents=0', 'HEAD']);

  const committedNameStatus = runGit([
    'diff',
    '--name-status',
    '-M',
    base,
    target,
    ...pathspecArgs(),
  ]);
  const committedFiles = parseNameStatus(committedNameStatus, 'committed');
  const committedDiff = runGit([
    'diff',
    '--unified=0',
    '--no-ext-diff',
    base,
    target,
    ...pathspecArgs(),
  ]);
  const committedCandidates = parseAddedLines(committedDiff, 'committed');

  let workingFiles = [];
  let workingCandidates = [];
  if (options.includeWorkingTree && target === runGit(['rev-parse', 'HEAD'])) {
    const workingNameStatus = runGit([
      'diff',
      '--name-status',
      '-M',
      target,
      ...pathspecArgs(),
    ]);
    workingFiles = parseNameStatus(workingNameStatus, 'working-tree');
    const workingDiff = runGit([
      'diff',
      '--unified=0',
      '--no-ext-diff',
      target,
      ...pathspecArgs(),
    ]);
    workingCandidates = parseAddedLines(workingDiff, 'working-tree');
    const untracked = parseUntrackedFiles(
      runGit(['ls-files', '--others', '--exclude-standard', ...pathspecArgs()]),
      'working-tree'
    );
    workingFiles = [...workingFiles, ...untracked];
    workingCandidates = [
      ...workingCandidates,
      ...parseFileLines(untracked, 'working-tree'),
    ];
  }

  const changedFiles = [...committedFiles, ...workingFiles];
  const candidateLines = [...committedCandidates, ...workingCandidates];

  const statusSummary = {
    statusPath: rel(statusPath),
    base,
    target,
    committedChangedFiles: committedFiles.length,
    committedCandidateLines: committedCandidates.length,
    workingTreeChangedFiles: workingFiles.length,
    workingTreeCandidateLines: workingCandidates.length,
    lastRunDir: status.lastRunDir ?? null,
    pendingRunDir: status.pendingRunDir ?? null,
  };

  if (options.statusOnly) {
    console.log(JSON.stringify(statusSummary, null, 2));
    return;
  }

  const runDir = makeRunDir(base, target);
  fs.mkdirSync(runDir, { recursive: true });

  writeTsv(
    path.join(runDir, 'changed-files.tsv'),
    ['source', 'status', 'file'],
    changedFiles
  );
  writeTsv(
    path.join(runDir, 'candidate-lines.tsv'),
    ['source', 'categories', 'file', 'line', 'text'],
    candidateLines
  );

  const categoryCounts = summarizeCounts(candidateLines, 'categories');
  const summary = [
    '# Vision Sync Summary',
    '',
    `- Base: \`${base}\``,
    `- Target: \`${target}\``,
    `- Committed changed files: ${committedFiles.length}`,
    `- Committed candidate lines: ${committedCandidates.length}`,
    `- Working-tree changed files: ${workingFiles.length}`,
    `- Working-tree candidate lines: ${workingCandidates.length}`,
    `- Dry run: ${options.dryRun ? 'yes' : 'no'}`,
    `- Advanced baseline: ${options.advance ? 'requested' : 'no'}`,
    '',
    '## Candidate Categories',
    '',
    '| Category | Lines |',
    '| --- | ---: |',
    ...categoryCounts.map(([name, count]) => `| ${name} | ${count} |`),
    '',
    '## Next',
    '',
    '- Read `candidate-lines.tsv` and the owning changed files.',
    '- Cluster candidates into captured, reaffirmed, rejected, run-specific, owner-routed, or deferred-with-question.',
    '- Patch root `VISION.md` or the relevant `docs/vision/*.md` only for reusable latest-state doctrine.',
    '- Advance `lastSyncedCommit` only after the committed range is fully accounted for.',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(runDir, 'summary.md'), summary);

  const runJson = {
    ...statusSummary,
    runDir: rel(runDir),
    candidateCategoryCounts: Object.fromEntries(categoryCounts),
    generatedAt: new Date().toISOString(),
    plan: options.plan ?? null,
  };
  writeJson(path.join(runDir, 'run.json'), runJson);

  if (options.advance) {
    if (!options.plan) {
      throw new Error('--advance requires --plan <docs/plans/...>');
    }
    const nextStatus = {
      schemaVersion: 1,
      initializedAt: status.initializedAt ?? new Date().toISOString(),
      lastSyncedCommit: target,
      lastSyncedAt: new Date().toISOString(),
      lastTargetCommit: target,
      lastRunDir: rel(runDir),
      pendingRunDir: workingCandidates.length > 0 ? rel(runDir) : null,
      lastPlan: options.plan,
      notes: [
        'lastSyncedCommit accounts for committed inputs only.',
        'Working-tree overlay is visible in run artifacts but not baselined until committed.',
      ],
    };
    writeJson(statusPath, nextStatus);
  }

  console.log(
    JSON.stringify({ ...runJson, advanced: options.advance }, null, 2)
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
