import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = resolve(import.meta.dirname, '../..');
const docsRoot = join(repoRoot, 'docs/slate-v2');
const contractPath = join(
  repoRoot,
  '.tmp/slate-v2/packages/slate/test/public-surface-contract.ts'
);
const requiredContractSignals = [
  'bannedSlateRootHelperExports',
  'bannedEditorInstanceSurface',
  "'getSelection'",
  "'getChildren'",
  "'Transforms'",
];

const teachingDocs = new Set([
  'docs/slate-v2/agent-start.md',
  'docs/slate-v2/absolute-architecture-release-claim.md',
  'docs/slate-v2/references/architecture-contract.md',
]);

const staleCodePatterns = [
  {
    pattern:
      /\beditor\.(getSelection|getChildren|getSnapshot|getFragment|getOperations|getLastCommit|getPathByRuntimeId|getRuntimeId)\s*\(/,
    reason: 'public reads must go through editor.read((state) => ...)',
  },
  {
    pattern:
      /\beditor\.(insertNodes|insertNode|setNodes|moveNodes|wrapNodes|unwrapNodes|removeNodes|insertText|insertFragment|delete|select|move)\s*\(/,
    reason: 'public writes must go through editor.update((tx) => ...)',
  },
  {
    pattern: /\bTransforms\./,
    reason: 'primary Slate v2 docs must not teach Transforms.*',
  },
];

const staleTeachingPatterns = [
  {
    pattern:
      /`editor\.(getSelection|getChildren|getSnapshot|getFragment|getOperations|getLastCommit|getPathByRuntimeId|getRuntimeId)\(\)`\s+reads/,
    reason: 'public read prose must name editor.read state groups',
  },
  {
    pattern:
      /`editor\.(insertNodes|insertNode|setNodes|moveNodes|wrapNodes|unwrapNodes|removeNodes|insertText|insertFragment|delete|select|move)\(/,
    reason: 'public write prose must name editor.update tx groups',
  },
];

const manualYjsSoakRunnerSignals = [
  'scripts/proof/yjs-collaboration-soak.mjs',
  'scripts/proof/yjs-hocuspocus-persistent-room-soak.mjs',
  'scripts/proof/persistent-browser-soak.mjs',
  'scripts/proof/yjs-hocuspocus-production-soak.mjs',
];

const yjsSoakScriptAliases = [
  'test:yjs-collaboration-soak',
  'test:yjs-hocuspocus-persistent-room-soak',
  'test:persistent-soak',
  'test:yjs-hocuspocus-production-soak',
];
const requiredAgentStartManualSoakSignals = [
  ...manualYjsSoakRunnerSignals,
  'manual-only diagnostics',
  'user explicitly asks',
  'Do not add them to `check`, `test`,',
];
const agentTextFilePattern = /\.(md|mdc)$/;
const yjsResearchLedgerPaths = [
  'docs/slate-v2/research/2026-06-14-yjs-large-doc-import-readback/lead-ledger.tsv',
  'docs/slate-v2/research/2026-06-14-yjs-large-doc-import-readback/promoted-ledger.tsv',
  'docs/slate-v2/research/2026-06-14-yjs-large-doc-import-readback/read-log.tsv',
];
const yjsResearchClosureLedgerPaths = new Set([
  'docs/slate-v2/research/2026-06-14-yjs-large-doc-import-readback/lead-ledger.tsv',
  'docs/slate-v2/research/2026-06-14-yjs-large-doc-import-readback/promoted-ledger.tsv',
]);
const actionableLedgerStatuses = new Set([
  'candidate',
  'open',
  'pending',
  'promote',
  'promoted-pending',
  'queued',
  'tbd',
  'todo',
  'untriaged',
]);

const collectMarkdown = (dir) =>
  readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);

      if (statSync(path).isDirectory()) {
        return collectMarkdown(path);
      }

      return path.endsWith('.md') ? [path] : [];
    })
    .sort();

const inCodeFenceByLine = (lines) => {
  const codeLines = new Set();
  let inFence = false;

  lines.forEach((line, index) => {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      return;
    }

    if (inFence) {
      codeLines.add(index);
    }
  });

  return codeLines;
};

const collectAgentTextFiles = (path) => {
  if (statSync(path).isDirectory()) {
    return readdirSync(path)
      .flatMap((entry) => collectAgentTextFiles(join(path, entry)))
      .sort();
  }

  return agentTextFilePattern.test(path) ? [path] : [];
};

const readLedgerRows = (path) => {
  const source = readFileSync(path, 'utf8').trimEnd();

  if (source.length === 0) {
    return { header: [], rows: [] };
  }

  const [headerLine, ...rowLines] = source.split('\n');
  const header = headerLine.split('\t');
  const rows = rowLines.map((line, index) => ({
    cols: line.split('\t'),
    line: index + 2,
  }));

  return { header, rows };
};

const normalizedLedgerValue = (value) => value.trim().toLowerCase();

const isActionableLedgerValue = (value) => {
  const normalized = normalizedLedgerValue(value);

  return (
    actionableLedgerStatuses.has(normalized) ||
    normalized.startsWith('needs-') ||
    normalized.includes('pending')
  );
};

const isClosedLedgerValue = (value) => {
  const normalized = normalizedLedgerValue(value);

  return (
    normalized === 'closed' ||
    normalized === 'complete' ||
    normalized === 'defer' ||
    normalized === 'deferred-architecture' ||
    normalized === 'done' ||
    normalized === 'n/a' ||
    normalized === 'promoted-kept' ||
    normalized === 'rejected' ||
    normalized === 'supporting' ||
    normalized.startsWith('deferred-') ||
    normalized.startsWith('kept:') ||
    normalized.startsWith('quarantined:') ||
    normalized.startsWith('no actionable')
  );
};

const closureColumnIndexes = (header) =>
  ['status', 'decision']
    .map((columnName) =>
      header.findIndex((name) => name.trim().toLowerCase() === columnName)
    )
    .filter((index) => index >= 0)
    .slice(0, 1);

function auditSlateV2Docs() {
  const failures = [];
  let contract = '';

  try {
    contract = readFileSync(contractPath, 'utf8');
  } catch {
    failures.push(
      `${relative(repoRoot, contractPath).replaceAll('\\', '/')}: missing public-surface contract`
    );
  }

  for (const signal of requiredContractSignals) {
    if (!contract.includes(signal)) {
      failures.push(
        `${relative(repoRoot, contractPath).replaceAll('\\', '/')}: missing expected public-surface signal: ${signal}`
      );
    }
  }

  const agentStartSource = readFileSync(
    join(repoRoot, 'docs/slate-v2/agent-start.md'),
    'utf8'
  );

  for (const signal of requiredAgentStartManualSoakSignals) {
    if (!agentStartSource.includes(signal)) {
      failures.push(
        `docs/slate-v2/agent-start.md: missing manual-only Yjs soak runner signal: ${signal}`
      );
    }
  }

  const slateV2PackageJson = JSON.parse(
    readFileSync(join(repoRoot, '.tmp/slate-v2/package.json'), 'utf8')
  );
  const slateV2Scripts = slateV2PackageJson.scripts ?? {};

  for (const alias of yjsSoakScriptAliases) {
    if (Object.hasOwn(slateV2Scripts, alias)) {
      failures.push(
        `.tmp/slate-v2/package.json: Yjs soak script alias must stay manual-only and absent: ${alias}`
      );
    }
  }

  for (const script of Object.values(slateV2Scripts)) {
    for (const signal of manualYjsSoakRunnerSignals) {
      if (String(script).includes(signal)) {
        failures.push(
          `.tmp/slate-v2/package.json: automatic scripts must not reference manual-only Yjs soak runner: ${signal}`
        );
      }
    }
  }

  for (const path of [
    join(repoRoot, '.agents/AGENTS.md'),
    ...collectAgentTextFiles(join(repoRoot, '.agents/rules')),
    ...collectAgentTextFiles(join(repoRoot, '.agents/skills')),
  ]) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf8');

    for (const signal of manualYjsSoakRunnerSignals) {
      if (source.includes(signal)) {
        failures.push(
          `${relativePath}: manual-only Yjs soak runner reference belongs only in docs/slate-v2/agent-start.md or the docs audit guard: ${signal}`
        );
      }
    }
  }

  for (const ledgerPath of yjsResearchLedgerPaths) {
    const absolutePath = join(repoRoot, ledgerPath);
    const { header, rows } = readLedgerRows(absolutePath);

    if (header.length === 0) {
      failures.push(`${ledgerPath}: empty TSV ledger`);
      continue;
    }

    const closureIndexes = yjsResearchClosureLedgerPaths.has(ledgerPath)
      ? closureColumnIndexes(header)
      : [];

    if (
      yjsResearchClosureLedgerPaths.has(ledgerPath) &&
      closureIndexes.length === 0
    ) {
      failures.push(`${ledgerPath}: missing status or decision closure column`);
    }

    for (const row of rows) {
      if (row.cols.length !== header.length) {
        failures.push(
          `${ledgerPath}:${row.line}: expected ${header.length} TSV columns, found ${row.cols.length}`
        );
      }

      for (const index of closureIndexes) {
        const value = row.cols[index] ?? '';

        if (isActionableLedgerValue(value) || !isClosedLedgerValue(value)) {
          failures.push(
            `${ledgerPath}:${row.line}: research ledger closure column is not closed: ${header[index]}=${value}`
          );
        }
      }
    }
  }

  for (const path of collectMarkdown(docsRoot)) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf8');
    const lines = source.split('\n');
    const codeLines = inCodeFenceByLine(lines);

    lines.forEach((line, index) => {
      if (codeLines.has(index)) {
        for (const { pattern, reason } of staleCodePatterns) {
          if (pattern.test(line)) {
            failures.push(
              `${relativePath}:${index + 1}: ${reason}: ${line.trim()}`
            );
          }
        }
      }

      if (teachingDocs.has(relativePath)) {
        for (const { pattern, reason } of staleTeachingPatterns) {
          if (pattern.test(line)) {
            failures.push(
              `${relativePath}:${index + 1}: ${reason}: ${line.trim()}`
            );
          }
        }
      }
    });
  }

  return failures;
}

function runAudit() {
  const failures = auditSlateV2Docs();

  if (failures.length > 0) {
    console.error('Slate v2 docs audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Slate v2 docs audit passed.');
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runAudit();
}

export {
  auditSlateV2Docs,
  closureColumnIndexes,
  isActionableLedgerValue,
  isClosedLedgerValue,
};
