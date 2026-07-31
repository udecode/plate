import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parse } from '@babel/parser';

const repo = resolve('../lexical');
const output = new URL('./lexical-source-manifest.json', import.meta.url);

const concepts = {
  'LX-CORE-NODE':
    'Class-based node graph, stable node keys, parent/sibling links, and latest/writable versions',
  'LX-CORE-NODE-CONFIG':
    'Static node configuration, registration, replacement, inheritance, and DOM/JSON codecs',
  'LX-CORE-STATE':
    'Immutable EditorState snapshots and mutable pending double buffer',
  'LX-CORE-UPDATE':
    'Synchronous ambient read/update context, nested update queue, commit, rollback, and tags',
  'LX-CORE-DIRTY':
    'Dirty leaf/element tracking, transform fixed point, and normalization',
  'LX-CORE-RECONCILE':
    'Incremental imperative DOM reconciliation and mutation accounting',
  'LX-CORE-SELECTION':
    'Point, range, node selection, editing transforms, and DOM selection mapping',
  'LX-CORE-CARET': 'Typed directional tree caret and range traversal',
  'LX-CORE-COMMAND':
    'Typed command tokens, listener priority, propagation, and editor dispatch',
  'LX-CORE-EVENT':
    'Contenteditable event transport, browser branching, composition, clipboard, and input',
  'LX-CORE-INPUT-STATE':
    'Per-editor input and composition state without module-global event state',
  'LX-CORE-DOM-SLOT':
    'DOM content boundary abstraction for wrapped and decorated node rendering',
  'LX-CORE-NAMED-SLOT':
    'Experimental named node-owned content regions across editing, serialization, clipboard, and collaboration',
  'LX-CORE-GENMAP':
    'Generation-aware copy-on-write map used by node maps and reconciliation',
  'LX-CORE-REFCOUNT':
    'Reference-counted document resource registry and shared selectionchange transport',
  'LX-CORE-READ-MODE': 'Explicit latest and pending editor-state read modes',
  'LX-CORE-WARN': 'Editor warning hook and update-recursion diagnostics',
  'LX-CORE-LISTENER':
    'Editor update, mutation, root, editable, text, and decorator listeners',
  'LX-CORE-NODE-STATE':
    'Descriptor-backed per-node state, lazy parsing, default elision, and copy-on-write',
  'LX-CORE-GC': 'Detached-node and decorator garbage collection',
  'LX-CORE-NODES':
    'Built-in root, element, text, paragraph, decorator, line-break, tab, and artificial nodes',
  'LX-CORE-UTIL': 'Core structural utilities and cleanup composition',
  'LX-EXTENSION-CONTRACT':
    'Typed extension descriptors, config, dependencies, peers, conflicts, and lifecycle',
  'LX-EXTENSION-COMPILER':
    'Extension graph compilation, topological order, config merge, build/register, and disposal',
  'LX-EXTENSION-SIGNALS':
    'Reactive extension signals, watched signal lifecycle, and dependency outputs',
  'LX-CLIPBOARD':
    'Clipboard MIME import/export, selection serialization, and insertion',
  'LX-CODE':
    'Code block nodes, flat line structure, tab/indent behavior, and syntax engines',
  'LX-DEVTOOLS':
    'Editor inspection, state serialization, command log, element picker, and browser extension',
  'LX-DRAGON': 'Dragon NaturallySpeaking DOM compatibility',
  'LX-FILE': 'Serialized editor file import/export',
  'LX-HASHTAG': 'Hashtag text entity and extension',
  'LX-HEADLESS': 'Headless editor creation and DOM environment adapters',
  'LX-HISTORY': 'Undo/redo stacks, merge heuristics, tags, and shared history',
  'LX-HTML': 'HTML generation and fitted DOM import',
  'LX-DOM-IMPORT':
    'Extension-contributed DOM import declarations and compiled matchers',
  'LX-DOM-RENDER':
    'Extension-contributed DOM create, update, export, slot, and decorator overrides',
  'LX-MDAST':
    'Extension-contributed MDAST import/export with syntax-extension preservation',
  'LX-A11Y':
    'Accessibility live regions, focus trapping, focus restoration, and roving tabindex helpers',
  'LX-INTERNAL':
    'Private cross-package implementation utilities with no supported public contract',
  'LX-LINK': 'Link/autolink nodes, commands, transforms, and extensions',
  'LX-LIST':
    'List/list-item representation, formatting, checklist, indentation, and normalization',
  'LX-MARK': 'Wrapper mark node and range wrapping helpers',
  'LX-MARKDOWN': 'Markdown transformers, import, export, and shortcuts',
  'LX-OFFSET': 'Flat text-offset view and selection conversion',
  'LX-OVERFLOW': 'Overflow node and character-limit wrapping',
  'LX-PLAIN-TEXT': 'Plain-text commands and extension',
  'LX-REACT':
    'React composers, contexts, plugins, hooks, decorators, and contenteditable host',
  'LX-RICH-TEXT':
    'Rich-text commands, editing rules, headings, quotes, and extension',
  'LX-SELECTION-UTIL':
    'Selection geometry, style, slicing, cloning, and traversal helpers',
  'LX-TABLE':
    'Table nodes, grid selection, observer, navigation, commands, and normalization',
  'LX-TAILWIND': 'Tailwind theme extension',
  'LX-TEXT':
    'Text entity registration, root text subscription, and placeholder policy',
  'LX-UTILS':
    'Reusable registration, DOM, traversal, merge, and selection utilities',
  'LX-YJS':
    'Yjs node bindings, relative positions, cursors, snapshots, and bidirectional sync',
  'LX-CONSUMER': 'Example application and integration consumer',
  'LX-PLAYGROUND':
    'Playground product nodes, plugins, UI, collaboration, and browser host',
  'LX-WEBSITE':
    'Documentation site, public concept documentation, and product examples',
  'LX-PROOF':
    'Unit, integration, browser, regression, fixture, and harness evidence',
  'LX-PACKAGING':
    'Package metadata, exports, dependency graph, build variants, and workspace boundaries',
};

const packageConcept = {
  lexical: 'LX-CORE-UTIL',
  'lexical-a11y': 'LX-A11Y',
  'lexical-clipboard': 'LX-CLIPBOARD',
  'lexical-code': 'LX-CODE',
  'lexical-code-core': 'LX-CODE',
  'lexical-code-prism': 'LX-CODE',
  'lexical-code-shiki': 'LX-CODE',
  'lexical-devtools': 'LX-DEVTOOLS',
  'lexical-devtools-core': 'LX-DEVTOOLS',
  'lexical-dragon': 'LX-DRAGON',
  'lexical-extension': 'LX-EXTENSION-COMPILER',
  'lexical-file': 'LX-FILE',
  'lexical-hashtag': 'LX-HASHTAG',
  'lexical-headless': 'LX-HEADLESS',
  'lexical-history': 'LX-HISTORY',
  'lexical-html': 'LX-HTML',
  'lexical-internal': 'LX-INTERNAL',
  'lexical-link': 'LX-LINK',
  'lexical-list': 'LX-LIST',
  'lexical-mark': 'LX-MARK',
  'lexical-markdown': 'LX-MARKDOWN',
  'lexical-mdast': 'LX-MDAST',
  'lexical-offset': 'LX-OFFSET',
  'lexical-overflow': 'LX-OVERFLOW',
  'lexical-plain-text': 'LX-PLAIN-TEXT',
  'lexical-playground': 'LX-PLAYGROUND',
  'lexical-react': 'LX-REACT',
  'lexical-rich-text': 'LX-RICH-TEXT',
  'lexical-selection': 'LX-SELECTION-UTIL',
  'lexical-table': 'LX-TABLE',
  'lexical-tailwind': 'LX-TAILWIND',
  'lexical-text': 'LX-TEXT',
  'lexical-utils': 'LX-UTILS',
  'lexical-website': 'LX-WEBSITE',
  'lexical-yjs': 'LX-YJS',
};

const coreFileConcepts = {
  'LexicalCommands.ts': ['LX-CORE-COMMAND'],
  'LexicalEditor.ts': [
    'LX-CORE-STATE',
    'LX-CORE-UPDATE',
    'LX-CORE-COMMAND',
    'LX-CORE-LISTENER',
    'LX-CORE-DIRTY',
    'LX-CORE-NODE-CONFIG',
    'LX-CORE-READ-MODE',
    'LX-CORE-WARN',
  ],
  'LexicalEditorState.ts': ['LX-CORE-STATE', 'LX-CORE-UPDATE'],
  'LexicalDOMSlot.ts': ['LX-CORE-DOM-SLOT', 'LX-CORE-RECONCILE'],
  'LexicalEvents.ts': [
    'LX-CORE-EVENT',
    'LX-CORE-SELECTION',
    'LX-CLIPBOARD',
    'LX-CORE-INPUT-STATE',
    'LX-CORE-REFCOUNT',
  ],
  'LexicalGenMap.ts': ['LX-CORE-GENMAP', 'LX-CORE-STATE'],
  'LexicalGC.ts': ['LX-CORE-GC'],
  'LexicalMutations.ts': ['LX-CORE-LISTENER', 'LX-CORE-RECONCILE'],
  'LexicalNode.ts': ['LX-CORE-NODE', 'LX-CORE-NODE-CONFIG'],
  'LexicalNodeState.ts': ['LX-CORE-NODE-STATE', 'LX-CORE-NODE-CONFIG'],
  'LexicalNormalization.ts': ['LX-CORE-DIRTY', 'LX-CORE-SELECTION'],
  'LexicalReconciler.ts': ['LX-CORE-RECONCILE', 'LX-CORE-DIRTY'],
  'LexicalRefCountedRegistry.ts': ['LX-CORE-REFCOUNT'],
  'LexicalSelection.ts': ['LX-CORE-SELECTION', 'LX-CORE-EVENT'],
  'LexicalSlot.ts': ['LX-CORE-NAMED-SLOT', 'LX-CORE-NODE', 'LX-CORE-SELECTION'],
  'LexicalUpdateTags.ts': ['LX-CORE-UPDATE'],
  'LexicalUpdates.ts': [
    'LX-CORE-UPDATE',
    'LX-CORE-DIRTY',
    'LX-CORE-RECONCILE',
    'LX-CORE-COMMAND',
    'LX-CORE-LISTENER',
    'LX-CORE-READ-MODE',
    'LX-CORE-WARN',
  ],
  'LexicalUtils.ts': ['LX-CORE-UTIL', 'LX-CORE-NODE'],
};

function packageName(path) {
  const match = /^packages\/([^/]+)/.exec(path);
  return match?.[1] ?? null;
}

function isTest(path) {
  return /(^|\/)(__tests__|test|tests|spec|e2e|integration|playwright|cypress|wdio|fixtures)(\/|$)|\.(test|spec)\.[cm]?[jt]sx?$/.test(
    path
  );
}

function isCode(path) {
  return /\.(?:[cm]?[jt]sx?|mts|cts)$/.test(path);
}

function classify(path) {
  const conceptsForFile = new Set();
  const pkg = packageName(path);
  let kind = 'excluded';
  let exclusion = null;

  if (path === 'LICENSE') {
    kind = 'provenance';
    exclusion = 'License evidence; no editor mechanism.';
  } else if (
    path.startsWith('packages/lexical-eslint-plugin/') ||
    path.startsWith('packages/lexical-eslint-plugin-internal/')
  ) {
    kind = 'excluded';
    exclusion =
      'Lexical-specific lint tooling; no editor runtime, public model, or host ownership.';
  } else if (
    path.endsWith('/package.json') ||
    path === 'package.json' ||
    path === 'pnpm-workspace.yaml'
  ) {
    kind = 'packaging';
    conceptsForFile.add('LX-PACKAGING');
    if (pkg && packageConcept[pkg]) conceptsForFile.add(packageConcept[pkg]);
  } else if (path.startsWith('packages/') && path.includes('/src/')) {
    kind = isTest(path) ? 'proof' : 'runtime-source';
    if (pkg && packageConcept[pkg]) conceptsForFile.add(packageConcept[pkg]);
    if (isTest(path)) conceptsForFile.add('LX-PROOF');
    if (pkg === 'lexical') {
      const relative = path.slice('packages/lexical/src/'.length);
      const base = relative.split('/').at(-1);
      for (const id of coreFileConcepts[base] ?? []) conceptsForFile.add(id);
      if (relative.startsWith('caret/')) conceptsForFile.add('LX-CORE-CARET');
      if (relative.startsWith('extension-core/'))
        conceptsForFile.add('LX-EXTENSION-CONTRACT');
      if (relative.startsWith('nodes/')) conceptsForFile.add('LX-CORE-NODES');
      if (relative === 'index.ts') {
        conceptsForFile.add('LX-PACKAGING');
        conceptsForFile.add('LX-CORE-NODE');
        conceptsForFile.add('LX-CORE-SELECTION');
      }
    }
    if (pkg === 'lexical-extension' && /signals|Signal/.test(path)) {
      conceptsForFile.add('LX-EXTENSION-SIGNALS');
    }
    if (pkg === 'lexical-html') {
      if (/DOMImport|import/i.test(path)) conceptsForFile.add('LX-DOM-IMPORT');
      if (/DOMRender|render/i.test(path)) conceptsForFile.add('LX-DOM-RENDER');
    }
    if (pkg === 'lexical-yjs' && /slot/i.test(path)) {
      conceptsForFile.add('LX-CORE-NAMED-SLOT');
    }
  } else if (path.startsWith('packages/lexical-playground/')) {
    kind = isTest(path) ? 'proof' : 'consumer';
    conceptsForFile.add('LX-PLAYGROUND');
    conceptsForFile.add(isTest(path) ? 'LX-PROOF' : 'LX-CONSUMER');
  } else if (path.startsWith('packages/lexical-website/')) {
    kind = isTest(path) ? 'proof' : 'docs';
    conceptsForFile.add('LX-WEBSITE');
    if (isTest(path)) conceptsForFile.add('LX-PROOF');
  } else if (path.startsWith('examples/') || path.startsWith('dev-examples/')) {
    kind = isTest(path) ? 'proof' : 'consumer';
    conceptsForFile.add('LX-CONSUMER');
    if (isTest(path)) conceptsForFile.add('LX-PROOF');
  } else if (path.startsWith('packages/') && isTest(path)) {
    kind = 'proof';
    conceptsForFile.add('LX-PROOF');
    if (pkg && packageConcept[pkg]) conceptsForFile.add(packageConcept[pkg]);
  } else if (
    path.endsWith('.md') &&
    (path === 'README.md' || path.startsWith('packages/'))
  ) {
    kind = 'docs';
    conceptsForFile.add(
      pkg && packageConcept[pkg] ? packageConcept[pkg] : 'LX-PACKAGING'
    );
  } else if (
    path.startsWith('.github/') ||
    path.startsWith('.husky/') ||
    path.startsWith('.vscode/') ||
    path.startsWith('scripts/') ||
    path.startsWith('flow-typed/') ||
    path.startsWith('libdefs/') ||
    /\.(?:lock|css|scss|png|jpe?g|gif|svg|ico|woff2?|ttf|map)$/.test(path) ||
    /^(\.|babel|playwright|tsconfig|vitest|pnpm|yarn)/.test(path)
  ) {
    kind = 'excluded';
    exclusion =
      'Build, release, generated typing, repository policy, styling, or binary asset; no editor architecture ownership.';
  } else if (path.startsWith('packages/')) {
    kind = 'packaging';
    conceptsForFile.add('LX-PACKAGING');
    if (pkg && packageConcept[pkg]) conceptsForFile.add(packageConcept[pkg]);
  } else {
    kind = 'excluded';
    exclusion =
      'Repository metadata or documentation outside editor mechanism ownership.';
  }

  if (conceptsForFile.size === 0 && !exclusion) {
    throw new Error(`Unmapped file: ${path}`);
  }
  return { concepts: [...conceptsForFile].sort(), exclusion, kind };
}

function patternName(node) {
  if (!node) return '<anonymous>';
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'ObjectPattern')
    return `{${node.properties.length} bindings}`;
  if (node.type === 'ArrayPattern') return `[${node.elements.length} bindings]`;
  return '<pattern>';
}

function normalizeDeclaration(node, exported = false) {
  if (!node) return [];
  const line = node.loc?.start.line ?? 1;
  switch (node.type) {
    case 'ClassDeclaration':
      return [{ exported, kind: 'class', line, name: patternName(node.id) }];
    case 'FunctionDeclaration':
      return [{ exported, kind: 'function', line, name: patternName(node.id) }];
    case 'TSInterfaceDeclaration':
      return [
        { exported, kind: 'interface', line, name: patternName(node.id) },
      ];
    case 'TSTypeAliasDeclaration':
    case 'TypeAlias':
      return [{ exported, kind: 'type', line, name: patternName(node.id) }];
    case 'TSEnumDeclaration':
    case 'EnumDeclaration':
      return [{ exported, kind: 'enum', line, name: patternName(node.id) }];
    case 'TSModuleDeclaration':
    case 'DeclareModule':
      return [{ exported, kind: 'module', line, name: patternName(node.id) }];
    case 'VariableDeclaration':
      return node.declarations.map((decl) => ({
        exported,
        kind: 'variable',
        line: decl.loc?.start.line ?? line,
        name: patternName(decl.id),
      }));
    case 'ExportNamedDeclaration': {
      if (node.declaration) return normalizeDeclaration(node.declaration, true);
      const names = node.specifiers.map((specifier) =>
        patternName(specifier.exported ?? specifier.local)
      );
      return [
        {
          exported: true,
          kind: 'export',
          line,
          name: `export ${names.length ? names.join(', ') : '*'}${
            node.source ? ` from ${node.source.value}` : ''
          }`,
        },
      ];
    }
    case 'ExportDefaultDeclaration': {
      const nested = normalizeDeclaration(node.declaration, true);
      return nested.length
        ? nested
        : [
            {
              exported: true,
              kind: 'export-assignment',
              line,
              name: 'export default',
            },
          ];
    }
    case 'ExportAllDeclaration':
      return [
        {
          exported: true,
          kind: 'export',
          line,
          name: `export * from ${node.source.value}`,
        },
      ];
    default:
      return [];
  }
}

function extractDeclarations(path) {
  if (!isCode(path)) return { declarations: [], parseDiagnostics: 0 };
  const text = readFileSync(resolve(repo, path), 'utf8');
  const isTypeScript = /\.(?:tsx?|mts|cts)$/.test(path);
  try {
    const ast = parse(text, {
      sourceType: 'unambiguous',
      errorRecovery: true,
      plugins: [
        isTypeScript ? 'typescript' : 'flow',
        'jsx',
        'decorators-legacy',
        'explicitResourceManagement',
      ],
    });
    return {
      declarations: ast.program.body.flatMap((node) =>
        normalizeDeclaration(node)
      ),
      parseDiagnostics: ast.errors.length,
    };
  } catch {
    // A parse failure remains explicit in the manifest; the source unit still
    // maps to its owning concepts and can be read directly.
    return { declarations: [], parseDiagnostics: 1 };
  }
}

function packageMetadata(path) {
  if (!path.endsWith('package.json')) return [];
  const json = JSON.parse(readFileSync(resolve(repo, path), 'utf8'));
  const rows = [];
  if (json.name)
    rows.push({ exported: true, kind: 'package', line: 1, name: json.name });
  for (const key of Object.keys(json.exports ?? {})) {
    rows.push({ exported: true, kind: 'package-export', line: 1, name: key });
  }
  for (const key of Object.keys({
    ...(json.dependencies ?? {}),
    ...(json.peerDependencies ?? {}),
  })) {
    rows.push({
      exported: false,
      kind: 'package-dependency',
      line: 1,
      name: key,
    });
  }
  return rows;
}

const tracked = execFileSync('git', ['-C', repo, 'ls-files'], {
  encoding: 'utf8',
})
  .trim()
  .split('\n')
  .filter(Boolean)
  .sort();
const units = tracked.map((path) => {
  const classification = classify(path);
  const parsed = extractDeclarations(path);
  const declarations = [...packageMetadata(path), ...parsed.declarations];
  return {
    path,
    ...classification,
    declarations,
    declarationCount: declarations.length,
    parseDiagnostics: parsed.parseDiagnostics,
  };
});

const summary = {
  trackedUnits: units.length,
  relevantUnits: units.filter((unit) => unit.exclusion === null).length,
  excludedUnits: units.filter((unit) => unit.exclusion !== null).length,
  codeUnits: units.filter((unit) => isCode(unit.path)).length,
  declarations: units.reduce((sum, unit) => sum + unit.declarationCount, 0),
  mappedDeclarations: units
    .filter((unit) => unit.concepts.length > 0)
    .reduce((sum, unit) => sum + unit.declarationCount, 0),
  excludedDeclarations: units
    .filter((unit) => unit.exclusion !== null)
    .reduce((sum, unit) => sum + unit.declarationCount, 0),
  unexplainedUnits: units.filter(
    (unit) => unit.concepts.length === 0 && unit.exclusion === null
  ).length,
  unexplainedDeclarations: units
    .filter((unit) => unit.concepts.length === 0 && unit.exclusion === null)
    .reduce((sum, unit) => sum + unit.declarationCount, 0),
  parseDiagnostics: units.reduce((sum, unit) => sum + unit.parseDiagnostics, 0),
  relevantParseDiagnostics: units
    .filter((unit) => unit.exclusion === null)
    .reduce((sum, unit) => sum + unit.parseDiagnostics, 0),
  excludedParseDiagnostics: units
    .filter((unit) => unit.exclusion !== null)
    .reduce((sum, unit) => sum + unit.parseDiagnostics, 0),
  exportedDeclarations: units
    .flatMap((unit) => unit.declarations)
    .filter((declaration) => declaration.exported).length,
  runtimeDeclarations: units
    .filter((unit) => unit.kind === 'runtime-source')
    .reduce((sum, unit) => sum + unit.declarationCount, 0),
  proofDeclarations: units
    .filter((unit) => unit.kind === 'proof')
    .reduce((sum, unit) => sum + unit.declarationCount, 0),
  packageRecords: units
    .flatMap((unit) => unit.declarations)
    .filter((declaration) => declaration.kind === 'package').length,
  packageExportRecords: units
    .flatMap((unit) => unit.declarations)
    .filter((declaration) => declaration.kind === 'package-export').length,
  packageDirectories: new Set(
    units
      .filter((unit) => unit.path.startsWith('packages/'))
      .map((unit) => unit.path.split('/')[1])
  ).size,
  byKind: Object.fromEntries(
    [...new Set(units.map((unit) => unit.kind))]
      .sort()
      .map((kind) => [kind, units.filter((unit) => unit.kind === kind).length])
  ),
  byConcept: Object.fromEntries(
    Object.keys(concepts)
      .sort()
      .map((id) => [
        id,
        units.filter((unit) => unit.concepts.includes(id)).length,
      ])
  ),
};

writeFileSync(
  output,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      repository: {
        path: '../lexical',
        commit: execFileSync('git', ['-C', repo, 'rev-parse', 'HEAD'], {
          encoding: 'utf8',
        }).trim(),
      },
      concepts,
      summary,
      units,
    },
    null,
    2
  )}\n`
);

console.log(JSON.stringify(summary, null, 2));
