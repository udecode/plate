import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  PLATE_DOM_EXPORTS,
  PLATE_FACADE_DIFFS,
} from './check-plite-release-artifacts.mjs';
import { readPackageEntrypoints } from './export-targets.mjs';

const require = createRequire(import.meta.url);
const ts = require('@typescript/typescript6');

const compareStrings = (left, right) => {
  if (left < right) return -1;
  if (left > right) return 1;

  return 0;
};

const repoRoot = resolve(import.meta.dirname, '../..');
const docsRoots = [join(repoRoot, 'content/docs')];
const pliteDocsPrefix = 'content/docs/plite/';
const wwwPublicRoot = join(repoRoot, 'apps/www/public');
const markdownImagePattern = /!\[[^\]]*\]\(([^)\s]+)/g;
const inlineCodePattern = /`[^`\n]*`/g;
const identifierPattern = /[A-Za-z_$][\w$]*/g;
const migrationGuides = [
  'content/docs/plite/to-plate.mdx',
  'content/docs/plite/to-plate.cn.mdx',
];
const absoluteUrlPattern = /^[a-z][a-z\d+.-]*:/i;
const comparisonDocs = new Set(['content/docs/(guides)/performance.mdx']);
const contractPath = join(
  repoRoot,
  'packages/plitejs/test/public-surface-contract.ts'
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
  'content/docs/(plugins)/(elements)/details.cn.mdx',
  'content/docs/(plugins)/(elements)/details.mdx',
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
  'content/docs/plite/to-plate.mdx',
  'docs/plite/agent-start.md',
  'docs/plite/absolute-architecture-release-claim.md',
  'docs/plite/references/architecture-contract.md',
]);

const removedPlateNodeBagPattern =
  /\bnode\s*:\s*\{[\s\S]{0,400}?\b(?:type|element|mark|component|isElement|isLeaf|isInline|isVoid|isMarkableVoid|isSelectable|isContainer|isStrictSiblings|isMetadataProp|isDecoration|dangerouslyAllowAttributes|toDataAttributes)\s*:/;
const basePluginExtendComponentPattern =
  /\bBase[\w$]*Plugin\s*\.\s*extend\s*\(\s*(?:\([^)]*\)\s*=>\s*\(?\s*)?\{[\s\S]{0,400}?\bcomponent\s*:/;
const terminalComponentConversionPattern =
  /\btoReactPlugin\s*\(\s*Base[\w$]*Plugin\s*\)\s*\.\s*configure\s*\(\s*\{[\s\S]{0,400}?\bcomponent\s*:/;
const staticBaseKitReactAdapterPattern =
  /(?:\b[\w-]+-base-kit\b[^\n]{0,500}\btoReactPlugin\s*\(\s*Base[\w$]*Plugin\b|\btoReactPlugin\s*\(\s*Base[\w$]*Plugin\b[^\n]{0,500}\b[\w-]+-base-kit\b)/i;
const staticEditorBaseReactAdapterPattern =
  /(?=[\s\S]*\bfrom\s+['"](?:(?:platejs|@platejs\/core)\/static|[^'"]*-static)['"])[\s\S]*\btoReactPlugin\s*\(\s*Base[\w$]*Plugin\b/;
const invalidBaseRendererDocPatterns = [
  {
    pattern: terminalComponentConversionPattern,
    reason:
      'terminal consumers configure the Base descriptor directly; owning React adapters pass component to toReactPlugin() while publishing the Plate descriptor',
  },
  {
    pattern: basePluginExtendComponentPattern,
    reason:
      'Base .extend() cannot define component; use the constructor default or terminal .configure({ component }) replacement',
  },
  {
    pattern: staticBaseKitReactAdapterPattern,
    reason:
      'static/base kits declare or configure component on the Base descriptor without platejs/react',
  },
];

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
  {
    pattern: staticEditorBaseReactAdapterPattern,
    reason:
      'static editors use terminal BasePlugin.configure({ component }) without platejs/react; toReactPlugin(BasePlugin) is for live React',
  },
];

const removedRootMutationFacadePattern =
  /\b(?:editor\.(?:tf|transforms)|overrideEditor)\b|\btf\s*:\s*\{/;
const removedPlateSchemaFlagsPattern =
  /\bnode\.(?:component|element|mark|isElement|isLeaf|isInline|isVoid|isMarkableVoid|isSelectable|isContainer|isStrictSiblings|isMetadataProp)\b|\b(?:isElement\s*:\s*true[^\n]{0,160}\bisLeaf\s*:\s*true|isLeaf\s*:\s*true[^\n]{0,160}\bisElement\s*:\s*true|setting\s+both\s+isElement\s+and\s+isLeaf\s+to\s+true)\b/;
const removedSchemaTargetOptionsPattern =
  /\boptions\s*:\s*\{[^}\n]*\btargetPlugins\b/;
const removedCaptionTargetOptionsPattern =
  /\boptions\s*:\s*\{\s*query\s*:\s*\{\s*allow\s*:/;
const removedPluginApiPortalPattern = /\beditor\.getApi\s*\(/;
const removedPluginValidationPattern = /\bvalidateConfiguration\b/;
const removedExplicitPluginGenericPattern = /\bdefinePlugin\s*</;
const removedLoosePluginPortalSignaturePattern =
  /\bplugin\s*<[^>]*\bPlugin\s*<\s*PluginDefinition\s*>/;
const removedPlatePluginShapePattern =
  /\b(?:AnyPluginConfig|BasePluginExtensionContract|EffectiveExtensionContractField|EffectivePlateContractField|InferConfig|InferPluginDefinitionTree|MergePlatePluginDefinitions|PluginConfig|TPlatePluginConfig|UnifiedRuntimeBasePluginConfig|UnifiedRuntimePlatePluginConfig|__config|targetPluginKeys)\b|\.clone\s*\(\)|\b(?:extension|handlers|pluginApi)\s*:\s*\{|\b(?:plugin|[A-Za-z_$][\w$]*Plugin)\.pluginApi\b/;
const removedDefinitionAliasNamePattern =
  /\btype\s+(?![A-Za-z_$][\w$]*Definition\b)[A-Za-z_$][\w$]*\s*=\s*DefinitionOf\s*</;
const removedGenericDependencyReferencePattern =
  /\bPluginDependencyReference\s*</;
const removedInternalDependencyTypePattern =
  /(?:\b(?:PluginDependencyContractReference|PluginDependencyReferenceFor|PluginInstalledCapabilitiesOf|PluginTypeLambda|PluginTypeProviderOf|PluginWitnessFor)\b[\s\S]{0,500}\bfrom\s+['"]plitejs(?:\/internal)?['"]|\bfrom\s+['"]plitejs\/internal['"])/;
const removedZeroArgumentReactPattern = /\breact\s*\(\s*\)/;
const removedStaticCapabilityPattern =
  /\b(?:api|commands|read|readMiddleware|update)\s*:\s*\{/;
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
    pattern: removedPluginApiPortalPattern,
    reason: 'plugin APIs use editor.api.<name> or editor.plugin(Plugin).api',
  },
  {
    pattern: removedPluginValidationPattern,
    reason: 'plugin candidate validation uses validate',
  },
  {
    pattern: removedExplicitPluginGenericPattern,
    reason: 'definePlugin infers one definition from its author object',
  },
  {
    pattern: removedLoosePluginPortalSignaturePattern,
    reason:
      'editor.plugin accepts an installed PluginReference guarded by the editor capability set',
  },
  {
    pattern: removedPlatePluginShapePattern,
    reason:
      'Plate plugins use one flat definition, prefixless on events, and no clone method',
  },
  {
    pattern: removedDefinitionAliasNamePattern,
    reason: 'aliases derived with DefinitionOf must end in Definition',
  },
  {
    pattern: removedGenericDependencyReferencePattern,
    reason: 'root dependency references are shallow and non-generic',
  },
  {
    pattern: removedInternalDependencyTypePattern,
    reason: 'Plite dependency contracts use clean public names from plitejs',
  },
  {
    pattern: removedZeroArgumentReactPattern,
    reason: 'low-level React composition uses react({ dom })',
  },
  {
    pattern: removedStaticCapabilityPattern,
    reason:
      'extension and plugin API, read, update, readMiddleware, and commands fields are factory-only',
  },
  {
    pattern: removedSchemaTargetOptionsPattern,
    reason:
      'schema target plugin descriptors belong in top-level targetPlugins',
  },
  {
    pattern: removedCaptionTargetOptionsPattern,
    reason:
      'caption target plugin descriptors belong in top-level targetPlugins',
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
    reason: 'plugin commands own typed semantic actions',
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
    reason: 'plugins use commands, corrections, and query middleware',
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
  'tooling/plite/donor/proof/yjs-collaboration-soak.mjs',
  'tooling/plite/donor/proof/yjs-hocuspocus-persistent-room-soak.mjs',
  'tooling/plite/donor/proof/yjs-hocuspocus-production-soak.mjs',
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
  !path.startsWith('content/docs/plite/to-plate');
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
    .sort(compareStrings);

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
      .sort(compareStrings);
  }

  return agentTextFilePattern.test(path) ? [path] : [];
};

const readLedgerRows = (path) => {
  const source = readFileSync(path, 'utf-8').trimEnd();

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
    contract = readFileSync(contractPath, 'utf-8');
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
    'utf-8'
  );

  for (const signal of requiredAgentStartManualSoakSignals) {
    if (!agentStartSource.includes(signal)) {
      failures.push(
        `docs/plite/agent-start.md: missing manual-only Yjs soak runner signal: ${signal}`
      );
    }
  }

  const platePackageJson = JSON.parse(
    readFileSync(join(repoRoot, 'packages/platejs/package.json'), 'utf-8')
  );
  const plateScripts = platePackageJson.scripts ?? {};

  for (const alias of yjsSoakScriptAliases) {
    if (Object.hasOwn(plateScripts, alias)) {
      failures.push(
        `packages/platejs/package.json: Yjs soak script alias must stay manual-only and absent: ${alias}`
      );
    }
  }

  for (const script of Object.values(plateScripts)) {
    for (const signal of manualYjsSoakRunnerSignals) {
      if (String(script).includes(signal)) {
        failures.push(
          `packages/platejs/package.json: automatic scripts must not reference manual-only Yjs soak runner: ${signal}`
        );
      }
    }
  }

  for (const path of [
    join(repoRoot, 'AGENTS.md'),
    ...collectAgentTextFiles(join(repoRoot, '.agents/rules')),
    ...collectAgentTextFiles(join(repoRoot, '.agents/skills')),
  ]) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf-8');

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
    const source = readFileSync(path, 'utf-8');
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

    for (const { pattern, reason } of invalidBaseRendererDocPatterns) {
      const innerMatch = pattern.exec(source);

      if (innerMatch?.index === undefined) continue;

      const lineNumber = source.slice(0, innerMatch.index).split('\n').length;
      const line = source.split('\n')[lineNumber - 1]?.trim() ?? innerMatch[0];

      failures.push(`${relativePath}:${lineNumber}: ${reason}: ${line}`);
    }
  }

  for (const path of [...schemaAdoptionDocs].sort(compareStrings)) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf-8');
    const lines = source.split('\n');
    const schemaMatch = removedPlateSchemaFlagsPattern.exec(source);

    if (schemaMatch?.index !== undefined) {
      const lineNumber = source.slice(0, schemaMatch.index).split('\n').length;
      const line = lines[lineNumber - 1]?.trim() ?? schemaMatch[0];

      failures.push(
        `${relativePath}:${lineNumber}: Plate plugin semantics belong under schema.element or schema.mark: ${line}`
      );
    }

    for (const { pattern, reason } of invalidBaseRendererDocPatterns) {
      const match = pattern.exec(source);

      if (match?.index === undefined) continue;

      const lineNumber = source.slice(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1]?.trim() ?? match[0];

      failures.push(`${relativePath}:${lineNumber}: ${reason}: ${line}`);
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

  for (const path of [...auditedDocs].sort(compareStrings)) {
    const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
    const source = readFileSync(path, 'utf-8');
    const lines = source.split('\n');
    const codeLines = inCodeFenceByLine(lines);

    if (relativePath.startsWith('content/docs/')) {
      // fumadocs-mdx's dynamic mode compiles MDX without a bundler and never
      // imports an image, so only apps/www/public serves one in every mode.
      lines.forEach((line, index) => {
        if (codeLines.has(index)) return;

        for (const [, src] of line
          .replace(inlineCodePattern, '')
          .matchAll(markdownImagePattern)) {
          if (absoluteUrlPattern.test(src)) continue;
          if (src.startsWith('/') && existsSync(join(wwwPublicRoot, src))) {
            continue;
          }

          failures.push(
            `${relativePath}:${index + 1}: docs images must be absolute paths to files in apps/www/public: ${src}`
          );
        }
      });
      if (
        !relativePath.startsWith(pliteDocsPrefix) &&
        !comparisonDocs.has(relativePath) &&
        /plite/i.test(source)
      ) {
        failures.push(
          `${relativePath}: public Plate docs must use the public editor API and vocabulary; Plite belongs only in the Plite docs section and the approved comparison pages.`
        );
      }
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

  const pairedDiffs = comparePairedEntrypoints(repoRoot);

  for (const guide of migrationGuides) {
    const source = readFileSync(join(repoRoot, guide), 'utf-8');

    for (const { change, entrypoint, name } of checkGuideCoverage(
      source,
      pairedDiffs
    )) {
      failures.push(
        `${guide}: ${entrypoint} ${change} Plite's ${name}, so the guide must list it in inline code with its Plate replacement`
      );
    }
  }

  const reboundSource = readFileSync(
    join(repoRoot, reboundContractPath),
    'utf-8'
  );

  for (const { entrypoint, name } of checkReboundContractCoverage(
    reboundSource,
    pairedDiffs
  )) {
    failures.push(
      `${reboundContractPath}: ${entrypoint} rebinds Plite's ${name}, so the rebound contract type test must cover it`
    );
  }

  failures.push(...checkFacadeDiffsCoverage(pairedDiffs));
  failures.push(...auditLowerCamelPluginNames(repoRoot));

  return failures;
}

const reboundContractPath =
  'packages/platejs/type-tests/plite-rebound-contracts.tsx';
const lowerCamelPattern = /^[a-z][a-zA-Z0-9]*$/;
const generatedPluginPrefixPattern = /^(?:schema|slot|state-field):/;
const pluginNameCallPattern =
  /\b(?:definePlugin|defineRuntimePlugin|defineEditorSchema)(?:<[^>]*>)?\s*\(\s*(['"`])([^'"`]+)\1/g;
const testFilePattern =
  /(?:^|\/)(?:__tests__|tests)\/|\.(?:spec|test|slow)\.[cm]?[jt]sx?$/;

const readTsconfig = (root) => {
  const configPath = join(root, 'tsconfig.json');
  const { config, error } = ts.readConfigFile(configPath, (file) =>
    ts.sys.readFile(file)
  );

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
  }

  return ts.parseJsonConfigFileContent(config, ts.sys, root);
};

const resolveAliasedSymbol = (checker, symbol) => {
  let target = symbol;
  const seen = new Set();

  while (target && target.flags & ts.SymbolFlags.Alias && !seen.has(target)) {
    seen.add(target);
    target =
      checker.getImmediateAliasedSymbol(target) ??
      checker.getAliasedSymbol(target);
  }

  return target;
};

const symbolDeclarationKeys = (checker, symbol) => {
  const target = resolveAliasedSymbol(checker, symbol);

  return (target?.declarations ?? [])
    .map(
      (declaration) =>
        `${declaration.getSourceFile().fileName}:${declaration.pos}`
    )
    .sort(compareStrings);
};

const isTypeOnlyExportDeclaration = (declaration) => {
  if (ts.isExportSpecifier(declaration)) {
    return Boolean(
      declaration.isTypeOnly || declaration.parent?.parent?.isTypeOnly
    );
  }
  if (ts.isNamespaceExport(declaration)) {
    return Boolean(declaration.parent?.isTypeOnly);
  }

  return false;
};

const isRuntimeValueSymbol = (checker, symbol) => {
  let current = symbol;
  const seen = new Set();

  while (
    current &&
    current.flags & ts.SymbolFlags.Alias &&
    !seen.has(current)
  ) {
    const declarations = current.declarations ?? [];

    if (
      declarations.length > 0 &&
      declarations.every(isTypeOnlyExportDeclaration)
    ) {
      return false;
    }

    seen.add(current);
    current =
      checker.getImmediateAliasedSymbol(current) ??
      checker.getAliasedSymbol(current);
  }

  if (!current || !(current.flags & ts.SymbolFlags.Value)) return false;

  return (current.declarations ?? []).some(
    (declaration) =>
      !declaration.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword
      )
  );
};

const sameKeys = (left, right) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export function comparePairedEntrypoints(root = repoRoot) {
  const { options } = readTsconfig(root);
  const pliteEntrypoints = readPackageEntrypoints(
    join(root, 'packages/plitejs')
  );
  const plateEntrypoints = readPackageEntrypoints(
    join(root, 'packages/platejs')
  );
  const pairs = [];

  for (const [
    pliteSpecifier,
    pliteSource,
  ] of pliteEntrypoints.sourceBySpecifier) {
    if (pliteSpecifier === 'plitejs/internal') continue;
    const plateSpecifier = pliteSpecifier.replace(/^plitejs/, 'platejs');
    const plateSource = plateEntrypoints.sourceBySpecifier.get(plateSpecifier);

    if (!plateSource) continue;
    pairs.push({ plateSource, plateSpecifier, pliteSource, pliteSpecifier });
  }

  pairs.sort((left, right) =>
    compareStrings(left.plateSpecifier, right.plateSpecifier)
  );

  const program = ts.createProgram(
    pairs.flatMap(({ plateSource, pliteSource }) => [pliteSource, plateSource]),
    { ...options, noEmit: true }
  );
  const checker = program.getTypeChecker();
  const diffs = [];

  for (const { plateSource, plateSpecifier, pliteSource } of pairs) {
    const pliteFile = program.getSourceFile(pliteSource);
    const plateFile = program.getSourceFile(plateSource);
    const pliteModule = pliteFile && checker.getSymbolAtLocation(pliteFile);
    const plateModule = plateFile && checker.getSymbolAtLocation(plateFile);

    if (!pliteModule || !plateModule) continue;

    const plateExports = new Map(
      checker.getExportsOfModule(plateModule).map((exported) => [
        exported.name,
        {
          isValue: isRuntimeValueSymbol(checker, exported),
          keys: symbolDeclarationKeys(checker, exported),
        },
      ])
    );

    if (plateSpecifier === 'platejs/dom') {
      const actualDomExports = [...plateExports.entries()]
        .filter(([, entry]) => entry.isValue)
        .map(([name]) => name)
        .sort(compareStrings);
      const expectedDomExports = [...PLATE_DOM_EXPORTS].sort(compareStrings);

      if (!sameKeys(actualDomExports, expectedDomExports)) {
        diffs.push({
          actualDomExports,
          change: 'runtime exports differ from PLATE_DOM_EXPORTS',
          entrypoint: plateSpecifier,
          expectedDomExports,
          isValue: true,
          kind: 'dom-exports',
          name: 'PLATE_DOM_EXPORTS',
        });
      }
    }

    for (const exported of checker.getExportsOfModule(pliteModule)) {
      const { name } = exported;
      const isValue = isRuntimeValueSymbol(checker, exported);
      const plateExport = plateExports.get(name);

      if (!plateExport) {
        diffs.push({
          change: 'does not export',
          entrypoint: plateSpecifier,
          isValue,
          kind: 'dropped',
          name,
        });
        continue;
      }

      const pliteKeys = symbolDeclarationKeys(checker, exported);

      if (isValue && !plateExport.isValue) {
        diffs.push({
          change: 'does not export',
          entrypoint: plateSpecifier,
          isValue: true,
          kind: 'dropped',
          name,
        });
        continue;
      }

      if (!sameKeys(pliteKeys, plateExport.keys)) {
        diffs.push({
          change: 'rebinds',
          entrypoint: plateSpecifier,
          isValue,
          kind: 'rebound',
          name,
        });
      }
    }
  }

  return diffs.sort(
    (left, right) =>
      compareStrings(left.entrypoint, right.entrypoint) ||
      compareStrings(left.name, right.name)
  );
}

const collectFilesUnder = (root, relativeTarget) => {
  const fullPath = join(root, relativeTarget);

  if (!existsSync(fullPath)) return [];
  if (statSync(fullPath).isFile()) return [fullPath];

  const found = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const next = join(dir, entry.name);

      if (entry.isDirectory()) walk(next);
      else if (entry.isFile()) found.push(next);
    }
  };

  walk(fullPath);

  return found.sort(compareStrings);
};

export function auditLowerCamelPluginNames(root = repoRoot) {
  const failures = [];
  const checkFile = (fullPath, allowGeneratedPrefix) => {
    const relativePath = relative(root, fullPath).replaceAll('\\', '/');

    if (allowGeneratedPrefix && testFilePattern.test(relativePath)) return;
    if (!/\.(?:[cm]?[jt]sx?|mdx?)$/.test(relativePath)) return;

    const source = readFileSync(fullPath, 'utf-8');

    pluginNameCallPattern.lastIndex = 0;
    for (const match of source.matchAll(pluginNameCallPattern)) {
      const name = match[2];

      if (lowerCamelPattern.test(name)) continue;
      if (allowGeneratedPrefix && generatedPluginPrefixPattern.test(name)) {
        continue;
      }

      const lineNumber = source.slice(0, match.index ?? 0).split('\n').length;

      failures.push(
        `${relativePath}:${lineNumber}: plugin and schema names must be lower camel case: ${name}`
      );
    }
  };

  for (const target of [
    'content/docs/plite',
    'packages/plitejs/README.md',
    'apps/www/src/app/(app)/examples/plite',
  ]) {
    for (const file of collectFilesUnder(root, target)) {
      checkFile(file, false);
    }
  }

  for (const target of ['packages/plitejs/src', 'packages/platejs/src']) {
    for (const file of collectFilesUnder(root, target)) {
      checkFile(file, true);
    }
  }

  return failures;
}

const checkGuideCoverage = (source, diffs) => {
  const listed = new Set(
    (source.match(inlineCodePattern) ?? []).flatMap(
      (span) => span.match(identifierPattern) ?? []
    )
  );

  return diffs.filter(
    ({ kind, name }) => kind !== 'dom-exports' && !listed.has(name)
  );
};

const checkReboundContractCoverage = (source, diffs) => {
  const identifiers = new Set(source.match(identifierPattern));

  return diffs.filter(
    ({ kind, name }) => kind === 'rebound' && !identifiers.has(name)
  );
};

export const checkFacadeDiffsCoverage = (
  diffs,
  facadeDiffs = PLATE_FACADE_DIFFS
) => {
  const failures = [];
  const runtimeDiffsByEntrypoint = new Map();

  for (const diff of diffs) {
    if (diff.kind === 'dom-exports') {
      failures.push(
        `tooling/scripts/check-plite-release-artifacts.mjs: PLATE_DOM_EXPORTS (${diff.expectedDomExports.join(', ')}) differs from live platejs/dom runtime exports (${diff.actualDomExports.join(', ')})`
      );
      continue;
    }

    if (!diff.isValue || diff.entrypoint === 'platejs/dom') continue;

    let entry = runtimeDiffsByEntrypoint.get(diff.entrypoint);

    if (!entry) {
      entry = { dropped: [], rebound: [] };
      runtimeDiffsByEntrypoint.set(diff.entrypoint, entry);
    }

    entry[diff.kind].push(diff.name);
  }

  const entrypoints = new Set([
    ...Object.keys(facadeDiffs),
    ...runtimeDiffsByEntrypoint.keys(),
  ]);

  for (const entrypoint of [...entrypoints].sort(compareStrings)) {
    const actual = runtimeDiffsByEntrypoint.get(entrypoint) ?? {
      dropped: [],
      rebound: [],
    };
    const expected = facadeDiffs[entrypoint] ?? { dropped: [], rebound: [] };

    for (const kind of ['dropped', 'rebound']) {
      const actualNames = [...actual[kind]].sort(compareStrings);
      const expectedNames = [...(expected[kind] ?? [])].sort(compareStrings);

      if (!sameKeys(actualNames, expectedNames)) {
        const missing = actualNames.filter(
          (name) => !expectedNames.includes(name)
        );
        const stale = expectedNames.filter(
          (name) => !actualNames.includes(name)
        );
        const parts = [];

        if (missing.length > 0) parts.push(`missing [${missing.join(', ')}]`);
        if (stale.length > 0) parts.push(`stale [${stale.join(', ')}]`);
        failures.push(
          `tooling/scripts/check-plite-release-artifacts.mjs: PLATE_FACADE_DIFFS[${JSON.stringify(entrypoint)}].${kind} is out of date (${parts.join('; ')})`
        );
      }
    }
  }

  return failures;
};

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
