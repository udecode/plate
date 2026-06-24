#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../..');
const outDir = path.join(repoRoot, 'docs/transplant/slate-v2');

const manifestPath = path.join(outDir, 'donor-manifest.tsv.txt');
const manifestJsonlPath = path.join(outDir, 'donor-manifest.jsonl');
const excludedPath = path.join(outDir, 'donor-excluded.tsv.txt');
const metaPath = path.join(outDir, 'donor-manifest-meta.json');
const summaryPath = path.join(outDir, 'donor-manifest-summary.md');

const checkMode = process.argv.includes('--check');

function readOption(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;

  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value`);
  }

  return value;
}

const donorRootInput = readOption('--donor') ?? process.env.SLATE_V2_DONOR_DIR;
const donorRoot = donorRootInput
  ? path.resolve(repoRoot, donorRootInput)
  : undefined;

const TREE_ENTRY_RE = /^(\d+) (\S+) ([0-9a-f]+)\t(.+)$/;
const LOG_OUTPUT_RE = /\.(log|trace|har)$/;
const PACKAGE_DOC_RE = /^(README|Readme|CHANGELOG|License)\.md$/i;
const ROOT_DOC_RE = /^(README|Readme|License)\.md$/i;

const generatedFiles = [
  manifestPath,
  manifestJsonlPath,
  excludedPath,
  metaPath,
  summaryPath,
];

function git(args, options = {}) {
  if (!donorRoot) {
    throw new Error(
      'Missing donor checkout path. Pass --donor <path> or set SLATE_V2_DONOR_DIR.'
    );
  }

  return execFileSync('git', ['-C', donorRoot, ...args], {
    encoding: options.encoding ?? 'utf8',
    maxBuffer: options.maxBuffer ?? 1024 * 1024 * 128,
  });
}

function requireDonor() {
  if (!existsSync(donorRoot)) {
    throw new Error(
      `Missing donor checkout: ${donorRoot}. Pass --donor <path> or set SLATE_V2_DONOR_DIR.`
    );
  }
  const inside = git(['rev-parse', '--is-inside-work-tree']).trim();
  if (inside !== 'true') {
    throw new Error(`${donorRoot} is not a git checkout`);
  }
}

function readGitTree() {
  const raw = git(['ls-tree', '-r', '-z', '--full-tree', 'HEAD'], {
    encoding: 'buffer',
  });

  return raw
    .toString('utf8')
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const match = entry.match(TREE_ENTRY_RE);

      if (!match) {
        throw new Error(`Unexpected git tree entry: ${entry}`);
      }

      return {
        mode: match[1],
        type: match[2],
        gitBlobSha: match[3],
        path: match[4],
      };
    })
    .filter((entry) => entry.type === 'blob')
    .sort((a, b) => a.path.localeCompare(b.path));
}

const excludeRules = [
  ['git-dir', (file) => file === '.git' || file.startsWith('.git/')],
  ['node-modules', (file) => hasSegment(file, 'node_modules')],
  ['package-dist', (file) => hasSegment(file, 'dist')],
  [
    'next-output',
    (file) => hasSegment(file, '.next') || file.startsWith('site/out/'),
  ],
  ['turbo-cache', (file) => hasSegment(file, '.turbo')],
  ['coverage-output', (file) => hasSegment(file, 'coverage')],
  ['test-results', (file) => hasSegment(file, 'test-results')],
  ['playwright-report', (file) => hasSegment(file, 'playwright-report')],
  [
    'scratch-tmp',
    (file) => file.startsWith('.tmp/') || file.startsWith('tmp/'),
  ],
  ['cache-output', (file) => hasSegment(file, '.cache')],
  ['os-junk', (file) => file.endsWith('/.DS_Store') || file === '.DS_Store'],
  ['log-output', (file) => LOG_OUTPUT_RE.test(file)],
];

function hasSegment(file, segment) {
  return file.split('/').includes(segment);
}

function exclusionReason(file) {
  return excludeRules.find(([, matches]) => matches(file))?.[0] ?? null;
}

function categoryFor(file) {
  if (file.startsWith('packages/')) {
    const parts = file.split('/');
    const section = parts[2];
    const basename = path.basename(file);

    if (section === 'src') return 'package-source';
    if (section === 'test') return 'package-test';
    if (section === 'benchmarks') return 'package-benchmark';
    if (
      [
        'package.json',
        'tsconfig.json',
        'tsconfig.build.json',
        'tsdown.config.mts',
        'vite.config.ts',
        'vitest.config.ts',
        'bunfig.toml',
      ].includes(basename)
    ) {
      return 'package-config';
    }
    if (PACKAGE_DOC_RE.test(basename)) {
      return 'package-doc';
    }
    return 'package-other';
  }

  if (file.startsWith('scripts/benchmarks/')) return 'benchmark-script';
  if (file.startsWith('scripts/stress/')) return 'stress-script';
  if (file.startsWith('scripts/proof/')) return 'proof-script';
  if (file.startsWith('scripts/')) return 'script';

  if (file.startsWith('playwright/integration/'))
    return 'playwright-integration';
  if (file.startsWith('playwright/stress/')) return 'playwright-stress';
  if (file.startsWith('playwright/docker/')) return 'playwright-docker';
  if (file.startsWith('playwright/')) return 'playwright';

  if (file.startsWith('site/examples/')) return 'site-example';
  if (file.startsWith('site/pages/examples/')) return 'site-example-route';
  if (file.startsWith('site/components/')) return 'site-component';
  if (file.startsWith('site/public/')) return 'site-public';
  if (file.startsWith('site/')) return 'site-app';

  if (file.startsWith('docs/')) return 'docs';
  if (file.startsWith('.changeset/')) return 'changeset';
  if (file.startsWith('config/')) return 'config';
  if (file.startsWith('.github/')) return 'github-config';
  if (file.startsWith('autoresearch.')) return 'research-artifact';

  if (
    [
      '.editorconfig',
      '.gitattributes',
      '.gitbook.yaml',
      '.gitignore',
      '.markdownlint.json',
      '.prettierignore',
      '.prettierrc',
      'biome.jsonc',
      'bun.lock',
      'bunfig.toml',
      'eslint.config.mjs',
      'now.json',
      'package.json',
      'playwright.config.ts',
      'tsconfig.json',
      'turbo.json',
    ].includes(file)
  ) {
    return 'root-config';
  }

  if (ROOT_DOC_RE.test(file)) return 'root-doc';

  return 'root-other';
}

function blobContent(blobSha) {
  return git(['cat-file', '-p', blobSha], {
    encoding: 'buffer',
    maxBuffer: 1024 * 1024 * 256,
  });
}

function tsvEscape(value) {
  return String(value).replaceAll('\t', ' ').replaceAll('\n', '\\n');
}

function makeArtifacts() {
  requireDonor();

  const branch = git(['branch', '--show-current']).trim();
  const commit = git(['rev-parse', 'HEAD']).trim();
  const commitTime = git(['show', '-s', '--format=%cI', 'HEAD']).trim();
  const remotes = git(['remote', '-v']).trim().split('\n').filter(Boolean);

  const treeEntries = readGitTree();
  const included = [];
  const excluded = [];

  for (const entry of treeEntries) {
    const reason = exclusionReason(entry.path);

    if (reason) {
      excluded.push({ ...entry, reason });
      continue;
    }

    const content = blobContent(entry.gitBlobSha);
    included.push({
      path: entry.path,
      category: categoryFor(entry.path),
      mode: entry.mode,
      bytes: content.byteLength,
      sha256: createHash('sha256').update(content).digest('hex'),
      gitBlobSha: entry.gitBlobSha,
    });
  }

  const categoryCounts = countBy(included, 'category');
  const packageCounts = countBy(
    included.filter((item) => item.path.startsWith('packages/')),
    (item) => item.path.split('/')[1]
  );

  const meta = {
    schemaVersion: 1,
    donor: {
      path: path.relative(repoRoot, donorRoot) || '.',
      branch,
      commit,
      commitTime,
      remotes,
    },
    policy: {
      include: [
        'all tracked files from the donor HEAD commit unless explicitly excluded below',
        'packages with source, tests, configs, README/CHANGELOG, and package-owned benchmarks',
        'root package manager, TypeScript, lint, build, Playwright, and workspace configs',
        'scripts including benchmark, proof, stress, integration, and local server helpers',
        'Playwright integration, stress, and docker proof assets',
        'site examples and example route/app shell files needed to port proof routes',
        'docs, changesets, GitHub templates/workflows, and config files',
      ],
      exclude: excludeRules.map(([name]) => name),
    },
    totals: {
      gitTreeFiles: treeEntries.length,
      includedFiles: included.length,
      excludedFiles: excluded.length,
      includedBytes: included.reduce((sum, item) => sum + item.bytes, 0),
    },
    categories: categoryCounts,
    packages: packageCounts,
  };

  return {
    excludedTsv: renderExcludedTsv(excluded),
    jsonl: renderJsonl(included),
    manifestTsv: renderManifestTsv(included),
    metaJson: `${JSON.stringify(meta, null, 2)}\n`,
    summary: renderSummary(meta, excluded),
  };
}

function countBy(items, fieldOrFn) {
  const counts = {};

  for (const item of items) {
    const key =
      typeof fieldOrFn === 'function' ? fieldOrFn(item) : item[fieldOrFn];
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.fromEntries(
    Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
  );
}

function renderManifestTsv(items) {
  const rows = ['path\tcategory\tmode\tbytes\tsha256\tgit_blob_sha'];

  for (const item of items) {
    rows.push(
      [
        item.path,
        item.category,
        item.mode,
        item.bytes,
        item.sha256,
        item.gitBlobSha,
      ]
        .map(tsvEscape)
        .join('\t')
    );
  }

  return `${rows.join('\n')}\n`;
}

function renderJsonl(items) {
  return `${items.map((item) => JSON.stringify(item)).join('\n')}\n`;
}

function renderExcludedTsv(items) {
  const rows = ['path\treason\tmode\tgit_blob_sha'];

  for (const item of items) {
    rows.push(
      [item.path, item.reason, item.mode, item.gitBlobSha]
        .map(tsvEscape)
        .join('\t')
    );
  }

  return `${rows.join('\n')}\n`;
}

function renderSummary(meta, excluded) {
  const categoryRows = Object.entries(meta.categories)
    .map(([category, count]) => `| ${category} | ${count} |`)
    .join('\n');
  const packageRows = Object.entries(meta.packages)
    .map(([pkg, count]) => `| ${pkg} | ${count} |`)
    .join('\n');
  const excludedRows =
    excluded.length === 0
      ? '- None.'
      : excluded
          .slice(0, 20)
          .map((item) => `- \`${item.path}\` -> ${item.reason}`)
          .join('\n');

  return `# Slate v2 Donor Manifest Summary

## Donor

- Path: \`${meta.donor.path}\`
- Branch: \`${meta.donor.branch}\`
- Commit: \`${meta.donor.commit}\`
- Commit time: \`${meta.donor.commitTime}\`

## Totals

- Git tree files: ${meta.totals.gitTreeFiles}
- Included files: ${meta.totals.includedFiles}
- Excluded files: ${meta.totals.excludedFiles}
- Included bytes: ${meta.totals.includedBytes}

## Include Policy

${meta.policy.include.map((item) => `- ${item}`).join('\n')}

## Exclude Policy

${meta.policy.exclude.map((item) => `- ${item}`).join('\n')}

## Category Counts

| Category | Files |
| --- | ---: |
${categoryRows}

## Package Counts

| Package | Files |
| --- | ---: |
${packageRows}

## Excluded Tracked Files

${excludedRows}

## Artifacts

- \`docs/transplant/slate-v2/donor-manifest.tsv.txt\`
- \`docs/transplant/slate-v2/donor-manifest.jsonl\`
- \`docs/transplant/slate-v2/donor-excluded.tsv.txt\`
- \`docs/transplant/slate-v2/donor-manifest-meta.json\`
- \`docs/transplant/slate-v2/donor-manifest-summary.md\`

## Verification

\`\`\`bash
node docs/transplant/slate-v2/scripts/build-donor-manifest.mjs --check
\`\`\`
`;
}

function readIfExists(file) {
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
}

function parseManifestTsv(content) {
  const [header, ...lines] = content.trimEnd().split('\n');

  if (header !== 'path\tcategory\tmode\tbytes\tsha256\tgit_blob_sha') {
    throw new Error('Unexpected donor manifest TSV header');
  }

  return lines.map((line) => {
    const [filePath, category, mode, bytes, sha256, gitBlobSha] =
      line.split('\t');

    if (!filePath || !category || !mode || !bytes || !sha256 || !gitBlobSha) {
      throw new Error(`Malformed donor manifest row: ${line}`);
    }
    if (!/^[0-9]+$/.test(bytes)) {
      throw new Error(`Malformed donor manifest byte count: ${line}`);
    }
    if (!/^[0-9a-f]{64}$/.test(sha256)) {
      throw new Error(`Malformed donor manifest sha256: ${line}`);
    }
    if (!/^[0-9a-f]{40}$/.test(gitBlobSha)) {
      throw new Error(`Malformed donor manifest git blob sha: ${line}`);
    }

    return {
      path: filePath,
      category,
      mode,
      bytes: Number(bytes),
      sha256,
      gitBlobSha,
    };
  });
}

function parseExcludedTsv(content) {
  const [header, ...lines] = content.trimEnd().split('\n');

  if (header !== 'path\treason\tmode\tgit_blob_sha') {
    throw new Error('Unexpected donor excluded TSV header');
  }

  return lines.map((line) => {
    const [filePath, reason, mode, gitBlobSha] = line.split('\t');

    if (!filePath || !reason || !mode || !gitBlobSha) {
      throw new Error(`Malformed donor excluded row: ${line}`);
    }
    if (!/^[0-9a-f]{40}$/.test(gitBlobSha)) {
      throw new Error(`Malformed donor excluded git blob sha: ${line}`);
    }

    return {
      path: filePath,
      reason,
      mode,
      gitBlobSha,
    };
  });
}

function parseJsonl(content) {
  if (!content.trim()) return [];
  return content
    .trimEnd()
    .split('\n')
    .map((line) => JSON.parse(line));
}

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);

  if (actualJson !== expectedJson) {
    throw new Error(`${label} mismatch: ${actualJson} !== ${expectedJson}`);
  }
}

function checkStoredArtifacts() {
  const manifest = readIfExists(manifestPath);
  const jsonl = readIfExists(manifestJsonlPath);
  const excluded = readIfExists(excludedPath);
  const metaJson = readIfExists(metaPath);
  const summary = readIfExists(summaryPath);
  const missing = [
    [manifestPath, manifest],
    [manifestJsonlPath, jsonl],
    [excludedPath, excluded],
    [metaPath, metaJson],
    [summaryPath, summary],
  ]
    .filter(([, content]) => content === null)
    .map(([file]) => path.relative(repoRoot, file));

  if (missing.length > 0) {
    throw new Error(
      `Donor manifest artifacts are missing:\n${missing
        .map((item) => `- ${item}`)
        .join('\n')}`
    );
  }

  const meta = JSON.parse(metaJson);
  const manifestRows = parseManifestTsv(manifest);
  const jsonlRows = parseJsonl(jsonl);
  const excludedRows = parseExcludedTsv(excluded);
  const manifestPaths = manifestRows.map((row) => row.path);
  const jsonlPaths = jsonlRows.map((row) => row.path);

  assertDeepEqual(jsonlPaths, manifestPaths, 'manifest TSV and JSONL paths');
  assertDeepEqual(countBy(manifestRows, 'category'), meta.categories, 'category counts');
  assertDeepEqual(
    countBy(
      manifestRows.filter((item) => item.path.startsWith('packages/')),
      (item) => item.path.split('/')[1]
    ),
    meta.packages,
    'package counts'
  );

  const includedBytes = manifestRows.reduce((sum, row) => sum + row.bytes, 0);

  if (meta.totals.includedFiles !== manifestRows.length) {
    throw new Error('stored manifest includedFiles total mismatch');
  }
  if (meta.totals.excludedFiles !== excludedRows.length) {
    throw new Error('stored manifest excludedFiles total mismatch');
  }
  if (meta.totals.gitTreeFiles !== manifestRows.length + excludedRows.length) {
    throw new Error('stored manifest gitTreeFiles total mismatch');
  }
  if (meta.totals.includedBytes !== includedBytes) {
    throw new Error('stored manifest includedBytes total mismatch');
  }
  if (!summary.includes(`Commit: \`${meta.donor.commit}\``)) {
    throw new Error('stored manifest summary does not include donor commit');
  }
  if (!summary.includes(`Included files: ${meta.totals.includedFiles}`)) {
    throw new Error('stored manifest summary does not include included count');
  }
}

function writeArtifacts(artifacts) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(manifestPath, artifacts.manifestTsv);
  writeFileSync(manifestJsonlPath, artifacts.jsonl);
  writeFileSync(excludedPath, artifacts.excludedTsv);
  writeFileSync(metaPath, artifacts.metaJson);
  writeFileSync(summaryPath, artifacts.summary);
}

function checkArtifacts(artifacts) {
  const expected = new Map([
    [manifestPath, artifacts.manifestTsv],
    [manifestJsonlPath, artifacts.jsonl],
    [excludedPath, artifacts.excludedTsv],
    [metaPath, artifacts.metaJson],
    [summaryPath, artifacts.summary],
  ]);

  const mismatches = [];

  for (const [file, content] of expected) {
    if (readIfExists(file) !== content) {
      mismatches.push(path.relative(repoRoot, file));
    }
  }

  if (mismatches.length > 0) {
    throw new Error(
      `Donor manifest artifacts are stale or missing:\n${mismatches
        .map((item) => `- ${item}`)
        .join('\n')}`
    );
  }
}

if (checkMode && (!donorRoot || !existsSync(donorRoot))) {
  checkStoredArtifacts();
  console.log('donor manifest stored artifact check passed');
  for (const file of generatedFiles) {
    if (existsSync(file)) {
      console.log(path.relative(repoRoot, file));
    }
  }
  process.exit(0);
}

const artifacts = makeArtifacts();

if (checkMode) {
  checkArtifacts(artifacts);
  console.log('donor manifest check passed');
} else {
  writeArtifacts(artifacts);
  console.log('donor manifest written');
}

for (const file of generatedFiles) {
  if (existsSync(file)) {
    console.log(path.relative(repoRoot, file));
  }
}
