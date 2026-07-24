import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const repoRoot = resolve(import.meta.dirname, '../..');
const docsRoots = [
  join(repoRoot, 'content/docs/plite'),
  join(repoRoot, 'content/docs/api/plite'),
];
const contractPath = join(
  repoRoot,
  'packages/plite/test/public-surface-contract.ts'
);
const requiredContractSignals = [
  'bannedPublicSurface',
  'bannedPublicTypeSlop',
  'browserProofSpecs',
  'getPackageExportSpecifiers',
  'publicAuthoringFiles',
];

const teachingDocs = new Set([
  'content/docs/(plugins)/(elements)/media.cn.mdx',
  'content/docs/(plugins)/(elements)/media.mdx',
  'content/docs/(plugins)/(elements)/heading.mdx',
  'content/docs/(plugins)/(elements)/toggle.cn.mdx',
  'content/docs/(plugins)/(elements)/toggle.mdx',
  'content/docs/(plugins)/(styles)/indent.cn.mdx',
  'content/docs/(plugins)/(styles)/indent.mdx',
  'content/docs/(plugins)/(styles)/line-height.cn.mdx',
  'content/docs/(plugins)/(styles)/line-height.mdx',
  'content/docs/(plugins)/(styles)/list.cn.mdx',
  'content/docs/(plugins)/(styles)/list.mdx',
  'content/docs/(plugins)/(styles)/text-align.cn.mdx',
  'content/docs/(plugins)/(styles)/text-align.mdx',
  'content/docs/(guides)/debugging.cn.mdx',
  'content/docs/(guides)/debugging.mdx',
  'content/docs/(guides)/editing-behavior.mdx',
  'content/docs/(guides)/plugin-methods.cn.mdx',
  'content/docs/(guides)/plugin-methods.mdx',
  'content/docs/(guides)/plugin-rules.cn.mdx',
  'content/docs/(guides)/plugin-rules.mdx',
  'content/docs/(guides)/plugin.cn.mdx',
  'content/docs/(guides)/plugin.mdx',
  'content/docs/api/core/plate-plugin.cn.mdx',
  'content/docs/api/core/plate-plugin.mdx',
  'content/docs/migration/plite-to-plate.mdx',
  'docs/plite/agent-start.md',
  'docs/plite/absolute-architecture-release-claim.md',
  'docs/plite/references/architecture-contract.md',
]);

const removedPlateNodeBagPattern =
  /\bnode\s*:\s*\{[\s\S]{0,400}?\b(?:type|element|mark|component|isElement|isLeaf|isInline|isVoid|isMarkableVoid|isSelectable|isContainer|isStrictSiblings|isMetadataProp|isDecoration|dangerouslyAllowAttributes|toDataAttributes)\s*:/;

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
    reason: 'primary Plite v2 docs must not teach Transforms.*',
  },
];

const deletedCodeBlockPatterns = [
  {
    pattern: removedPlateNodeBagPattern,
    reason:
      'Plate plugin semantics belong under schema.element or schema.mark; the node bag is deleted',
  },
];

const removedRootMutationFacadePattern =
  /\b(?:editor\.(?:tf|transforms)|overrideEditor)\b|\btf\s*:\s*\{/;
const removedPlateSchemaFlagsPattern =
  /\bnode\.(?:component|element|mark|isElement|isLeaf|isInline|isVoid|isMarkableVoid|isSelectable|isContainer|isStrictSiblings|isMetadataProp)\b|\bisMarkableVoid\b|\b(?:isElement\b[^\n]{0,160}\bisLeaf|isLeaf\b[^\n]{0,160}\bisElement)\b/;
const removedSchemaTargetOptionsPattern =
  /\boptions\s*:\s*\{[^}\n]*\btargetPluginKeys\b/;
const removedCaptionTargetOptionsPattern =
  /\boptions\s*:\s*\{\s*query\s*:\s*\{\s*allow\s*:/;
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

const deletedArchitecturePatterns = [
  {
    pattern: removedSchemaTargetOptionsPattern,
    reason:
      'schema target plugin descriptors belong in top-level targetPluginKeys',
  },
  {
    pattern: removedCaptionTargetOptionsPattern,
    reason:
      'caption target plugin descriptors belong in top-level targetPluginKeys',
  },
  {
    pattern: removedRootMutationFacadePattern,
    reason:
      'current docs must use editor.update.*, an active tx, or a scoped plugin command',
  },
  {
    pattern:
      /\b(?:tx\.fragment\.insert|editor\.update(?:\([^)]*\))?\.fragment\.insert)\b/,
    reason: 'decoded content uses a fitted slice replacement',
  },
  {
    pattern: /\boperations\.apply\b/,
    reason: 'canonical changes use the changes transaction group',
  },
  {
    pattern:
      /\b(?:EditorTransformMiddleware|getEditorTransformRegistry|setEditorTransformRegistry)\b/,
    reason: 'pure command handlers replace transform middleware registries',
  },
  {
    pattern:
      /\b(?:EditorTransformMiddleware(?:Args|Context|Map)|transform middleware|extension transform hooks)\b/i,
    reason: 'pure command handlers replace transform middleware',
  },
  {
    pattern: /\bextension `transforms`\b/i,
    reason: 'extension commands own typed semantic actions',
  },
  {
    pattern: /\b(?:commit|batch)\.(?:intents|operations)\b/,
    reason: 'canonical changes are the only document replay truth',
  },
  {
    pattern: /\b(?:applyOperations|tx\.operations\.replay)\b/,
    reason: 'canonical changes use tx.changes.apply',
  },
  {
    pattern: /\b(?:intent|operation) middleware\b/i,
    reason: 'extensions use commands, corrections, and query middleware',
  },
  {
    pattern: /\bchildrenChanged\b/,
    reason: 'commit document queries use change.changed.has("document")',
  },
  {
    pattern: /\b(?:snapshot[^.\n]{0,120}marks|marks[^.\n]{0,120}snapshot)\b/i,
    reason: 'pending insertion marks belong to collapsed text selections',
  },
  {
    pattern:
      /\b(?:Normalizing is multi-pass|final normalization pass|normalizer (?:can )?loop forever)\b/i,
    reason:
      'canonical construction and event-indexed corrections replace normalization loops',
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
const isCurrentSchemaAdoptionDoc = (path) =>
  path.startsWith('content/docs/') &&
  !path.startsWith('content/docs/migration/');
const yjsResearchLedgerPaths = [
  'docs/plite/research/2026-06-14-yjs-large-doc-import-readback/lead-ledger.tsv',
  'docs/plite/research/2026-06-14-yjs-large-doc-import-readback/promoted-ledger.tsv',
  'docs/plite/research/2026-06-14-yjs-large-doc-import-readback/read-log.tsv',
];
const yjsResearchClosureLedgerPaths = new Set([
  'docs/plite/research/2026-06-14-yjs-large-doc-import-readback/lead-ledger.tsv',
  'docs/plite/research/2026-06-14-yjs-large-doc-import-readback/promoted-ledger.tsv',
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

      return path.endsWith('.md') || path.endsWith('.mdx') ? [path] : [];
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
      `${relative(repoRoot, contractPath).replaceAll(
        '\\',
        '/'
      )}: missing public-surface contract`
    );
  }

  for (const signal of requiredContractSignals) {
    if (!contract.includes(signal)) {
      failures.push(
        `${relative(repoRoot, contractPath).replaceAll(
          '\\',
          '/'
        )}: missing expected public-surface signal: ${signal}`
      );
    }
  }

  const agentStartSource = readFileSync(
    join(repoRoot, 'docs/plite/agent-start.md'),
    'utf8'
  );

  for (const signal of requiredAgentStartManualSoakSignals) {
    if (!agentStartSource.includes(signal)) {
      failures.push(
        `docs/plite/agent-start.md: missing manual-only Yjs soak runner signal: ${signal}`
      );
    }
  }

  const yjsPackageJson = JSON.parse(
    readFileSync(join(repoRoot, 'packages/yjs/package.json'), 'utf8')
  );
  const yjsScripts = yjsPackageJson.scripts ?? {};

  for (const alias of yjsSoakScriptAliases) {
    if (Object.hasOwn(yjsScripts, alias)) {
      failures.push(
        `packages/yjs/package.json: Yjs soak script alias must stay manual-only and absent: ${alias}`
      );
    }
  }

  for (const script of Object.values(yjsScripts)) {
    for (const signal of manualYjsSoakRunnerSignals) {
      if (String(script).includes(signal)) {
        failures.push(
          `packages/yjs/package.json: automatic scripts must not reference manual-only Yjs soak runner: ${signal}`
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
          `${relativePath}: manual-only Yjs soak runner reference belongs only in docs/plite/agent-start.md or the docs audit guard: ${signal}`
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

  const auditedDocs = new Set([
    ...docsRoots.flatMap(collectMarkdown),
    ...[...teachingDocs].map((path) => join(repoRoot, path)),
  ]);
  const schemaAdoptionDocs = new Set([
    ...collectMarkdown(join(repoRoot, 'content/docs')).filter((path) =>
      isCurrentSchemaAdoptionDoc(relative(repoRoot, path).replaceAll('\\', '/'))
    ),
    ...auditedDocs,
  ]);
  const currentReleaseNotes = collectMarkdown(join(repoRoot, '.changeset'));

  for (const path of currentReleaseNotes) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf8');
    const match = removedRootMutationFacadePattern.exec(source);

    if (match?.index !== undefined) {
      const lineNumber = source.slice(0, match.index).split('\n').length;
      const line = source.split('\n')[lineNumber - 1]?.trim() ?? match[0];

      failures.push(
        `${relativePath}:${lineNumber}: current release notes must teach editor.update.*, an active tx, or a scoped plugin command: ${line}`
      );
    }

    const schemaMatch = removedPlateSchemaFlagsPattern.exec(source);

    if (schemaMatch?.index !== undefined) {
      const lineNumber = source.slice(0, schemaMatch.index).split('\n').length;
      const line = source.split('\n')[lineNumber - 1]?.trim() ?? schemaMatch[0];

      failures.push(
        `${relativePath}:${lineNumber}: current release notes must use schema.element or schema.mark: ${line}`
      );
    }

    const nodeBagMatch = removedPlateNodeBagPattern.exec(source);

    if (nodeBagMatch?.index !== undefined) {
      const lineNumber = source.slice(0, nodeBagMatch.index).split('\n').length;
      const line =
        source.split('\n')[lineNumber - 1]?.trim() ?? nodeBagMatch[0];

      failures.push(
        `${relativePath}:${lineNumber}: current release notes must not teach the deleted Plate node bag: ${line}`
      );
    }
  }

  for (const path of [...schemaAdoptionDocs].sort()) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf8');
    const lines = source.split('\n');
    const schemaMatch = removedPlateSchemaFlagsPattern.exec(source);

    if (schemaMatch?.index !== undefined) {
      const lineNumber = source.slice(0, schemaMatch.index).split('\n').length;
      const line = lines[lineNumber - 1]?.trim() ?? schemaMatch[0];

      failures.push(
        `${relativePath}:${lineNumber}: Plate plugin semantics belong under schema.element or schema.mark: ${line}`
      );
    }

    for (const fence of source.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
      const code = fence[1] ?? '';

      for (const { pattern, reason } of deletedCodeBlockPatterns) {
        const match = pattern.exec(code);

        if (match?.index === undefined) continue;

        const codeOffset = (fence.index ?? 0) + fence[0].indexOf(code);
        const matchOffset = codeOffset + match.index;
        const lineNumber = source.slice(0, matchOffset).split('\n').length;
        const line = lines[lineNumber - 1]?.trim() ?? match[0];

        failures.push(`${relativePath}:${lineNumber}: ${reason}: ${line}`);
      }
    }
  }

  for (const path of [...auditedDocs].sort()) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf8');
    const lines = source.split('\n');
    const codeLines = inCodeFenceByLine(lines);

    if (relativePath.startsWith('content/docs/')) {
      for (const signal of [
        ...manualYjsSoakRunnerSignals,
        ...yjsSoakScriptAliases,
      ]) {
        if (source.includes(signal)) {
          failures.push(
            `${relativePath}: public docs must not claim an unregistered manual Yjs soak runner: ${signal}`
          );
        }
      }
    }

    for (const { pattern, reason } of deletedArchitecturePatterns) {
      const match = pattern.exec(source);

      if (match?.index !== undefined) {
        const lineNumber = source.slice(0, match.index).split('\n').length;
        const line = lines[lineNumber - 1]?.trim() ?? match[0];

        failures.push(`${relativePath}:${lineNumber}: ${reason}: ${line}`);
      }
    }

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
    console.error('Plite v2 docs audit failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('Plite v2 docs audit passed.');
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
  isCurrentSchemaAdoptionDoc,
  removedPlateNodeBagPattern,
  removedPlateSchemaFlagsPattern,
  removedRootMutationFacadePattern,
  removedCaptionTargetOptionsPattern,
  removedSchemaTargetOptionsPattern,
};
