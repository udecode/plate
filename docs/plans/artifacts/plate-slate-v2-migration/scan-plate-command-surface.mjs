import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(new URL('../../../..', import.meta.url).pathname);
const outDir = path.resolve(
  repoRoot,
  'docs/plans/artifacts/plate-slate-v2-migration'
);

const roots = ['packages'];
const extensions = new Set(['.ts', '.tsx']);
const ignoredSegments = new Set([
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'test-results',
]);

const patterns = [
  { kind: 'extend-api', regex: /\.extendApi\s*</g },
  { kind: 'extend-api', regex: /\.extendApi\s*\(/g },
  { kind: 'extend-editor-api', regex: /\.extendEditorApi\s*</g },
  { kind: 'extend-editor-api', regex: /\.extendEditorApi\s*\(/g },
  { kind: 'extend-transforms', regex: /\.extendTransforms\s*</g },
  { kind: 'extend-transforms', regex: /\.extendTransforms\s*\(/g },
  { kind: 'extend-editor-transforms', regex: /\.extendEditorTransforms\s*</g },
  { kind: 'extend-editor-transforms', regex: /\.extendEditorTransforms\s*\(/g },
  { kind: 'override-editor', regex: /\.overrideEditor\s*\(/g },
  { kind: 'extend-editor', regex: /\bextendEditor\s*:/g },
];

function rel(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join('/');
}

function shouldIgnore(filePath) {
  return filePath
    .split(path.sep)
    .some((segment) => ignoredSegments.has(segment));
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir) || shouldIgnore(dir)) return files;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (shouldIgnore(fullPath)) continue;

    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (extensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function ownerFor(relativePath) {
  const parts = relativePath.split('/');

  if (parts[0] === 'packages' && parts[1]) return `packages/${parts[1]}`;

  return parts[0] ?? 'unknown';
}

function getLineNumber(text, index) {
  let line = 1;

  for (let i = 0; i < index; i += 1) {
    if (text.charCodeAt(i) === 10) line += 1;
  }

  return line;
}

function isTxBackedTransformFacade(text, index) {
  const before = text.slice(Math.max(0, index - 4000), index);
  const after = text.slice(index, index + 700);

  return (
    before.includes('.extendTx') &&
    hasEditorUpdateCall(after) &&
    (after.includes('tx[plugin.key]') || hasNamedTxNamespaceCall(after))
  );
}

function hasEditorUpdateCall(text) {
  return text.includes('.update(') || text.includes('.update<');
}

function hasNamedTxNamespaceCall(text) {
  return /\btx\.[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?\s*\(/.test(text);
}

function isMixedTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    isAITransformFacadeDecision(text, index, relativePath) ||
    isDocxExportTransformFacadeDecision(text, index, relativePath) ||
    isFootnoteTransformFacadeDecision(text, index, relativePath) ||
    isListClassicTransformFacadeDecision(text, index, relativePath) ||
    isMediaTransformFacadeDecision(text, index, relativePath) ||
    isTableTransformFacadeDecision(text, index, relativePath) ||
    (after.includes('bindFirst(') &&
      hasEditorUpdateCall(after) &&
      after.includes('blockSelection.')) ||
    (relativePath.endsWith('/BlockSelectionPlugin.tsx') &&
      after.includes('duplicateBlockSelectionNodes') &&
      after.includes('insertBlocksAndSelect') &&
      after.includes('selectBlocks'))
  );
}

function isDocxExportTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/docx-export-plugin.tsx') &&
    after.includes('exportAndDownload') &&
    after.includes('exportToBlob')
  );
}

function isFootnoteTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/BaseFootnoteReferencePlugin.ts') &&
    after.includes('createFootnoteDefinition') &&
    after.includes('focusFootnoteDefinition') &&
    after.includes('insertFootnote')
  );
}

function isListClassicTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/BaseListPlugin.ts') &&
    after.includes('toggle') &&
    (after.includes('toggleBulletedList') ||
      after.includes('toggleNumberedList') ||
      after.includes('toggleTaskList') ||
      after.includes('toggleList'))
  );
}

function isMediaTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    (relativePath.endsWith('/BaseImagePlugin.ts') &&
      after.includes('insertImageFromFiles')) ||
    (relativePath.endsWith('/PlaceholderPlugin.tsx') &&
      after.includes('insertMedia') &&
      after.includes('uploadingFiles'))
  );
}

function isTableTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/BaseTablePlugin.ts') &&
    after.includes('insertTable') &&
    after.includes('mergeTableCells') &&
    after.includes('deleteColumn')
  );
}

function isAITransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    (relativePath.endsWith('/BaseAIPlugin.ts') &&
      after.includes('getAITransforms(editor)')) ||
    (relativePath.endsWith('/AIChatPlugin.ts') &&
      after.includes('acceptAIChat') &&
      after.includes('replaceSelectionAIChat')) ||
    (relativePath.endsWith('/CopilotPlugin.tsx') &&
      after.includes('acceptCopilot') &&
      after.includes('acceptCopilotNextWord'))
  );
}

function isMixedApiRuntimeDecision(text, index, relativePath) {
  const before = text.slice(Math.max(0, index - 12_000), index);
  const after = text.slice(index, index + 12_000);
  const ownerWindow = `${before}${after}`;
  const localApiBody = text.slice(index, index + 1800);

  return (
    !isSpecFixture(relativePath) &&
    (/\beditor\s*\.\s*getApi(?:<[^>]+>)?\s*\(/.test(localApiBody) ||
      ownerWindow.includes('.overrideEditor(') ||
      ownerWindow.includes('.extendEditorTransforms') ||
      ownerWindow.includes('.extendEditorApi') ||
      ownerWindow.includes('extendEditor:'))
  );
}

function isRuntimeBackedApiCapabilityDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    (relativePath.endsWith('/DebugPlugin.ts') &&
      after.includes('debug:')) ||
    (relativePath.endsWith('/DOMPlugin.ts') &&
      after.includes('isScrolling')) ||
    (relativePath.endsWith('/NavigationFeedbackPlugin.ts') &&
      after.includes('navigation:') &&
      after.includes('activeTarget')) ||
    (relativePath.endsWith('/SlateExtensionPlugin.ts') &&
      after.includes('isElementStateEmpty')) ||
    (relativePath.endsWith('/SlateReactExtensionPlugin.ts') &&
      after.includes('redecorate')) ||
    (relativePath.endsWith('/HtmlPlugin.ts') &&
      after.includes('deserializeHtml')) ||
    (relativePath.endsWith('/CsvPlugin.ts') &&
      after.includes('deserializeCsv')) ||
    (relativePath.endsWith('/MarkdownPlugin.ts') &&
      after.includes('deserializeMd') &&
      after.includes('serializeMd')) ||
    (relativePath.endsWith('/BlockMenuPlugin.tsx') &&
      (after.includes('hide:') || after.includes('showContextMenu'))) ||
    (relativePath.endsWith('/BaseTogglePlugin.ts') &&
      after.includes('toggleIds') &&
      after.includes('setOptions')) ||
    (relativePath.endsWith('/BaseCommentPlugin.ts') &&
      after.includes('has:') &&
      after.includes('nodeId:') &&
      after.includes('nodes:')) ||
    (relativePath.endsWith('/BaseFootnoteReferencePlugin.ts') &&
      after.includes('definition(options') &&
      after.includes('duplicateIdentifiers') &&
      after.includes('nextId'))
  );
}

function isPlatePluginStateApiCapability(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/LinkPlugin.tsx') &&
    ((after.includes('link:') && after.includes('getAttributes')) ||
      (after.includes('floatingLink:') &&
        after.includes('hide:') &&
        after.includes('show:')))
  );
}

function isExportSideEffectApiCapability(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/docx-export-plugin.tsx') &&
    after.includes('docxExport:') &&
    after.includes('download:') &&
    after.includes('exportToBlob:')
  );
}

function isExportSideEffectTransformFacade(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/docx-export-plugin.tsx') &&
    after.includes('exportAndDownload') &&
    after.includes('exportToBlob') &&
    after.includes('download')
  );
}

function isStaticDomApiCapability(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/ViewPlugin.ts') &&
    after.includes('getFragment()') &&
    after.includes('getSelectedDomFragment(editor)')
  );
}

function isStaticDomTransformFacade(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    relativePath.endsWith('/ViewPlugin.ts') &&
    after.includes('setFragmentData') &&
    after.includes('getSelectedDomNode') &&
    after.includes('application/x-slate-fragment')
  );
}

function isDeferredRuntimeOwnerDecision(text, index, relativePath) {
  const before = text.slice(Math.max(0, index - 1200), index);
  const after = text.slice(index, index + 1800);
  const ownerWindow = `${before}${after}`;

  if (
    relativePath.endsWith('/BaseAIPlugin.ts') ||
    relativePath.endsWith('/AIChatPlugin.ts') ||
    relativePath.endsWith('/CopilotPlugin.tsx')
  ) {
    return true;
  }

  return (
    relativePath.endsWith('/BaseSuggestionPlugin.ts') &&
    ownerWindow.includes('withSuggestion') &&
    (ownerWindow.includes('.overrideEditor(withSuggestion)') ||
      ownerWindow.includes('.extendApi<BaseSuggestionConfig'))
  ) || (
    relativePath.endsWith('/BaseListPlugin.ts') &&
    (ownerWindow.includes('.overrideEditor(withList)') ||
      ownerWindow.includes('toggleBulletedList') ||
      ownerWindow.includes('toggleNumberedList') ||
      ownerWindow.includes('toggleTaskList') ||
      ownerWindow.includes('toggleList'))
  ) || (
    relativePath.endsWith('/BaseImagePlugin.ts') &&
    (ownerWindow.includes('.overrideEditor(withImageUpload)') ||
      ownerWindow.includes('.overrideEditor(withImageEmbed)') ||
      ownerWindow.includes('insertImageFromFiles'))
  ) || (
    relativePath.endsWith('/PlaceholderPlugin.tsx') &&
    (ownerWindow.includes('writeHistory(stack, batch)') ||
      ownerWindow.includes('insertMedia') ||
      ownerWindow.includes('uploadingFiles'))
  ) || (
    relativePath.endsWith('/BaseTablePlugin.ts') &&
    (ownerWindow.includes('.extendEditorApi<TableConfig') ||
      ownerWindow.includes('.extendEditorTransforms<TableConfig') ||
      ownerWindow.includes('.overrideEditor(withTable)'))
  ) || relativePath.endsWith('/BlockSelectionPlugin.tsx') ||
    relativePath.endsWith('/CursorOverlayPlugin.tsx');
}

function isLegacyBatchTransformDecision(text, index) {
  const after = text.slice(index, index + 5000);

  return (
    after.includes('editor.tf.withoutSaving') &&
    after.includes('editor.tf.setNodesBatch')
  );
}

function isSpecFixture(relativePath) {
  return (
    /\b(spec|test)\.[cm]?[tj]sx?$/.test(relativePath) ||
    relativePath.includes('/type-tests/') ||
    /\.slow\.[cm]?[tj]sx?$/.test(relativePath) ||
    relativePath.endsWith('/PlatePlugin.ts')
  );
}

function isCoreCommandFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1200);

  return (
    relativePath.endsWith('/ExitBreakPlugin.ts') &&
    after.includes('editor.tf.insertExitBreak')
  );
}

function isRuntimeBackedTransformFacadeDecision(text, index, relativePath) {
  const after = text.slice(index, index + 1800);

  return (
    (relativePath.endsWith('/DOMPlugin.ts') &&
      after.includes('withScrolling')) ||
    (relativePath.endsWith('/NavigationFeedbackPlugin.ts') &&
      after.includes('flashTarget') &&
      after.includes('navigate')) ||
    (relativePath.endsWith('/NodeIdPlugin.ts') &&
      after.includes('normalize()')) ||
    (relativePath.endsWith('/SlateExtensionPlugin.ts') &&
      after.includes('insertExitBreak') &&
      after.includes('resetBlock') &&
      after.includes('setValue')) ||
    (relativePath.endsWith('/SlateReactExtensionPlugin.ts') &&
      after.includes('reset(options)')) ||
    (relativePath.endsWith('/ExitBreakPlugin.ts') &&
      after.includes('editor.tf.insertExitBreak')) ||
    relativePath.endsWith('/BaseFootnoteReferencePlugin.ts') &&
      after.includes('createFootnoteDefinition') &&
      after.includes('focusFootnoteDefinition') &&
      after.includes('insertFootnote')
  );
}

function isRuntimeBackedEditorDecision(text, index, relativePath) {
  const before = text.slice(Math.max(0, index - 600), index);
  const after = text.slice(index, index + 1200);
  const ownerWindow = `${before}${after}`;

  return (
    (relativePath.endsWith('/AffinityPlugin.ts') &&
      ownerWindow.includes('overrideEditor') &&
      ownerWindow.includes('insertText')) ||
    (relativePath.endsWith('/ChunkingPlugin.ts') &&
      ownerWindow.includes('withChunking')) ||
    (relativePath.endsWith('/DOMPlugin.ts') &&
      ownerWindow.includes('overrideEditor') &&
      ownerWindow.includes('apply(operation')) ||
    (relativePath.endsWith('/HistoryPlugin.ts') &&
      ownerWindow.includes('withPlateHistory')) ||
    (relativePath.endsWith('/InputRulesPlugin.ts') &&
      ownerWindow.includes('insertBreak') &&
      ownerWindow.includes('insertText')) ||
    (relativePath.endsWith('/LengthPlugin.ts') &&
      ownerWindow.includes('maxLength')) ||
    (relativePath.endsWith('/NodeIdPlugin.ts') &&
      ownerWindow.includes('withNodeId')) ||
    (relativePath.endsWith('/OverridePlugin.ts') &&
      ownerWindow.includes('withOverrides')) ||
    (relativePath.endsWith('/ParserPlugin.ts') &&
      ownerWindow.includes('insertData')) ||
    (relativePath.endsWith('/ReactPlugin.ts') &&
      ownerWindow.includes('withPlateReact')) ||
    (relativePath.endsWith('/SlateReactExtensionPlugin.ts') &&
      ownerWindow.includes('normalizeNode')) ||
    (relativePath.endsWith('/createPlateRuntimeEditor.ts') &&
      ownerWindow.includes('runtime') &&
      ownerWindow.includes('extendEditor')) ||
    relativePath.endsWith('/BaseBlockquotePlugin.ts') &&
      after.includes('normalizeBlockquoteChildren') &&
      after.includes('isLiftableBlockquoteChild')
  ) || (
    relativePath.endsWith('/BaseCaptionPlugin.ts') &&
    after.includes('withCaption')
  ) || (
    relativePath.endsWith('/BaseColumnPlugin.ts') &&
    ownerWindow.includes('BaseColumnItemPlugin') &&
    ownerWindow.includes('withColumn')
  ) || (
    relativePath.endsWith('/BaseIndentPlugin.ts') &&
    ownerWindow.includes('BaseIndentPlugin') &&
    ownerWindow.includes('withIndent')
  ) || (
    relativePath.endsWith('/BaseCodeBlockPlugin.ts') &&
    ownerWindow.includes('withCodeBlock')
  ) || (
    relativePath.endsWith('/BaseListPlugin.tsx') &&
    ownerWindow.includes('withList')
  ) || (
    relativePath.endsWith('/BaseTodoListPlugin.ts') &&
    after.includes('insertBreak()') &&
    after.includes('insertTodoListItem')
  ) || (
    relativePath.endsWith('/BaseSlashPlugin.ts') &&
    after.includes('withTriggerCombobox')
  ) || (
    relativePath.endsWith('/BaseEmojiPlugin.ts') &&
    after.includes('withTriggerCombobox')
  ) || (
    relativePath.endsWith('/BaseMentionPlugin.ts') &&
    after.includes('withMentionTriggerCombobox')
  ) || (
    relativePath.endsWith('/TagPlugin.tsx') &&
    ownerWindow.includes('MultiSelectPlugin') &&
    ownerWindow.includes('BaseTagPlugin.overrideEditor')
  ) || (
    relativePath.endsWith('/TogglePlugin.tsx') &&
    ownerWindow.includes('TogglePlugin') &&
    ownerWindow.includes('withToggle')
  ) || (
    relativePath.endsWith('/BaseLinkPlugin.ts') &&
    ownerWindow.includes('withLink')
  ) || (
    relativePath.endsWith('/BaseCommentPlugin.ts') &&
    ownerWindow.includes('withComment')
  ) || (
    relativePath.endsWith('/BaseFootnoteReferencePlugin.ts') &&
    ownerWindow.includes('withTriggerCombobox')
  ) || (
    relativePath.endsWith('/SingleBlockPlugin.ts') &&
    ownerWindow.includes('SingleBlockPlugin')
  ) || (
    relativePath.endsWith('/SingleLinePlugin.ts') &&
    ownerWindow.includes('SingleLinePlugin')
  ) || (
    relativePath.endsWith('/NormalizeTypesPlugin.ts') &&
    ownerWindow.includes('NormalizeTypesPlugin')
  ) || (
    relativePath.endsWith('/TrailingBlockPlugin.ts') &&
    ownerWindow.includes('TrailingBlockPlugin')
  );
}

function classifyKind(kind, text, index, relativePath) {
  if (isSpecFixture(relativePath)) return 'test-fixture-decision';
  if (isStaticDomApiCapability(text, index, relativePath)) {
    return 'static-dom-api-capability';
  }
  if (isStaticDomTransformFacade(text, index, relativePath)) {
    return 'static-dom-transform-facade';
  }
  if (isDeferredRuntimeOwnerDecision(text, index, relativePath)) {
    return 'deferred-runtime-owner';
  }

  if (kind === 'extend-api') {
    if (isRuntimeBackedApiCapabilityDecision(text, index, relativePath)) {
      return 'runtime-backed-api-capability';
    }

    return isMixedApiRuntimeDecision(text, index, relativePath)
      ? 'mixed-api-runtime-decision'
      : 'candidate-api-capability';
  }
  if (kind === 'extend-editor-api') {
    if (isExportSideEffectApiCapability(text, index, relativePath)) {
      return 'export-side-effect-api-capability';
    }

    if (isPlatePluginStateApiCapability(text, index, relativePath)) {
      return 'plate-plugin-state-api-capability';
    }

    if (isRuntimeBackedApiCapabilityDecision(text, index, relativePath)) {
      return 'runtime-backed-api-capability';
    }

    return 'global-api-decision';
  }
  if (kind === 'extend-transforms') {
    if (isRuntimeBackedTransformFacadeDecision(text, index, relativePath)) {
      return 'runtime-backed-transform-facade';
    }

    if (isCoreCommandFacadeDecision(text, index, relativePath)) {
      return 'core-command-facade-decision';
    }

    if (isLegacyBatchTransformDecision(text, index)) {
      return 'legacy-batch-transform-decision';
    }

    if (isMixedTransformFacadeDecision(text, index, relativePath)) {
      return 'mixed-transform-facade-decision';
    }

    return isTxBackedTransformFacade(text, index)
      ? 'tx-backed-transform-facade'
      : 'candidate-tx-group';
  }
  if (kind === 'extend-editor-transforms') {
    if (isExportSideEffectTransformFacade(text, index, relativePath)) {
      return 'export-side-effect-transform-facade';
    }

    if (isRuntimeBackedTransformFacadeDecision(text, index, relativePath)) {
      return 'runtime-backed-transform-facade';
    }

    if (isMixedTransformFacadeDecision(text, index, relativePath)) {
      return 'mixed-transform-facade-decision';
    }

    return isTxBackedTransformFacade(text, index)
      ? 'tx-backed-transform-facade'
      : 'global-transform-decision';
  }
  if (kind === 'override-editor' || kind === 'extend-editor') {
    if (isRuntimeBackedEditorDecision(text, index, relativePath)) {
      return 'runtime-backed-editor-decision';
    }

    return 'editor-runtime-decision';
  }

  return 'unknown';
}

function extractContext(lines, lineNumber) {
  const start = Math.max(0, lineNumber - 2);
  const end = Math.min(lines.length, lineNumber + 2);

  return lines
    .slice(start, end)
    .map((line) => line.trim())
    .join(' ')
    .replace(/\s+/g, ' ');
}

const rows = [];
const ownerStats = new Map();

for (const root of roots) {
  for (const filePath of walk(path.join(repoRoot, root))) {
    const relativePath = rel(filePath);
    const owner = ownerFor(relativePath);
    const text = fs.readFileSync(filePath, 'utf8');
    const lines = text.split(/\r?\n/);

    for (const pattern of patterns) {
      pattern.regex.lastIndex = 0;

      let match;
      while ((match = pattern.regex.exec(text))) {
        const lineNumber = getLineNumber(text, match.index);
        const classification = classifyKind(
          pattern.kind,
          text,
          match.index,
          relativePath
        );
        const stat =
          ownerStats.get(owner) ??
          {
            api: 0,
            coreCommandFacade: 0,
            deferredRuntimeOwner: 0,
            editorApi: 0,
            editorRuntime: 0,
            exportSideEffectApi: 0,
            exportSideEffectTransform: 0,
            legacyBatchTransform: 0,
            mixedApiRuntime: 0,
            runtimeBackedApi: 0,
            runtimeBackedTransform: 0,
            staticDomApi: 0,
            staticDomTransform: 0,
            mixedTransformFacade: 0,
            platePluginStateApi: 0,
            runtimeBackedEditor: 0,
            testFixture: 0,
            transformFacade: 0,
            transform: 0,
            transformGlobal: 0,
          };

        if (classification === 'candidate-api-capability') stat.api += 1;
        if (classification === 'runtime-backed-api-capability') {
          stat.runtimeBackedApi += 1;
        }
        if (classification === 'mixed-api-runtime-decision') {
          stat.mixedApiRuntime += 1;
        }
        if (classification === 'plate-plugin-state-api-capability') {
          stat.platePluginStateApi += 1;
        }
        if (classification === 'export-side-effect-api-capability') {
          stat.exportSideEffectApi += 1;
        }
        if (classification === 'export-side-effect-transform-facade') {
          stat.exportSideEffectTransform += 1;
        }
        if (classification === 'static-dom-api-capability') {
          stat.staticDomApi += 1;
        }
        if (classification === 'static-dom-transform-facade') {
          stat.staticDomTransform += 1;
        }
        if (classification === 'core-command-facade-decision') {
          stat.coreCommandFacade += 1;
        }
        if (classification === 'deferred-runtime-owner') {
          stat.deferredRuntimeOwner += 1;
        }
        if (classification === 'global-api-decision') stat.editorApi += 1;
        if (classification === 'candidate-tx-group') stat.transform += 1;
        if (classification === 'tx-backed-transform-facade') {
          stat.transformFacade += 1;
        }
        if (classification === 'runtime-backed-transform-facade') {
          stat.runtimeBackedTransform += 1;
        }
        if (classification === 'mixed-transform-facade-decision') {
          stat.mixedTransformFacade += 1;
        }
        if (classification === 'global-transform-decision') {
          stat.transformGlobal += 1;
        }
        if (classification === 'editor-runtime-decision') {
          stat.editorRuntime += 1;
        }
        if (classification === 'runtime-backed-editor-decision') {
          stat.runtimeBackedEditor += 1;
        }
        if (classification === 'legacy-batch-transform-decision') {
          stat.legacyBatchTransform += 1;
        }
        if (classification === 'test-fixture-decision') {
          stat.testFixture += 1;
        }

        ownerStats.set(owner, stat);
        rows.push({
          classification,
          context: extractContext(lines, lineNumber),
          file: relativePath,
          kind: pattern.kind,
          line: lineNumber,
          owner,
        });
      }
    }
  }
}

rows.sort(
  (a, b) =>
    a.owner.localeCompare(b.owner) ||
    a.file.localeCompare(b.file) ||
    a.line - b.line ||
    a.kind.localeCompare(b.kind)
);

const ledger = [
  ['owner', 'file', 'line', 'kind', 'classification', 'context'].join('\t'),
  ...rows.map((row) =>
    [
      row.owner,
      row.file,
      row.line,
      row.kind,
      row.classification,
      row.context,
    ].join('\t')
  ),
].join('\n');

const sortedOwners = [...ownerStats.entries()].sort((a, b) => {
  const totalA = Object.values(a[1]).reduce((sum, value) => sum + value, 0);
  const totalB = Object.values(b[1]).reduce((sum, value) => sum + value, 0);

  return totalB - totalA || a[0].localeCompare(b[0]);
});

const summary = [
  '# Plate command-surface inventory',
  '',
  `Scanned files: ${roots
    .flatMap((root) => walk(path.join(repoRoot, root)))
    .length.toString()}`,
  `Command-surface rows: ${rows.length}`,
  `Owners: ${ownerStats.size}`,
  '',
  '## Owner totals',
  '',
  '| Owner | API | Runtime-backed API | Plate plugin-state API | Export side-effect API | Static DOM API | Mixed API/runtime | Core command facades | Deferred runtime owners | Editor API | Transforms | Tx-backed facades | Runtime-backed transforms | Export side-effect transforms | Static DOM transforms | Mixed transform facades | Legacy batch transforms | Editor transforms | Editor runtime | Runtime-backed editor | Test fixtures | Total |',
  '|-------|-----|--------------------|------------------------|------------------------|----------------|-------------------|----------------------|-------------------------|------------|------------|-------------------|---------------------------|-------------------------------|-----------------------|-------------------------|-------------------------|-------------------|----------------|-----------------------|---------------|-------|',
  ...sortedOwners.map(([owner, stat]) => {
    const total = Object.values(stat).reduce((sum, value) => sum + value, 0);

    return `| ${[
      owner,
      stat.api,
      stat.runtimeBackedApi,
      stat.platePluginStateApi,
      stat.exportSideEffectApi,
      stat.staticDomApi,
      stat.mixedApiRuntime,
      stat.coreCommandFacade,
      stat.deferredRuntimeOwner,
      stat.editorApi,
      stat.transform,
      stat.transformFacade,
      stat.runtimeBackedTransform,
      stat.exportSideEffectTransform,
      stat.staticDomTransform,
      stat.mixedTransformFacade,
      stat.legacyBatchTransform,
      stat.transformGlobal,
      stat.editorRuntime,
      stat.runtimeBackedEditor,
      stat.testFixture,
      total,
    ].join(' | ')} |`;
  }),
  '',
  '## Migration reading',
  '',
  '- `candidate-api-capability`: safe only when plugin-specific and already proven through `createPlateRuntimeEditor` API capability packet.',
  '- `runtime-backed-api-capability`: plugin-specific API capability already has focused v2 runtime/package proof; keep it out of open package-local migration debt.',
  '- `plate-plugin-state-api-capability`: Plate-facing plugin state/helper API with no Slate document mutation owner; prove package type/tests and keep it out of Slate tx/runtime migration debt.',
  '- `export-side-effect-api-capability`: export/download API reads editor value or triggers host/browser side effects; prove package behavior and keep it out of Slate tx debt.',
  '- `static-dom-api-capability`: static editor DOM capability over browser selection or DOM fragments; prove static package behavior and keep it out of Slate runtime migration debt.',
  '- `mixed-api-runtime-decision`: plugin-specific API shares a plugin owner with overrideEditor, editor API, editor transform metadata, or legacy cross-plugin `editor.getApi(...)`; prove or migrate the whole plugin runtime owner instead of blessing the API row alone.',
  '- `core-command-facade-decision`: plugin shortcut facade over a core editor transform; route to the core runtime transform owner instead of fake tx wrapping.',
  '- `deferred-runtime-owner`: package behavior is current-runtime green, but the v2 runtime route is broad enough to need its own owner packet; do not count it as raw tx debt or claim v2 runtime parity.',
  '- `tx-backed-transform-facade`: accepted Plate beta command facade when it only calls `editor.update((tx) => tx[plugin.key].*)`, `editor.update((tx) => tx.namespace.*)`, or typed `editor.update<PluginTx<...>>()` over an explicit `extendTx` group.',
  '- `runtime-backed-transform-facade`: command facade has focused v2 runtime/package proof even though it owns focus, navigation, option state, or multi-operation behavior that is not a plain tx group.',
  '- `export-side-effect-transform-facade`: transform facade composes export/download APIs and owns host/browser side effects, not Slate document mutations.',
  '- `static-dom-transform-facade`: static editor DOM/DataTransfer transform; prove static copy behavior and keep it out of Slate runtime migration debt.',
  '- `mixed-transform-facade-decision`: command facade mixes tx-backed document mutations, algorithmic legacy commands, API/plugin state, focus, history, or async side effects; keep it out of raw simple-tx debt, but inspect remaining state/runtime commands separately.',
  '- `legacy-batch-transform-decision`: command owns legacy batch/history behavior such as `withoutSaving(setNodesBatch(...))`; route to runtime/batch architecture instead of fake tx wrapping.',
  '- `candidate-tx-group`: not safe to auto-wrap when the implementation closes over legacy `editor.tf`; migrate one feature family to Slate v2 `tx` explicitly.',
  '- `global-api-decision`, `global-transform-decision`, and `editor-runtime-decision`: runtime architecture packets, not package-local cleanup.',
  '- `runtime-backed-editor-decision`: current-runtime override metadata is still present, but the v2 Plate runtime route exists with focused proof; do not reroute as raw package-local work.',
  '- `test-fixture-decision`: spec-only plugin fixtures; keep them out of live package migration debt unless the tested public contract itself changes.',
  '',
].join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'command-surface-ledger.tsv'), ledger);
fs.writeFileSync(path.join(outDir, 'command-surface-summary.md'), summary);

console.log(`Command-surface rows: ${rows.length}`);
console.log(`Owners: ${ownerStats.size}`);
console.log(
  `Top owner: ${sortedOwners[0]?.[0] ?? 'none'} (${sortedOwners[0] ? Object.values(sortedOwners[0][1]).reduce((sum, value) => sum + value, 0) : 0})`
);
