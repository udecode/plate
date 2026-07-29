import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactDirectory = dirname(fileURLToPath(import.meta.url));
const plateRepository = join(artifactDirectory, '../../../..');
const repository = join(plateRepository, '../wordgard');
const manifestPath = join(artifactDirectory, 'wordgard-source-manifest.json');
const reportPath = join(artifactDirectory, 'wordgard-architecture-report.md');
const harvesterDirectory = join(
  plateRepository,
  'docs/editor-test-harvester/wordgard'
);
const expectedHead = '01eb2b5eae509509677345fd603acad001827dff';
const failures = [];
const fail = (message) => failures.push(message);
const runGitBuffer = (...args) =>
  execFileSync('git', ['-C', repository, ...args], {
    encoding: 'buffer',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const runGit = (...args) =>
  runGitBuffer(...args)
    .toString()
    .trimEnd();
const nulList = (...args) =>
  runGitBuffer(...args)
    .toString()
    .split('\0')
    .filter(Boolean);
const hash = (value) => createHash('sha256').update(value).digest('hex');

const head = runGit('rev-parse', '--verify', 'HEAD');
const clean =
  runGit('status', '--porcelain', '--untracked-files=normal') === '';
const trackedPaths = nulList('ls-files', '-z').sort();
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const report = readFileSync(reportPath, 'utf8');

if (head !== expectedHead)
  fail(`Wordgard HEAD ${head} does not match ${expectedHead}`);
if (!clean) fail('Wordgard checkout is dirty');
if (!report.includes(expectedHead))
  fail(`Architecture report lacks exact commit ${expectedHead}`);
if (manifest.authority.commit !== expectedHead)
  fail(`Manifest commit is ${manifest.authority.commit}`);
if (!manifest.authority.clean)
  fail('Manifest does not record a clean checkout');
if (manifest.authority.license.spdx !== 'MIT')
  fail(`Manifest license is ${manifest.authority.license.spdx}`);
if (manifest.files.length !== trackedPaths.length)
  fail(
    `Manifest has ${manifest.files.length} files; git has ${trackedPaths.length}`
  );
if (
  JSON.stringify(manifest.files.map((file) => file.path)) !==
  JSON.stringify(trackedPaths)
)
  fail('Manifest tracked-file order/content differs from git');

const conceptIds = new Set(manifest.concepts.map((concept) => concept.id));
if (conceptIds.size !== 73)
  fail(`Expected 73 semantic concepts, found ${conceptIds.size}`);

for (const file of manifest.files) {
  const absolutePath = join(repository, file.path);
  if (!existsSync(absolutePath)) {
    fail(`Missing source file ${file.path}`);
    continue;
  }
  const bytes = readFileSync(absolutePath);
  if (hash(bytes) !== file.sha256) fail(`Hash mismatch for ${file.path}`);
  if (file.status === 'mapped' && file.conceptIds.length === 0)
    fail(`Mapped file lacks concepts: ${file.path}`);
  if (file.status === 'excluded' && !file.exclusionReason)
    fail(`Excluded file lacks reason: ${file.path}`);
  for (const conceptId of file.conceptIds)
    if (!conceptIds.has(conceptId))
      fail(`Unknown concept ${conceptId} in ${file.path}`);
  for (const item of file.declarationItems) {
    if (item.status === 'mapped' && item.conceptIds.length === 0)
      fail(`Mapped declaration lacks concepts: ${item.evidence} ${item.name}`);
    if (item.line < 1 || item.line > file.lineCount)
      fail(`Declaration line outside file: ${item.evidence} ${item.name}`);
  }
}

const expectedSummary = {
  declarationItems: 3275,
  excludedDeclarationItems: 12,
  excludedFiles: 6,
  mappedDeclarationItems: 3263,
  mappedFiles: 114,
  privateDeclarationItems: 1347,
  publicDeclarationItems: 1928,
  semanticConcepts: 73,
  trackedFiles: 120,
  unmappedDeclarationItems: 0,
  unmappedFiles: 0,
};
for (const [key, value] of Object.entries(expectedSummary))
  if (manifest.summary[key] !== value)
    fail(`Summary ${key} is ${manifest.summary[key]}, expected ${value}`);
for (const [key, value] of Object.entries(manifest.validation))
  if (value !== true) fail(`Manifest validation ${key} is not true`);

const citationPattern = /`(\.\.\/wordgard\/[^`\n:]+):(\d+)(?:-(\d+))?`/g;
let citations = 0;
for (const match of report.matchAll(citationPattern)) {
  citations++;
  const path = match[1].slice('../wordgard/'.length);
  const start = Number(match[2]);
  const end = Number(match[3] ?? match[2]);
  const absolutePath = join(repository, path);
  if (!existsSync(absolutePath)) {
    fail(`Missing report citation ${match[0]}`);
    continue;
  }
  const lineCount = readFileSync(absolutePath, 'utf8').split('\n').length;
  if (start < 1 || end < start || end > lineCount)
    fail(`Citation outside ${lineCount} lines: ${match[0]}`);
}
if (citations < 80)
  fail(`Expected at least 80 exact citations, found ${citations}`);

for (const required of [
  '## Complete semantic concept ledger',
  '## Ranked Wordgard pressure for the parent comparison',
  '## Explicit Wordgard mechanism dispositions',
  '### Keep or mine',
  '### Reject',
  '### Defer',
  '## Test-harvester closure',
  '## Closure statement',
])
  if (!report.includes(required)) fail(`Report lacks ${required}`);
if (report.includes('`01eb2b5eae509509677345fd603acad001827df`'))
  fail('Report contains truncated Wordgard commit');

const testPaths = trackedPaths.filter(
  (path) => path.startsWith('test/') && path.endsWith('.ts')
);
const testLines = testPaths.reduce(
  (total, path) =>
    total + readFileSync(join(repository, path), 'utf8').split('\n').length - 1,
  0
);
const testCalls = testPaths.reduce((total, path) => {
  const source = readFileSync(join(repository, path), 'utf8');
  return total + (source.match(/\bit\(/g)?.length ?? 0);
}, 0);
if (testPaths.length !== 27)
  fail(`Expected 27 Wordgard test files, found ${testPaths.length}`);
if (testLines !== 6039)
  fail(`Expected 6039 Wordgard test lines, found ${testLines}`);
if (testCalls !== 644)
  fail(`Expected 644 Wordgard it() calls, found ${testCalls}`);

for (const file of ['report.md', 'inventory.md', 'test-index.md']) {
  const path = join(harvesterDirectory, file);
  if (!existsSync(path)) {
    fail(`Missing test-harvester artifact ${file}`);
    continue;
  }
  const text = readFileSync(path, 'utf8');
  if (!text.includes(expectedHead))
    fail(`Test-harvester ${file} lacks exact commit`);
  if (text.includes('`01eb2b5eae509509677345fd603acad001827df`'))
    fail(`Test-harvester ${file} contains truncated commit`);
}

if (failures.length) {
  process.stderr.write(`${failures.join('\n')}\n`);
  process.exit(1);
}

process.stdout.write(
  `${JSON.stringify({
    citations,
    commit: head,
    concepts: conceptIds.size,
    declarations: manifest.summary.declarationItems,
    files: manifest.summary.trackedFiles,
    testCalls,
    testFiles: testPaths.length,
    testLines,
    zeroUnmapped: true,
  })}\n`
);
