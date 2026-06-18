import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, it } from 'node:test';

import * as ts from 'typescript';

import * as Slate from '../src';

const repoRoot = resolve(import.meta.dir, '../../..');

const packageDirectoryName = (packageName: string) =>
  packageName === '@platejs/yjs' ? 'slate-yjs' : packageName;

const collectFiles = (directory: string, pattern: RegExp): string[] =>
  readdirSync(directory)
    .flatMap((entry) => {
      const path = join(directory, entry);

      if (statSync(path).isDirectory()) {
        if (
          entry === 'node_modules' ||
          entry === 'dist' ||
          entry === 'out' ||
          entry === '.next'
        ) {
          return [];
        }

        return collectFiles(path, pattern);
      }

      return pattern.test(path)
        ? [relative(repoRoot, path).replaceAll('\\', '/')]
        : [];
    })
    .sort();

const collectExampleFiles = (directory: string): string[] =>
  collectFiles(directory, /\.(ts|tsx|js|jsx)$/);

const collectMarkdownFiles = (directory: string): string[] =>
  collectFiles(directory, /\.md$/);

const primaryExampleFiles = collectExampleFiles(
  resolve(repoRoot, 'site/examples')
);
const extensionExampleFiles = primaryExampleFiles;
const primaryExampleRoutes = [
  ...readFileSync(
    resolve(repoRoot, 'site/constants/examples.ts'),
    'utf8'
  ).matchAll(/\['[^']+', '([^']+)'/g),
]
  .map((match) => match[1])
  .sort();
const browserExampleSpecRoutes = collectFiles(
  resolve(repoRoot, 'playwright/integration/examples'),
  /\.test\.ts$/
).map((relativePath) =>
  relativePath
    .replace(/^playwright\/integration\/examples\//, '')
    .replace(/\.test\.ts$/, '')
);
const exampleBrowserProofAliases = new Map([
  [
    'android-tests',
    [
      'query-controls',
      'hidden Android manual-test route is covered by URL-control load proof',
    ],
  ],
  [
    'custom-placeholder',
    [
      'placeholder',
      'custom-placeholder route has a shorter placeholder spec name',
    ],
  ],
] as const);
const exampleBrowserUtilitySpecs = new Map([
  [
    'example-navigation',
    'global examples navigation metadata proof, not one editor route',
  ],
  [
    'visual-native-selection-smoke',
    'cross-route screenshot/native-selection smoke proof',
  ],
] as const);
const publicDocumentationFiles = [
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/api')),
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/concepts')),
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/libraries')),
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/walkthroughs')),
  ...collectFiles(resolve(repoRoot, 'packages'), /(?:README|Readme)\.md$/),
];
const publicMarkdownFiles = [
  'Readme.md',
  ...publicDocumentationFiles,
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/general')),
].sort();
const structuralPublicMarkdownFiles = [
  ...publicMarkdownFiles,
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/migration')),
  ...collectMarkdownFiles(resolve(repoRoot, 'docs/releases')),
].sort();
const publicAuthoringFiles = [
  ...collectExampleFiles(resolve(repoRoot, 'site/examples')),
  ...collectExampleFiles(resolve(repoRoot, 'docs/api')),
  ...collectExampleFiles(resolve(repoRoot, 'docs/concepts')),
  ...collectExampleFiles(resolve(repoRoot, 'docs/walkthroughs')),
];

const publicPredicateInputFiles = [
  'docs/api/locations/location.md',
  'docs/api/locations/path.md',
  'docs/api/locations/point.md',
  'docs/api/locations/range.md',
  'docs/api/locations/span.md',
  'docs/api/nodes/element.md',
  'docs/api/nodes/node.md',
  'docs/api/nodes/text.md',
  'docs/api/operations/operation.md',
  'docs/libraries/slate-history/history.md',
  'packages/slate-dom/src/utils/dom.ts',
  'packages/slate-history/src/history.ts',
  'packages/slate/src/editor/is-editor.ts',
  'packages/slate/src/interfaces/element.ts',
  'packages/slate/src/interfaces/location.ts',
  'packages/slate/src/interfaces/node.ts',
  'packages/slate/src/interfaces/operation.ts',
  'packages/slate/src/interfaces/path.ts',
  'packages/slate/src/interfaces/point.ts',
  'packages/slate/src/interfaces/range.ts',
  'packages/slate/src/interfaces/text.ts',
];

const primitiveWriteTeachingPattern =
  /\beditor\.(collapse|delete|deselect|insertFragment|insertNodes|insertText|mergeNodes|move|moveNodes|removeNodes|select|setNodes|splitNodes|unsetNodes|unwrapNodes|wrapNodes)\s*\(/g;

const classifiedPrimitiveWriteFiles = new Map([
  [
    'docs/concepts/11-normalizing.md',
    'normalizer examples run inside normalization policy, not normal authoring command handlers',
  ],
  [
    'docs/walkthroughs/07-operation-replay-substrate.md',
    'operation replay setup uses normalizer bootstrap code, not normal authoring command handlers',
  ],
  [
    'site/examples/ts/forced-layout.tsx',
    'forced-layout is a normalizer example and uses primitive writes as advanced normalization policy',
  ],
]);

const bannedPublicSurface = [
  {
    pattern: /\bTransforms\./,
    reason:
      'primary examples must use editor methods inside the update runtime',
  },
  {
    pattern: /\beditor\.(selection|children|marks|operations)\b/,
    reason:
      'primary examples must use live read methods, not stale mutable fields',
  },
  {
    pattern: /\beditor\.(apply|onChange)\s*=/,
    reason: 'primary examples must not teach method override extension points',
  },
  {
    pattern: /\b(operationMiddlewares|commitListeners)\b|\bregister\s*[:(]/,
    reason:
      'public authoring examples must teach operations.apply, onCommit, and setup',
  },
  {
    pattern: /\buseSlateView(State|Effect)\b/,
    reason:
      'public examples must teach root-named runtime hooks, not removed view hook names',
  },
];

const bannedPublicExampleTypeSlop = [
  {
    pattern: /\bReactEditor<any>\b/,
    reason: 'public examples should carry the actual editor value type',
  },
  {
    pattern: /:\s*any\b/,
    reason: 'public examples should not teach untyped parameters or returns',
  },
  {
    pattern: /\bany\[\]|\bArray<\s*any\s*>/,
    reason: 'public examples should model collection element types',
  },
  {
    pattern: /\bas any\b/,
    reason: 'public examples should not cast away type information',
  },
  {
    pattern: /\bas never\b/,
    reason: 'public examples should not use impossible casts to appease types',
  },
  {
    pattern: /@ts-expect-error/,
    reason: 'public examples should model missing platform types explicitly',
  },
  {
    pattern: /@ts-ignore/,
    reason: 'public examples should not hide type errors',
  },
  {
    pattern: /eslint-disable|biome-ignore/,
    reason: 'public examples should not ship local suppression comments',
  },
];

const bannedPublicDocumentationSurface = [
  {
    pattern: /A root-level `Editor` node/,
    reason:
      'node docs must teach roots/state persistence, not legacy editor-child storage',
  },
  {
    pattern: /The top-level node in a Slate document is the `Editor` itself/,
    reason:
      'node docs must separate the runtime editor from persisted document roots',
  },
  {
    pattern: /\beditor\.children\b/,
    reason:
      'public docs must read document content through roots and state.value.get()',
  },
  {
    pattern: /editor has other properties too/,
    reason: 'public docs must not teach placeholder legacy editor shapes',
  },
  {
    pattern: /We'll cover its functionality later/,
    reason:
      'public docs must be direct current-state reference, not old tutorial prose',
  },
  {
    pattern: /\bon(EditorCommit|KeyCommand)\b/,
    reason:
      'normal React docs must teach current Slate callbacks, not removed callback names',
  },
  {
    pattern: /\buseSlateStatic\b/,
    reason: 'normal React docs must teach useEditor and selector hooks',
  },
  {
    pattern: /\buseComposing\b/,
    reason: 'normal React docs must teach useEditorComposing',
  },
  {
    pattern: /\buseReadOnly\b/,
    reason: 'normal React docs must teach useEditorReadOnly',
  },
  {
    pattern: /\buseSlateSelection\b/,
    reason: 'normal React docs must teach useEditorSelection',
  },
  {
    pattern: /\buseSlateSelector\b/,
    reason: 'normal React docs must teach useEditorSelector',
  },
  {
    pattern: /\buseElementIf\b/,
    reason: 'normal React docs must teach useElement or scoped hooks',
  },
  {
    pattern: /\buseSelected\b/,
    reason: 'normal React docs must teach target-scoped selection hooks',
  },
  {
    pattern: /\buseFocused\b/,
    reason: 'normal React docs must teach editor/node-scoped focus state',
  },
  {
    pattern: /\buseSlateView(State|Effect)\b/,
    reason:
      'normal React docs must teach root-named runtime hooks, not removed view hook names',
  },
  {
    pattern: /contentEditable=\{false\}/,
    reason: 'normal void docs must not make app renderers own the void shell',
  },
  {
    pattern: /^const \[editor\] = useState\(/m,
    reason:
      'public React docs must not show top-level hook calls outside a component',
  },
];

const bannedPublicSnapshotAndRangeSurface = [
  {
    pattern: /\bstate\.value\.snapshot\s*\(/,
    reason:
      'full snapshots belong to state.runtime.snapshot, not normal value reads',
  },
  {
    pattern: /\bEditor\.(bookmark|getSnapshot|pathRef|pointRef|rangeRef)\b/,
    reason:
      'public docs/examples must use editor.read state groups instead of the internal Editor namespace',
  },
  {
    pattern: /resources used by the \w+RefApi|refs current value|unrefed/,
    reason: 'location ref docs must use current public wording',
  },
];

const bannedPublicInternalImportPattern =
  /from\s+['"](?:slate|slate-dom)\/internal['"]/g;

const allowedSlateInternalBridgeImporters = new Map([
  [
    'packages/slate-dom/src/plugin/dom-clipboard-runtime.ts',
    'DOM clipboard integration needs internal apply/runtime hooks for Slate fragment paste and copy repair',
  ],
  [
    'packages/slate-dom/src/plugin/dom-coverage.ts',
    'DOM coverage translates mounted and hidden DOM ranges through internal snapshot/version helpers',
  ],
  [
    'packages/slate-dom/src/plugin/dom-editor.ts',
    'DOM editor bridge needs internal editor helpers to resolve Slate ranges against browser DOM state',
  ],
  [
    'packages/slate-dom/src/plugin/dom-event-range-targets.ts',
    'DOM event range targeting needs internal editor/root helpers and fragment inline classification for void and fragment drop resolution',
  ],
  [
    'packages/slate-dom/src/plugin/dom-node-path.ts',
    'DOM node path resolution needs internal runtime identifiers to map mounted DOM nodes to Slate paths',
  ],
  [
    'packages/slate-dom/src/plugin/with-dom.ts',
    'DOM extension setup needs internal transform registry access and root-scoped operation helpers',
  ],
  [
    'packages/slate-dom/src/utils/diff-text.ts',
    'DOM text diff recovery needs internal root metadata to keep pending selection edits root-local',
  ],
  [
    'packages/slate-dom/src/utils/lines.ts',
    'DOM single-line range helpers need the internal Editor table for line geometry lookup',
  ],
  [
    'packages/slate-dom/src/utils/range-list.ts',
    'DOM decoration range equality needs the internal Editor table for placeholder-aware comparisons',
  ],
  [
    'packages/slate-history/src/history-extension.ts',
    'history extension needs internal runtime/registry helpers to install core history behavior',
  ],
  [
    'packages/slate-history/src/history-merge-policy.ts',
    'history merge policy needs internal operation-root helpers to keep undo batches scoped to the active root',
  ],
  [
    'packages/slate-history/src/history-replay.ts',
    'history replay needs internal operation application and primary-root normalization for historic operations',
  ],
  [
    'packages/slate-history/src/history-selection.ts',
    'history selection snapshots need internal operation and range root helpers to restore root-local selection state',
  ],
  [
    'packages/slate-history/src/history.ts',
    'history package validates batch shapes with the sibling-owned object guard',
  ],
  [
    'packages/slate-hyperscript/src/creators.ts',
    'hyperscript fixture creators need the sibling-owned editor children setter',
  ],
  [
    'packages/slate-hyperscript/src/hyperscript.ts',
    'hyperscript package validates shorthand option objects with the sibling-owned object guard',
  ],
  [
    'packages/slate-react/src/editable/runtime-editor-api.ts',
    'React editable runtime bridge re-exports selected internal helpers for React-owned editor wiring',
  ],
  [
    'packages/yjs/src/core/editor-adapter.ts',
    'Yjs collaboration adapter needs internal operation replay helpers to translate remote Yjs updates into Slate commits',
  ],
]);

const markdownLinkPattern = /\[[^\]]*]\(([^)\s#]*)(#[^)\s]+)?\)/g;
const markdownReferenceLinkPattern = /^\s*\[[^\]\n]+]:\s*(\S+)/gm;
const markdownHeadingPattern = /^(#{1,6})\s+(.+)$/gm;

const stripFencedCodeBlocks = (source: string) =>
  source.replace(/^```[\s\S]*?^```/gm, '').replace(/^~~~[\s\S]*?^~~~/gm, '');

const slugifyMarkdownHeading = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const collectMarkdownAnchors = (relativePath: string): Set<string> => {
  const source = stripFencedCodeBlocks(
    readFileSync(resolve(repoRoot, relativePath), 'utf8')
  );
  const anchors = new Set<string>();
  const counts = new Map<string, number>();

  for (const match of source.matchAll(markdownHeadingPattern)) {
    const base = slugifyMarkdownHeading(match[2] ?? '');
    const count = counts.get(base) ?? 0;

    counts.set(base, count + 1);
    anchors.add(count === 0 ? base : `${base}-${count}`);
  }

  return anchors;
};

const readPackageJson = (packageName: string) =>
  JSON.parse(
    readFileSync(
      resolve(
        repoRoot,
        'packages',
        packageDirectoryName(packageName),
        'package.json'
      ),
      'utf8'
    )
  ) as {
    dependencies?: Record<string, string>;
    exports?: Record<string, unknown>;
    main?: string;
    module?: string;
    name: string;
    peerDependencies?: Record<string, string>;
    private?: boolean;
    scripts?: Record<string, string>;
    types?: string;
    version: string;
  };

const readRootPackageJson = () =>
  JSON.parse(readFileSync(resolve(repoRoot, 'package.json'), 'utf8')) as {
    devDependencies?: Record<string, string>;
  };

const readDtsTsconfig = () =>
  JSON.parse(
    readFileSync(
      resolve(repoRoot, 'config/typescript/tsconfig.dts.json'),
      'utf8'
    )
  ) as {
    compilerOptions?: {
      paths?: Record<string, readonly string[]>;
    };
  };

const expectedPublicPackageExportMaps: Record<string, readonly string[]> = {
  '@platejs/yjs': ['.', './core', './internal', './react'],
  slate: ['.', './internal'],
  '@platejs/browser': ['./browser', './core', './playwright', './transports'],
  '@platejs/slate-dom': ['.', './internal'],
  '@platejs/slate-history': ['.'],
  '@platejs/slate-hyperscript': ['.'],
  '@platejs/slate-layout': ['.', './react'],
  '@platejs/slate-react': ['.'],
};

const expectedPackageReadmeFiles: Record<string, 'README.md' | 'Readme.md'> = {
  slate: 'Readme.md',
  'slate-yjs': 'README.md',
  '@platejs/browser': 'README.md',
  '@platejs/slate-dom': 'README.md',
  '@platejs/slate-history': 'Readme.md',
  '@platejs/slate-hyperscript': 'Readme.md',
  '@platejs/slate-layout': 'README.md',
  '@platejs/slate-react': 'Readme.md',
};

const expectedRootWorkspacePackageDevDependencies = [
  '@platejs/slate',
  '@platejs/yjs',
  '@platejs/browser',
  '@platejs/slate-dom',
  '@platejs/slate-history',
  '@platejs/slate-hyperscript',
  '@platejs/slate-layout',
  '@platejs/slate-react',
];

const expectedPublicPackageImportSpecifiers = new Set(
  Object.entries(expectedPublicPackageExportMaps)
    .flatMap(([packageName, subpaths]) =>
      subpaths
        .filter((subpath) => subpath !== './internal')
        .map((subpath) =>
          subpath === '.' ? packageName : `${packageName}/${subpath.slice(2)}`
        )
    )
    .sort()
);

const exportSubpathToImportSpecifier = (
  packageName: string,
  subpath: string
) => (subpath === '.' ? packageName : `${packageName}/${subpath.slice(2)}`);

const exportTypesTargetToDtsPath = (packageName: string, types: string) =>
  `packages/${packageDirectoryName(packageName)}/${types.replace(/^\.\//, '')}`;

const rootDistTarget = {
  types: './dist/index.d.ts',
  import: './dist/index.js',
  default: './dist/index.js',
};

const expectedPublicPackageExportTargets: Record<
  string,
  {
    exports: Record<string, unknown>;
    main?: string;
    module?: string;
    types?: string;
  }
> = {
  '@platejs/yjs': {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
      './core': {
        types: './dist/core/index.d.ts',
        import: './dist/core/index.js',
        default: './dist/core/index.js',
      },
      './internal': {
        types: './dist/internal/index.d.ts',
        import: './dist/internal/index.js',
        default: './dist/internal/index.js',
      },
      './react': {
        types: './dist/react/index.d.ts',
        import: './dist/react/index.js',
        default: './dist/react/index.js',
      },
    },
  },
  slate: {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
      './internal': {
        types: './dist/internal/index.d.ts',
        import: './dist/internal/index.js',
        default: './dist/internal/index.js',
      },
    },
  },
  '@platejs/browser': {
    exports: {
      './browser': {
        types: './dist/browser/index.d.ts',
        import: './dist/browser/index.js',
        default: './dist/browser/index.js',
      },
      './core': {
        types: './dist/core/index.d.ts',
        import: './dist/core/index.js',
        default: './dist/core/index.js',
      },
      './playwright': {
        types: './dist/playwright/index.d.ts',
        import: './dist/playwright/index.js',
        default: './dist/playwright/index.js',
      },
      './transports': {
        types: './dist/transports/index.d.ts',
        import: './dist/transports/index.js',
        default: './dist/transports/index.js',
      },
    },
  },
  '@platejs/slate-dom': {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
      './internal': {
        types: './dist/internal/index.d.ts',
        import: './dist/internal/index.js',
        default: './dist/internal/index.js',
      },
    },
  },
  '@platejs/slate-history': {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
    },
  },
  '@platejs/slate-hyperscript': {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
    },
  },
  '@platejs/slate-layout': {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
      './react': {
        types: './dist/react.d.ts',
        import: './dist/react.js',
        default: './dist/react.js',
      },
    },
  },
  '@platejs/slate-react': {
    main: './dist/index.js',
    module: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': rootDistTarget,
    },
  },
};

const expectedPublicPackageDtsPaths = Object.fromEntries(
  Object.entries(expectedPublicPackageExportTargets)
    .flatMap(([packageName, { exports }]) =>
      Object.entries(exports).map(([subpath, target]) => {
        const types =
          typeof target === 'object' && target !== null && 'types' in target
            ? (target.types as string)
            : null;

        assert.equal(
          typeof types,
          'string',
          `${packageName} ${subpath} should expose a declaration target`
        );

        return [
          exportSubpathToImportSpecifier(packageName, subpath),
          [exportTypesTargetToDtsPath(packageName, types)],
        ] as const;
      })
    )
    .sort(([left], [right]) => left.localeCompare(right))
);

const expectedPublicPackageBuildEntries: Record<
  string,
  Record<string, string>
> = {
  '@platejs/yjs': {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'internal/index': 'src/internal/index.ts',
    'react/index': 'src/react/index.ts',
  },
  slate: {
    index: 'src/index.ts',
    'internal/index': 'src/internal/index.ts',
  },
  '@platejs/browser': {
    'browser/index': 'src/browser/index.ts',
    'core/index': 'src/core/index.ts',
    'playwright/index': 'src/playwright/index.ts',
    'transports/index': 'src/transports/index.ts',
  },
  '@platejs/slate-dom': {
    index: 'src/index.ts',
    'internal/index': 'src/internal/index.ts',
  },
  '@platejs/slate-history': {
    index: 'src/index.ts',
  },
  '@platejs/slate-hyperscript': {
    index: 'src/index.ts',
  },
  '@platejs/slate-layout': {
    index: 'src/index.ts',
    react: 'src/react.tsx',
  },
  '@platejs/slate-react': {
    index: 'src/index.ts',
  },
};

const exportTargetToBuildEntry = (target: unknown): string => {
  assert.equal(typeof target, 'object');
  assert.notEqual(target, null);

  const types = (target as { types?: unknown }).types;

  assert.equal(typeof types, 'string');
  assert.equal(types.startsWith('./dist/'), true);
  assert.equal(types.endsWith('.d.ts'), true);

  const withoutPrefix = types.slice('./dist/'.length, -'.d.ts'.length);

  return withoutPrefix === 'index' ? 'index' : withoutPrefix;
};

const collectPublicSlateImportSpecifiers = () => {
  const importSpecifiers = new Map<string, string[]>();
  const sourceFiles = [
    ...structuralPublicMarkdownFiles,
    ...collectFiles(resolve(repoRoot, 'site/examples'), /\.(ts|tsx|js|jsx)$/),
  ].sort();
  const importSpecifierPattern =
    /(?:from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\))/g;

  for (const relativePath of sourceFiles) {
    const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

    for (const match of source.matchAll(importSpecifierPattern)) {
      const specifier = match[1] ?? match[2];

      if (
        !specifier ||
        (!specifier.startsWith('@platejs/slate') &&
          !specifier.startsWith('@slate/'))
      ) {
        continue;
      }

      const files = importSpecifiers.get(specifier) ?? [];

      files.push(relativePath);
      importSpecifiers.set(specifier, files);
    }
  }

  return new Map(
    [...importSpecifiers.entries()]
      .map(
        ([specifier, files]) => [specifier, [...new Set(files)].sort()] as const
      )
      .sort(([left], [right]) => left.localeCompare(right))
  );
};

const publicPackageEntryPointFiles = new Map([
  ['@platejs/yjs', 'packages/yjs/src/index.ts'],
  ['@platejs/yjs/core', 'packages/yjs/src/core/index.ts'],
  ['@platejs/yjs/react', 'packages/yjs/src/react/index.ts'],
  ['@platejs/slate', 'packages/slate/src/index.ts'],
  ['@platejs/browser/playwright', 'packages/browser/src/playwright/index.ts'],
  ['@platejs/slate-dom', 'packages/slate-dom/src/index.ts'],
  ['@platejs/slate-history', 'packages/slate-history/src/index.ts'],
  ['@platejs/slate-hyperscript', 'packages/slate-hyperscript/src/index.ts'],
  ['@platejs/slate-layout', 'packages/slate-layout/src/index.ts'],
  ['@platejs/slate-layout/react', 'packages/slate-layout/src/react.tsx'],
  ['@platejs/slate-react', 'packages/slate-react/src/index.ts'],
] as const);

const resolveSourceModule = (fromRelativePath: string, specifier: string) => {
  if (!specifier.startsWith('.')) return null;

  const basePath = resolve(repoRoot, dirname(fromRelativePath), specifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    join(basePath, 'index.ts'),
    join(basePath, 'index.tsx'),
  ];
  const match = candidates.find(
    (candidate) => existsSync(candidate) && !statSync(candidate).isDirectory()
  );

  return match ? relative(repoRoot, match).replaceAll('\\', '/') : null;
};

const normalizeExportSpecifierName = (specifier: string) =>
  specifier
    .trim()
    .replace(/^type\s+/, '')
    .split(/\s+as\s+/)[0]
    ?.trim();

const collectExportedNamesFromFile = (
  relativePath: string,
  seen = new Set<string>()
): Set<string> => {
  if (seen.has(relativePath)) return new Set();

  seen.add(relativePath);

  const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
  const names = new Set<string>();
  const braceExportPattern =
    /export\s+(?:type\s+)?\{([\s\S]*?)\}(?:\s+from\s+['"]([^'"]+)['"])?/g;
  const starExportPattern =
    /export\s+(?:type\s+)?\*\s+from\s+['"]([^'"]+)['"]/g;
  const valueDeclarationPattern =
    /export\s+(?:declare\s+)?(?:abstract\s+)?(?:const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g;
  const functionDeclarationPattern =
    /export\s+(?:declare\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/g;

  for (const match of source.matchAll(braceExportPattern)) {
    const exportSource = match[2];

    if (exportSource?.startsWith('.')) {
      const resolved = resolveSourceModule(relativePath, exportSource);

      if (resolved) {
        const exportedNames = collectExportedNamesFromFile(resolved, seen);

        for (const specifier of match[1].split(',')) {
          const name = normalizeExportSpecifierName(specifier);

          if (name && exportedNames.has(name)) {
            names.add(name);
          } else if (name) {
            names.add(name);
          }
        }
      }
      continue;
    }

    for (const specifier of match[1].split(',')) {
      const name = normalizeExportSpecifierName(specifier);

      if (name) names.add(name);
    }
  }

  for (const match of source.matchAll(starExportPattern)) {
    const resolved = resolveSourceModule(relativePath, match[1]);

    if (!resolved) continue;

    for (const name of collectExportedNamesFromFile(resolved, seen)) {
      names.add(name);
    }
  }

  for (const match of source.matchAll(valueDeclarationPattern)) {
    names.add(match[1]);
  }

  for (const match of source.matchAll(functionDeclarationPattern)) {
    names.add(match[1]);
  }

  return names;
};

const publicPackageNamedExports = new Map(
  [...publicPackageEntryPointFiles].map(([specifier, relativePath]) => [
    specifier,
    collectExportedNamesFromFile(relativePath),
  ])
);

const collectPublicSlateNamedImports = () => {
  const imports: {
    imported: string;
    module: string;
    source: string;
  }[] = [];
  const sourceFiles = [
    ...collectFiles(resolve(repoRoot, 'site/examples'), /\.(ts|tsx|js|jsx)$/),
  ].sort();

  const collectFromSource = (source: string, relativePath: string) => {
    const sourceFile = ts.createSourceFile(
      relativePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      relativePath.endsWith('.tsx') || relativePath.endsWith('.jsx')
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS
    );

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement)) continue;
      if (!ts.isStringLiteral(statement.moduleSpecifier)) continue;

      const module = statement.moduleSpecifier.text;

      if (!publicPackageEntryPointFiles.has(module)) continue;

      if (statement.importClause?.name) {
        imports.push({
          imported: 'default',
          module,
          source: relativePath,
        });
      }

      const namedBindings = statement.importClause?.namedBindings;

      if (!namedBindings || !ts.isNamedImports(namedBindings)) continue;

      for (const element of namedBindings.elements) {
        imports.push({
          imported: (element.propertyName ?? element.name).text,
          module,
          source: relativePath,
        });
      }
    }
  };

  for (const relativePath of publicMarkdownFiles) {
    const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

    for (const block of getPublicMarkdownCodeFences(source)) {
      collectFromSource(
        block.body,
        `${relativePath}#code-block-${block.index}`
      );
    }
  }

  for (const relativePath of sourceFiles) {
    collectFromSource(
      readFileSync(resolve(repoRoot, relativePath), 'utf8'),
      relativePath
    );
  }

  return imports;
};

const publicMarkdownCodeFenceLanguages = new Map([
  ['js', ts.ScriptKind.JS],
  ['javascript', ts.ScriptKind.JS],
  ['jsx', ts.ScriptKind.JSX],
  ['ts', ts.ScriptKind.TS],
  ['tsx', ts.ScriptKind.TSX],
  ['typescript', ts.ScriptKind.TS],
] as const);

const getPublicMarkdownCodeFences = (source: string) => {
  const codeFencePattern = /```([^\n]*)\n([\s\S]*?)```/g;

  return [...source.matchAll(codeFencePattern)].flatMap((match, index) => {
    const language = match[1].trim().split(/\s+/)[0].toLowerCase();
    const scriptKind = publicMarkdownCodeFenceLanguages.get(language);

    if (!scriptKind) return [];

    return [
      {
        body: match[2],
        index: index + 1,
        language,
        scriptKind,
      },
    ];
  });
};

const getMarkdownHeadingSection = (source: string, heading: string) => {
  const headingPattern = new RegExp(`^#### ${escapeRegExp(heading)}$`, 'm');
  const headingMatch = source.match(headingPattern);

  assert.ok(headingMatch, `${heading} should be documented`);

  const start = headingMatch.index! + headingMatch[0].length;
  const tail = source.slice(start);
  const nextHeading = tail.search(/^#{2,4} /m);

  return nextHeading === -1 ? tail : tail.slice(0, nextHeading);
};

const collectNamedTypeExports = (source: string, exportSource: string) => {
  const blockPattern = new RegExp(
    `export type \\{([\\s\\S]*?)\\} from '${escapeRegExp(exportSource)}'`
  );
  const block = source.match(blockPattern)?.[1];

  assert.ok(block, `${exportSource} type export block should exist`);

  return block
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean)
    .sort();
};

const expectedSiblingRuntimePeerRange = (packageName: string) => {
  const packageJson = readPackageJson(packageName);

  return packageJson.version;
};

const markdownAnchorsByFile = new Map(
  structuralPublicMarkdownFiles.map((relativePath) => [
    relativePath,
    collectMarkdownAnchors(relativePath),
  ])
);

const renamedDataHelperValues = [
  'Element',
  'Location',
  'Node',
  'Operation',
  'Path',
  'PathRef',
  'Point',
  'PointRef',
  'Range',
  'RangeRef',
  'Span',
  'Text',
];

const renamedDataHelperMemberPattern =
  /\b(Element|Location|Node|Operation|Path|PathRef|Point|PointRef|Range|RangeRef|Span|Text)\.(?!TEXT_NODE\b|ELEMENT_NODE\b)/g;

const collectBareDataHelperValueImports = (source: string): string[] => {
  const failures: string[] = [];
  const importPattern = /import\s*\{([^}]*)\}\s*from\s*['"]slate['"]/g;

  for (const match of source.matchAll(importPattern)) {
    const specifiers = match[1] ?? '';

    for (const specifier of specifiers.split(',')) {
      const trimmed = specifier.trim();
      const imported = trimmed
        .replace(/^type\s+/, '')
        .split(/\s+as\s+/)[0]
        ?.trim();

      if (
        !trimmed.startsWith('type ') &&
        imported &&
        renamedDataHelperValues.includes(imported)
      ) {
        failures.push(imported);
      }
    }
  }

  return failures;
};

describe('primary public surface examples', () => {
  it('keeps every example route covered by browser proof', () => {
    const specRoutes = new Set(browserExampleSpecRoutes);
    const aliasedSpecRoutes = new Set(
      [...exampleBrowserProofAliases.values()].map(([alias]) => alias)
    );
    const failures = primaryExampleRoutes.flatMap((route) => {
      const alias = exampleBrowserProofAliases.get(route)?.[0];

      if (specRoutes.has(route) || (alias && specRoutes.has(alias))) {
        return [];
      }

      return [route];
    });
    const staleAliases = [...exampleBrowserProofAliases].flatMap(
      ([route, [alias]]) =>
        primaryExampleRoutes.includes(route) && specRoutes.has(alias)
          ? []
          : [`${route} -> ${alias}`]
    );
    const orphanSpecs = browserExampleSpecRoutes.flatMap((route) => {
      if (
        primaryExampleRoutes.includes(route) ||
        aliasedSpecRoutes.has(route) ||
        exampleBrowserUtilitySpecs.has(route)
      ) {
        return [];
      }

      return [route];
    });
    const staleUtilitySpecs = [...exampleBrowserUtilitySpecs].flatMap(
      ([route, reason]) =>
        specRoutes.has(route) && /\S/.test(reason) ? [] : [route]
    );

    assert.deepEqual(failures, []);
    assert.deepEqual(staleAliases, []);
    assert.deepEqual(orphanSpecs, []);
    assert.deepEqual(staleUtilitySpecs, []);
  });

  for (const relativePath of primaryExampleFiles) {
    it(`${relativePath} does not teach stale editor APIs`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const failures = bannedPublicSurface
        .filter(({ pattern }) => pattern.test(source))
        .map(({ pattern, reason }) => `${pattern}: ${reason}`);

      assert.deepEqual(failures, []);
    });

    it(`${relativePath} does not teach avoidable type slop`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const failures = bannedPublicExampleTypeSlop
        .filter(({ pattern }) => pattern.test(source))
        .map(({ pattern, reason }) => `${pattern}: ${reason}`);

      assert.deepEqual(failures, []);
    });
  }

  it('forced-layout teaches normalizer repair instead of post-commit repair', () => {
    const source = readFileSync(
      resolve(repoRoot, 'site/examples/ts/forced-layout.tsx'),
      'utf8'
    );

    assert.equal(
      /ENFORCING_LAYOUT|WeakSet<CustomEditor>|commitListeners|register\(\{ editor \}\)|editor\.update\(/.test(
        source
      ),
      false
    );
    assert.match(source, /normalizers:\s*\{\s*editor\(/);
  });
});

describe('public React editor factory examples', () => {
  it('keeps direct createReactEditor usage limited to remount/control surfaces', () => {
    const directFactoryExamples = primaryExampleFiles
      .filter((relativePath) =>
        readFileSync(resolve(repoRoot, relativePath), 'utf8').includes(
          'createReactEditor('
        )
      )
      .sort();

    assert.deepEqual(directFactoryExamples, [
      'site/examples/ts/huge-document.tsx',
    ]);

    const hugeDocument = readFileSync(
      resolve(repoRoot, 'site/examples/ts/huge-document.tsx'),
      'utf8'
    );

    assert.match(hugeDocument, /remounts editors from URL\/config controls/);
    assert.match(hugeDocument, /setEditor\(createEditor/);
    assert.match(hugeDocument, /setEditorVersion/);
  });
});

describe('public example metadata', () => {
  it('keeps example badges current-state only', () => {
    const examples = readFileSync(
      resolve(repoRoot, 'site/constants/examples.ts'),
      'utf8'
    );
    const layout = readFileSync(
      resolve(repoRoot, 'site/components/ExampleLayout.tsx'),
      'utf8'
    );
    const styles = readFileSync(
      resolve(repoRoot, 'site/public/index.css'),
      'utf8'
    );

    assert.match(examples, /export type ExampleBadge = 'alpha'/);
    assert.doesNotMatch(examples, /badge: 'new'/);
    assert.doesNotMatch(layout, /\bNew\b/);
    assert.doesNotMatch(styles, /example-badge-new/);
  });

  it('keeps the examples README current for Bun and v2-only proof routes', () => {
    const source = readFileSync(
      resolve(repoRoot, 'site/examples/Readme.md'),
      'utf8'
    );

    assert.match(source, /bun install/);
    assert.match(source, /bun dev/);
    assert.match(source, /hidden DOM coverage/);
    assert.match(source, /multi-root\s+documents/);
    assert.match(source, /Pagination is an alpha example/);
    assert.match(
      source,
      /bun run playwright playwright\/integration\/examples\/richtext\.test\.ts --project=chromium/
    );
    assert.doesNotMatch(source, /\byarn\b/i);
    assert.doesNotMatch(source, /glorified `<textarea>`/);
  });
});

describe('public data helper namespace examples', () => {
  for (const relativePath of [
    ...publicAuthoringFiles,
    ...publicDocumentationFiles,
  ]) {
    it(`${relativePath} uses Api-suffixed data helper values`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const helperMembers = [...source.matchAll(renamedDataHelperMemberPattern)]
        .map((match) => match[0])
        .sort();

      assert.deepEqual(collectBareDataHelperValueImports(source), []);
      assert.deepEqual(helperMembers, []);
    });
  }
});

describe('public current-state wording', () => {
  for (const relativePath of [
    ...publicAuthoringFiles,
    ...publicDocumentationFiles,
  ]) {
    it(`${relativePath} does not teach compatibility or migration posture`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      assert.doesNotMatch(
        source,
        /\b(?:COMPAT|compatibility|deprecated|deprecation|legacy|migrat(?:e|ion)|previously)\b/i
      );
    });
  }

  for (const relativePath of publicMarkdownFiles) {
    it(`${relativePath} does not teach public API aliases`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      assert.doesNotMatch(source, /\balias(?:es)?\b/i);
    });
  }

  for (const relativePath of ['packages/slate-dom/README.md']) {
    it(`${relativePath} routes external code to extensions, not plugins`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      assert.doesNotMatch(source, /\bApps, plugins, and framework adapters\b/);
      assert.match(
        source,
        /\bApps, extension libraries, and framework adapters\b/
      );
    });
  }

  for (const relativePath of publicMarkdownFiles) {
    it(`${relativePath} keeps editor.api docs on runtime service namespaces`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const invalidNamespaces = [
        ...source.matchAll(/\beditor\.api\.([A-Za-z0-9_]+)/g),
      ]
        .map((match) => match[1]!)
        .filter(
          (namespace) =>
            !['clipboard', 'dom', 'history', 'react'].includes(namespace)
        );

      assert.deepEqual([...new Set(invalidNamespaces)].sort(), []);
    });
  }

  it('keeps resources as links, not stale API utility guidance', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/general/resources.md'),
      'utf8'
    );

    assert.match(source, /The Slate v2 docs and package READMEs are/);
    assert.match(source, /Check Slate v2 support before installing/);
    assert.match(source, /Adjacent Editor References/);
    assert.doesNotMatch(source, /\bHotkeys\b/);
    assert.doesNotMatch(source, /\bProducts\b/);
    assert.doesNotMatch(source, /Quill Forms/);
    assert.doesNotMatch(source, /Discord/);
    assert.doesNotMatch(source, /semantic editor checks/i);
  });
});

describe('release docs', () => {
  it('keeps release docs public-facing and treats lower-level editor helpers as escape hatches', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/releases/slate-v2.md'),
      'utf8'
    );
    const summary = readFileSync(resolve(repoRoot, 'docs/Summary.md'), 'utf8');

    assert.doesNotMatch(source, /\blegacy\b/i);
    assert.match(summary, /- \[Slate v2\]\(releases\/slate-v2\.md\)/);
    assert.doesNotMatch(summary, /Slate v2 Release Draft/);
    assert.match(
      summary,
      /- \[Operation Replay Substrate\]\(walkthroughs\/07-operation-replay-substrate\.md\)/
    );
    assert.doesNotMatch(summary, /Collaborative Editing Substrate/);
    assert.match(
      source,
      /The lower-level `Editor\.\*` helpers remain public for runtime bridges, tests,\nand advanced package code\./
    );
    assert.match(
      source,
      /For a published beta package set, install the React editor with:/
    );
    assert.match(
      source,
      /Use the equivalent command for pnpm, Yarn, or Bun when your app uses another\npackage manager\./
    );
    assert.match(source, /multi-root document/);
    assert.match(source, /synced blocks/);
    assert.match(source, /document state/);
    assert.match(source, /DOM coverage boundaries/);
    assert.match(source, /pagination remains alpha/);
    assert.doesNotMatch(
      source,
      /Use that command once the beta packages are published\./
    );
    assert.doesNotMatch(source, /^\*\*New\*\*$/m);
  });
});

describe('public root value model', () => {
  const publicRootModelFiles = [
    ...new Set([...publicMarkdownFiles, ...publicAuthoringFiles]),
  ].sort();
  const publicRootErrorSourceFiles = [
    'packages/slate/src/core/public-state.ts',
    'packages/slate/src/editor-runtime-view.ts',
    'packages/slate-layout/src/index.ts',
    'packages/slate-react/src/hooks/use-slate-history.ts',
    'packages/slate-react/src/hooks/use-slate-root-chrome.ts',
    'packages/slate-react/src/hooks/use-slate-runtime.tsx',
  ];

  for (const relativePath of publicRootModelFiles) {
    it(`${relativePath} does not expose a public main root key`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      assert.doesNotMatch(source, /\bmain root\b/i);
      assert.doesNotMatch(source, /\bprimary root\b/i);
      assert.doesNotMatch(source, /\bMAIN_ROOT_KEY\b/);
      assert.doesNotMatch(source, /\bnamedRoots\b/);
      assert.doesNotMatch(source, /\broot\s*[:=]\s*['"]main['"]/);
      assert.doesNotMatch(source, /\.root\s*\(\s*['"]main['"]\s*\)/);
    });
  }

  it('teaches children as the primary document and roots as extras', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/concepts/13-roots.md'),
      'utf8'
    );

    assert.match(
      source,
      /Slate stores the primary document as a normal block array\./
    );
    assert.match(
      source,
      /Pass `initialValue\.children` plus `initialValue\.roots`/
    );
    assert.match(source, /root="header"/);
    assert.doesNotMatch(source, /root: ['"]main['"]/);
  });

  it('keeps public root hook errors on primary-document wording', () => {
    const failures = publicRootErrorSourceFiles.flatMap((relativePath) => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      return /internal root key/.test(source)
        ? [
            `${relativePath} should not mention the internal root key in user-facing errors`,
          ]
        : [];
    });

    assert.deepEqual(failures, []);
  });

  it('documents serialized operation root semantics for replay', () => {
    const operationApi = readFileSync(
      resolve(repoRoot, 'docs/api/operations/operation.md'),
      'utf8'
    );
    const operationReplay = readFileSync(
      resolve(repoRoot, 'docs/walkthroughs/07-operation-replay-substrate.md'),
      'utf8'
    );

    for (const source of [operationApi, operationReplay]) {
      assert.match(source, /primary-document operations\s+omit `root`/);
      assert.match(source, /extra-root operations (?:preserve|keep) `root`/);
      assert.match(
        source,
        /Replay (?:serialized or )?remote [\s\S]*base editor\/runtime/
      );
      assert.match(
        source,
        /root-bound [\s\S]*local commands scoped to\s+that root/
      );
      assert.doesNotMatch(source, /root: ['"]main['"]/);
    }
  });

  it('keeps the multi-root example and browser proof on the body public root', () => {
    const sources = [
      'site/examples/ts/multi-root-document.tsx',
      'playwright/integration/examples/multi-root-document.test.ts',
    ].map((relativePath) =>
      readFileSync(resolve(repoRoot, relativePath), 'utf8')
    );

    for (const source of sources) {
      assert.doesNotMatch(source, /multi-root-main/);
      assert.doesNotMatch(source, /\broots:main\b/);
      assert.doesNotMatch(source, /\bmain:/);
      assert.doesNotMatch(
        source,
        /root === undefined \|\| root === ['"]main['"]/
      );
    }
    assert.match(sources.join('\n'), /multi-root-body-surface/);
    assert.match(sources.join('\n'), /multi-root-body-status/);
    assert.match(sources.join('\n'), /\broots:body\b/);
    assert.match(
      sources.join('\n'),
      /root === undefined \? ['"]body['"] : root/
    );
  });
});

describe('public markdown code fences', () => {
  for (const relativePath of structuralPublicMarkdownFiles) {
    it(`${relativePath} keeps TypeScript and JavaScript fences parseable`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const codeFences = getPublicMarkdownCodeFences(source);
      const failures = codeFences.flatMap((block) => {
        const sourceFile = ts.createSourceFile(
          `${relativePath}#code-block-${block.index}.${block.language}`,
          block.body,
          ts.ScriptTarget.Latest,
          true,
          block.scriptKind
        );

        return sourceFile.parseDiagnostics.map(
          (diagnostic) =>
            `code block ${block.index}: ${ts.flattenDiagnosticMessageText(
              diagnostic.messageText,
              ' '
            )}`
        );
      });

      assert.deepEqual(failures, []);
      assert.deepEqual(
        codeFences.flatMap((block) =>
          /\bany\b/.test(block.body)
            ? [`code block ${block.index} should not teach any`]
            : []
        ),
        []
      );
    });
  }

  it('keeps current docs and examples on exported package names', () => {
    const failures = collectPublicSlateNamedImports().flatMap(
      ({ imported, module, source }) => {
        if (imported === 'default') {
          return [`${source}: ${module} has no default export`];
        }

        const exportedNames = publicPackageNamedExports.get(module);

        if (!exportedNames?.has(imported)) {
          return [`${source}: ${module} does not export ${imported}`];
        }

        return [];
      }
    );

    assert.deepEqual(failures, []);
  });
});

describe('public predicate input types', () => {
  for (const relativePath of publicPredicateInputFiles) {
    it(`${relativePath} accepts unknown predicate inputs`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      assert.doesNotMatch(source, /\b(?:value|props): any\b/);
    });
  }

  it('keeps EditorStaticApi.isEditor on unknown input without banning mark values', () => {
    const source = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );

    assert.doesNotMatch(source, /\bisEditor:\s*\(\s*value:\s*any\b/);
  });
});

describe('primary public internal import boundaries', () => {
  for (const relativePath of [
    ...publicAuthoringFiles,
    ...structuralPublicMarkdownFiles,
  ]) {
    it(`${relativePath} does not import internal package paths`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const matches = [...source.matchAll(bannedPublicInternalImportPattern)]
        .map((match) => match[0])
        .sort();

      assert.deepEqual(matches, []);
    });
  }
});

describe('sibling runtime bridge peer floors', () => {
  const packageSourceFiles = collectFiles(
    resolve(repoRoot, 'packages'),
    /\.(ts|tsx|js|jsx)$/
  ).filter(
    (relativePath) =>
      relativePath.includes('/src/') && !relativePath.includes('/node_modules/')
  );

  it('keeps slate/internal imports on the classified sibling bridge list', () => {
    const importers = packageSourceFiles
      .filter((relativePath) =>
        readFileSync(resolve(repoRoot, relativePath), 'utf8').includes(
          "from '@platejs/slate/internal'"
        )
      )
      .sort();
    const classified = [...allowedSlateInternalBridgeImporters.keys()].sort();

    assert.deepEqual(importers, classified);

    for (const [relativePath, reason] of allowedSlateInternalBridgeImporters) {
      assert.ok(reason.length > 40, `${relativePath} needs a concrete reason`);
    }
  });

  it('keeps packages importing slate/internal on the current Slate peer floor', () => {
    const expectedRange = expectedSiblingRuntimePeerRange('@platejs/slate');
    const violations = packageSourceFiles.flatMap((relativePath) => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      if (!source.includes("from '@platejs/slate/internal'")) return [];

      const packageName = relativePath.split('/')[1] ?? '';
      const packageJson = readPackageJson(packageName);

      if (packageJson.private) return [];

      return packageJson.peerDependencies?.slate === expectedRange
        ? []
        : [
            `${packageName}: expected slate ${expectedRange}, got ${packageJson.peerDependencies?.slate ?? 'missing'}`,
          ];
    });

    assert.deepEqual(violations, []);
  });

  it('keeps packages importing slate-dom/internal on the current Slate DOM peer floor', () => {
    const expectedRange = expectedSiblingRuntimePeerRange('@platejs/slate-dom');
    const violations = packageSourceFiles.flatMap((relativePath) => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      if (!source.includes("from '@platejs/slate-dom/internal'")) return [];

      const packageName = relativePath.split('/')[1] ?? '';
      const packageJson = readPackageJson(packageName);

      if (packageJson.private) return [];

      return packageJson.peerDependencies?.['@platejs/slate-dom'] ===
        expectedRange
        ? []
        : [
            `${packageName}: expected slate-dom ${expectedRange}, got ${packageJson.peerDependencies?.['@platejs/slate-dom'] ?? 'missing'}`,
          ];
    });

    assert.deepEqual(violations, []);
  });

  it('keeps sibling package runtime edges exact before changeset versioning', () => {
    const slateLayoutPackage = readPackageJson('@platejs/slate-layout');
    const slateReactPackage = readPackageJson('@platejs/slate-react');

    assert.equal(
      slateLayoutPackage.peerDependencies?.slate,
      readPackageJson('@platejs/slate').version
    );
    assert.equal(
      slateLayoutPackage.peerDependencies?.['@platejs/slate-react'],
      readPackageJson('@platejs/slate-react').version
    );
    assert.equal(
      slateReactPackage.dependencies?.['@platejs/slate-history'],
      readPackageJson('@platejs/slate-history').version
    );
  });
});

describe('primary public markdown links', () => {
  it('lists every API leaf page in the Summary navigation', () => {
    const summary = readFileSync(resolve(repoRoot, 'docs/Summary.md'), 'utf8');
    const apiLeafDocs = collectMarkdownFiles(resolve(repoRoot, 'docs/api'))
      .filter((relativePath) => !relativePath.endsWith('/README.md'))
      .map((relativePath) => relativePath.replace(/^docs\//, ''));
    const missing = apiLeafDocs.filter(
      (relativePath) => !summary.includes(`(${relativePath})`)
    );

    assert.deepEqual(missing, []);
  });

  for (const relativePath of structuralPublicMarkdownFiles) {
    it(`${relativePath} links to existing markdown files and anchors`, () => {
      const source = stripFencedCodeBlocks(
        readFileSync(resolve(repoRoot, relativePath), 'utf8')
      );
      const failures: string[] = [];

      const checkTarget = (rawTarget: string, rawHash: string) => {
        if (/^[a-z]+:/.test(rawTarget) || rawTarget.startsWith('/')) {
          return;
        }

        const targetPath = rawTarget
          ? resolve(dirname(resolve(repoRoot, relativePath)), rawTarget)
          : resolve(repoRoot, relativePath);

        if (rawTarget && !statSync(targetPath, { throwIfNoEntry: false })) {
          failures.push(`missing file: ${rawTarget}`);
          return;
        }

        if (
          rawHash &&
          (rawTarget === '' ||
            targetPath.endsWith('.md') ||
            targetPath.endsWith('Readme.md'))
        ) {
          const targetRelativePath = relative(repoRoot, targetPath).replaceAll(
            '\\',
            '/'
          );
          const anchors = markdownAnchorsByFile.get(targetRelativePath);
          const anchor = decodeURIComponent(rawHash.slice(1));

          if (anchors && !anchors.has(anchor)) {
            failures.push(`missing anchor: ${rawTarget}${rawHash}`);
          }
        }
      };

      for (const match of source.matchAll(markdownLinkPattern)) {
        checkTarget(match[1] ?? '', match[2] ?? '');
      }

      for (const match of source.matchAll(markdownReferenceLinkPattern)) {
        const rawTargetWithHash = (match[1] ?? '').replace(/^<|>$/g, '');
        const hashIndex = rawTargetWithHash.indexOf('#');
        const rawTarget =
          hashIndex === -1
            ? rawTargetWithHash
            : rawTargetWithHash.slice(0, hashIndex);
        const rawHash =
          hashIndex === -1 ? '' : rawTargetWithHash.slice(hashIndex);

        checkTarget(rawTarget, rawHash);
      }

      assert.deepEqual(failures, []);
    });
  }
});

describe('slate-react public docs', () => {
  it('documents Slate component props without treating initialValue as a prop', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/libraries/slate-react/slate.md'),
      'utf8'
    );
    const installing = readFileSync(
      resolve(repoRoot, 'docs/walkthroughs/01-installing-slate.md'),
      'utf8'
    );
    const rootReadme = readFileSync(resolve(repoRoot, 'Readme.md'), 'utf8');

    assert.equal(/### `initialValue`/.test(source), false);
    assert.match(source, /onSelectionChange\?:/);
    assert.match(source, /onValueChange\?:/);
    assert.match(
      source,
      /`SlateChange` is the React callback detail for the provider root/
    );
    assert.match(
      source,
      /Use `editor\.subscribeCommit`[\s\S]*when infrastructure needs every raw commit/
    );
    assert.match(source, /<Slate>` does\s+not take an `initialValue` prop/);
    assert.match(
      installing,
      /import \{ Editable, Slate, type SlateChange, useSlateEditor \} from '@platejs\/slate-react'/
    );
    assert.match(
      installing,
      /const editor = useSlateEditor<CustomValue>\(\{ initialValue \}\)/
    );
    assert.match(
      installing,
      /The editor is seeded by `useSlateEditor\(\{ initialValue \}\)`/
    );
    assert.match(installing, /`<Slate>`\s+provides that existing editor/);
    assert.match(
      source,
      /const editor = useSlateEditor<CustomValue>\(\{ initialValue \}\)/
    );
    assert.match(
      rootReadme,
      /import \{ Editable, Slate, useSlateEditor \} from '@platejs\/slate-react'/
    );
    assert.match(
      rootReadme,
      /const editor = useSlateEditor<CustomValue>\(\{ initialValue \}\)/
    );
    assert.doesNotMatch(rootReadme, /useState\(\(\) =>/);
    assert.doesNotMatch(rootReadme, /createReactEditor/);
  });

  it('teaches useSlateEditor as the React-owned walkthrough front door', () => {
    for (const file of [
      'Readme.md',
      'docs/walkthroughs/01-installing-slate.md',
      'docs/walkthroughs/02-adding-event-handlers.md',
      'docs/walkthroughs/03-defining-custom-elements.md',
      'docs/walkthroughs/04-applying-custom-formatting.md',
      'docs/walkthroughs/05-executing-commands.md',
      'docs/libraries/slate-react/react-editor-setup.md',
      'docs/libraries/slate-react/slate.md',
    ]) {
      const source = readFileSync(resolve(repoRoot, file), 'utf8');

      assert.match(
        source,
        /\buseSlateEditor\b/,
        `${file} should teach useSlateEditor for React-owned editors`
      );
    }
  });

  it('documents subscribe and subscribeCommit as different integration hooks', () => {
    const slateDocs = readFileSync(
      resolve(repoRoot, 'docs/libraries/slate-react/slate.md'),
      'utf8'
    );
    const editorDocs = readFileSync(
      resolve(repoRoot, 'docs/api/nodes/editor.md'),
      'utf8'
    );

    assert.match(
      slateDocs,
      /Use `editor\.subscribe\(\.\.\.\)` for persistence services\s+that need a committed snapshot plus a change summary/
    );
    assert.match(
      slateDocs,
      /Use `editor\.subscribeCommit\(\.\.\.\)` for low-level commit subscribers/
    );
    assert.match(slateDocs, /sync adapters, operation replay/);
    assert.match(
      editorDocs,
      /#### `editor\.subscribe\(listener\) => \(\) => void`/
    );
    assert.match(
      editorDocs,
      /#### `editor\.subscribeCommit\(listener\) => \(\) => void`/
    );
    assert.match(editorDocs, /subscribe\(listener: SnapshotListener\)/);
    assert.match(
      editorDocs,
      /subscribeCommit\(listener: \(commit: EditorCommit\) => void\)/
    );
    assert.doesNotMatch(editorDocs, /\bEditorListener\b/);
    assert.doesNotMatch(editorDocs, /\bEditorCommitListener\b/);
  });
});

describe('slate-hyperscript public docs', () => {
  it('documents fixture-only usage, built-in tags, and custom element shorthands', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/libraries/slate-hyperscript.md'),
      'utf8'
    );

    assert.match(source, /Keep hyperscript in tests and fixtures/);
    assert.match(source, /<editor>/);
    assert.match(source, /<cursor \/>/);
    assert.match(source, /<anchor \/>/);
    assert.match(source, /<focus \/>/);
    assert.match(source, /createHyperscript/);
    assert.match(source, /elements:\s*\{[\s\S]*paragraph/);
  });
});

describe('core package library docs', () => {
  it('documents the root README package table with current package roles', () => {
    const source = readFileSync(resolve(repoRoot, 'Readme.md'), 'utf8');

    for (const row of [
      /\| `slate` \| Core editor, document model, operations, transactions, state fields, transforms, refs, and extension runtime\. \|/,
      /\| `slate-dom` \| DOM bridge, clipboard bridge, selection conversion, hotkeys, and contenteditable coverage helpers\. \|/,
      /\| `slate-react` \| React editor factory, `<Slate>`, `<Editable>`, rendering primitives, hooks, decoration sources, annotations, widgets, and DOM strategies\. \|/,
      /\| `slate-history` \| Undo\/redo history extension exposed through `state\.history` and `tx\.history`\. \|/,
      /\| `slate-hyperscript` \| JSX-style test\/document creation helpers\. \|/,
      /\| `slate-layout` \| Experimental page layout and page-level rendering helpers\. \|/,
      /\| `slate-browser` \| Browser proof harness\. It is test infrastructure, not the product editing API\. \|/,
    ]) {
      assert.match(source, row);
    }

    assert.doesNotMatch(source, /previously|migration|deprecated/);
  });

  it('links core public libraries from the library navigation', () => {
    const summary = readFileSync(resolve(repoRoot, 'docs/Summary.md'), 'utf8');

    assert.match(summary, /- \[Slate\]\(libraries\/slate\.md\)/);
    assert.match(summary, /- \[Slate DOM\]\(libraries\/slate-dom\.md\)/);
    assert.match(
      summary,
      /- \[Slate Browser\]\(libraries\/slate-browser\.md\)/
    );
  });

  it('documents the slate package as the core runtime', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/libraries/slate.md'),
      'utf8'
    );
    const packageReadme = readFileSync(
      resolve(repoRoot, 'packages/slate/Readme.md'),
      'utf8'
    );
    const packageSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/index.ts'),
      'utf8'
    );

    assert.match(source, /`slate` is the core editor runtime/);
    assert.match(source, /createEditor/);
    assert.match(source, /createEditorRuntime/);
    assert.match(source, /createEditorView/);
    assert.match(source, /Use `isEditor`/);
    assert.match(source, /editor\.read/);
    assert.match(source, /editor\.update/);
    assert.match(source, /defineEditorExtension/);
    assert.match(source, /defineStateField/);
    assert.match(source, /elementProperty/);
    assert.match(source, /ElementApi/);
    assert.match(source, /state\.\*/);
    assert.match(source, /tx\.\*/);
    assert.match(source, /Middleware and debug APIs include/);
    assert.match(source, /The `\/internal` package subpath is reserved/);
    assert.doesNotMatch(source, /from\s+['"]slate\/internal['"]/);
    assert.match(packageReadme, /Core Slate editor runtime/);
    assert.match(
      packageReadme,
      /import \{ createEditor \} from '@platejs\/slate'/
    );
    assert.match(packageReadme, /createEditorRuntime/);
    assert.match(packageReadme, /createEditorView/);
    assert.match(packageReadme, /Use `isEditor`/);
    assert.match(packageReadme, /defineEditorExtension/);
    assert.match(packageReadme, /defineStateField/);
    assert.match(packageReadme, /elementProperty/);
    assert.match(packageReadme, /ElementApi/);
    assert.match(packageReadme, /state fields/);
    assert.match(packageReadme, /tx\.text\.insert/);
    assert.match(packageReadme, /Middleware and debug APIs include/);

    const groupedTypeDocs = `${source}\n${packageReadme}`;
    for (const name of [
      'Editor',
      'BaseEditor',
      'Value',
      'InitialValue',
      'Selection',
      'RootKey',
      'RuntimeId',
      'EditorRuntime',
      'EditorView',
      'EditorSnapshot',
      'EditorCommit',
      'EditorCommitClass',
      'SnapshotInput',
      'SnapshotListener',
      'EditorStateView',
      'EditorStateValueApi',
      'EditorUpdateTransaction',
      'EditorTransactionValueApi',
      'EditorUpdateOptions',
      'EditorUpdateMetadata',
      'EditorExtension',
      'EditorExtensionInput',
      'EditorExtensionSetupContext',
      'EditorExtensionSetupOutput',
      'EditorExtensionRuntimeState',
      'EditorExtensionStateGroup',
      'EditorExtensionStateGroups',
      'EditorExtensionTxGroup',
      'EditorExtensionTxGroups',
      'EditorExtensionOperations',
      'EditorElementSpec',
      'EditorElementBehavior',
      'EditorElementContentRootSpec',
      'EditorElementPropertyDescriptor',
      'EditorElementPropertyKind',
      'EditorElementVoidKind',
      'StateFieldDescriptor',
      'StateFieldValueInput',
      'EditorStateField',
      'EditorTransformApi',
      'EditorTransformMiddlewareArgs',
      'EditorTransformMiddlewareContext',
      'EditorTransformMiddlewareMap',
      'EditorQueryGroup',
      'EditorQueryMiddlewareContext',
      'EditorQueryMiddlewareMap',
      'EditorQueryMiddlewareResult',
      'EditorOperationApplyContext',
      'EditorOperationApplyHandler',
      'setDebugValueScrubber',
      'DebugValueScrubber',
    ]) {
      assert.match(
        groupedTypeDocs,
        new RegExp(`\\b${name}\\b`),
        `${name} should be anchored in Slate package docs`
      );
    }
    assert.match(packageSource, /export \{ createEditor \}/);
    assert.match(
      packageSource,
      /export \{ createEditorRuntime, createEditorView \}/
    );
    assert.match(packageSource, /export \{ defineEditorExtension \}/);
    assert.match(packageSource, /export \{ defineStateField \}/);
    assert.match(packageSource, /export \{ elementProperty \}/);
    assert.doesNotMatch(packageSource, /export \* from '\.\/text-units'/);
    assert.doesNotMatch(packageSource, /export \* from '\.\/utils\/is-object'/);
  });

  it('classifies every explicit root editor type export', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/libraries/slate.md'),
      'utf8'
    );
    const packageReadme = readFileSync(
      resolve(repoRoot, 'packages/slate/Readme.md'),
      'utf8'
    );
    const packageSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/index.ts'),
      'utf8'
    );
    const groupedTypeDocs = `${source}\n${packageReadme}`;
    const explicitlyExportedEditorTypes = collectNamedTypeExports(
      packageSource,
      './interfaces/editor'
    );
    const deliberatelyGroupedRootEditorTypeExports = new Map([
      ['CreateEditorOptions', 'factory option detail covered by createEditor'],
      ['DirtyRegion', 'dirty-range internals'],
      ['EditorCanonicalUpdateTag', 'update-tag detail'],
      ['EditorCollaborationUpdateMetadata', 'update metadata detail'],
      ['EditorCommitCommand', 'commit implementation detail'],
      ['EditorCommitContext', 'commit implementation detail'],
      ['EditorCommitHandler', 'commit implementation detail'],
      ['EditorCommitSource', 'commit source detail'],
      ['EditorCoreStateView', 'core state base covered by EditorStateView'],
      [
        'EditorCoreUpdateTransaction',
        'core transaction base covered by EditorUpdateTransaction',
      ],
      ['EditorDocumentValue', 'value detail covered by Value'],
      ['EditorFragmentReadOptions', 'read option detail'],
      ['EditorHistoryUpdateMetadata', 'update metadata detail'],
      ['EditorIsEditorOptions', 'type-guard option detail'],
      ['EditorMarks', 'marks detail covered by state.marks and tx.marks'],
      ['EditorMarksOf', 'marks utility detail'],
      ['EditorOperationDirtinessOptions', 'operation option detail'],
      ['EditorOperationReplayOptions', 'operation option detail'],
      ['EditorPublicTransformMiddlewareKey', 'middleware key detail'],
      ['EditorQueryMiddlewareArgs', 'query middleware argument detail'],
      ['EditorRuntimeOptions', 'runtime option detail'],
      ['EditorSchemaApi', 'schema API detail'],
      ['EditorSelectionUpdateMetadata', 'update metadata detail'],
      [
        'EditorStateExtensionGroups',
        'state extension group detail covered by extension type groups',
      ],
      ['EditorStateFragmentApi', 'state API group detail covered by state.*'],
      ['EditorStateMarksApi', 'state API group detail covered by state.*'],
      ['EditorStateNodesApi', 'state API group detail covered by state.*'],
      ['EditorStatePatch', 'state patch payload detail'],
      ['EditorStatePointsApi', 'state API group detail covered by state.*'],
      ['EditorStateRangesApi', 'state API group detail covered by state.*'],
      ['EditorStateRuntimeApi', 'state API group detail covered by state.*'],
      ['EditorStateSchemaApi', 'state API group detail covered by state.*'],
      ['EditorStateSelectionApi', 'state API group detail covered by state.*'],
      ['EditorStateTextApi', 'state API group detail covered by state.*'],
      ['EditorStateViewApi', 'state API group detail covered by state.*'],
      ['EditorTargetRuntime', 'target runtime detail'],
      ['EditorTransactionBreakApi', 'transaction API group covered by tx.*'],
      ['EditorTransactionFragmentApi', 'transaction API group covered by tx.*'],
      ['EditorTransactionMarksApi', 'transaction API group covered by tx.*'],
      ['EditorTransactionNodesApi', 'transaction API group covered by tx.*'],
      [
        'EditorTransactionOperationsApi',
        'transaction API group covered by tx.*',
      ],
      ['EditorTransactionRootsApi', 'transaction API group covered by tx.*'],
      [
        'EditorTransactionSelectionApi',
        'transaction API group covered by tx.*',
      ],
      [
        'EditorTransactionStatePatchesApi',
        'transaction API group covered by tx.*',
      ],
      ['EditorTransactionTextApi', 'transaction API group covered by tx.*'],
      ['EditorTransformNext', 'middleware continuation detail'],
      [
        'EditorTxExtensionGroups',
        'transaction extension group detail covered by extension type groups',
      ],
      ['EditorUpdateContext', 'update context detail'],
      ['EditorUpdateTag', 'update-tag detail'],
      ['EditorUpdateTagInput', 'update-tag detail'],
      ['EditorViewOptions', 'view option detail'],
      ['ProjectedRangeSegment', 'projected range detail'],
      ['SnapshotDirtyScope', 'snapshot dirtiness detail'],
      ['SnapshotIndex', 'snapshot indexing detail'],
      ['StateFieldCollabPolicy', 'state-field policy detail'],
      ['StateFieldHistoryPolicy', 'state-field policy detail'],
      ['StateFieldInitial', 'state-field initial-value detail'],
      ['TargetFreshnessRequest', 'target freshness detail'],
      ['TopLevelRuntimeRange', 'runtime range detail'],
      ['ValueOf', 'value utility detail'],
    ] as const);
    const undocumented = explicitlyExportedEditorTypes.filter(
      (name) =>
        !new RegExp(`\\b${name}\\b`).test(groupedTypeDocs) &&
        !deliberatelyGroupedRootEditorTypeExports.has(name)
    );
    const staleClassifications = [
      ...deliberatelyGroupedRootEditorTypeExports.keys(),
    ].filter((name) => !explicitlyExportedEditorTypes.includes(name));
    const nowDocumentedClassifications = [
      ...deliberatelyGroupedRootEditorTypeExports.keys(),
    ].filter((name) => new RegExp(`\\b${name}\\b`).test(groupedTypeDocs));
    const emptyReasons = [
      ...deliberatelyGroupedRootEditorTypeExports.entries(),
    ].flatMap(([name, reason]) => (reason.length > 0 ? [] : [name]));

    assert.deepEqual(undocumented, []);
    assert.deepEqual(staleClassifications, []);
    assert.deepEqual(nowDocumentedClassifications, []);
    assert.deepEqual(emptyReasons, []);
  });

  it('documents the slate-dom package as a framework bridge', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/libraries/slate-dom.md'),
      'utf8'
    );
    const packageReadme = readFileSync(
      resolve(repoRoot, 'packages/slate-dom/README.md'),
      'utf8'
    );
    const packageSource = readFileSync(
      resolve(repoRoot, 'packages/slate-dom/src/index.ts'),
      'utf8'
    );

    assert.match(source, /`slate-dom` is the DOM bridge/);
    assert.match(
      source,
      /React apps normally use these APIs through `slate-react`/
    );
    assert.match(
      source,
      /import \{ DOMCoverage, Hotkeys, isDOMNode \} from '@platejs\/slate-dom'/
    );
    assert.match(source, /EditableDOMCoverageBoundary/);
    assert.match(source, /The `\/internal` package subpath is reserved/);
    assert.doesNotMatch(source, /slate-dom\/internal/);
    assert.match(packageReadme, /DOM bridge for Slate editors/);
    assert.match(packageReadme, /React apps normally use these APIs through/);
    assert.match(
      packageReadme,
      /import \{ DOMCoverage, Hotkeys, isDOMNode \} from '@platejs\/slate-dom'/
    );
    assert.match(packageSource, /export \{ DOMCoverage \}/);
    assert.match(packageSource, /Hotkeys/);
  });

  it('documents exported package subpaths with public boundaries', () => {
    for (const [packageName, expectedExportMap] of Object.entries(
      expectedPublicPackageExportMaps
    )) {
      assert.deepEqual(
        Object.keys(readPackageJson(packageName).exports ?? {}).sort(),
        expectedExportMap,
        `${packageName} package export map changed`
      );
    }
    for (const [packageName, expectedTargets] of Object.entries(
      expectedPublicPackageExportTargets
    )) {
      const packageJson = readPackageJson(packageName);
      const actualTargets: {
        exports: Record<string, unknown>;
        main?: string;
        module?: string;
        types?: string;
      } = {
        exports: packageJson.exports ?? {},
      };

      if (packageJson.main !== undefined) actualTargets.main = packageJson.main;
      if (packageJson.module !== undefined) {
        actualTargets.module = packageJson.module;
      }
      if (packageJson.types !== undefined) {
        actualTargets.types = packageJson.types;
      }

      assert.deepEqual(
        actualTargets,
        expectedTargets,
        `${packageName} package export targets changed`
      );
    }

    const slatePackage = readPackageJson('@platejs/slate');
    const slateReadme = readFileSync(
      resolve(repoRoot, 'packages/slate/Readme.md'),
      'utf8'
    );
    const slateDomPackage = readPackageJson('@platejs/slate-dom');
    const slateDomReadme = readFileSync(
      resolve(repoRoot, 'packages/slate-dom/README.md'),
      'utf8'
    );
    const slateBrowserPackage = readPackageJson('@platejs/browser');
    const slateBrowserReadme = readFileSync(
      resolve(repoRoot, 'packages/browser/README.md'),
      'utf8'
    );
    const slateLayoutPackage = readPackageJson('@platejs/slate-layout');
    const slateLayoutReadme = readFileSync(
      resolve(repoRoot, 'packages/slate-layout/README.md'),
      'utf8'
    );

    assert.equal('./internal' in (slatePackage.exports ?? {}), true);
    assert.match(slateReadme, /`\/internal` package subpath is reserved/);
    assert.equal('./internal' in (slateDomPackage.exports ?? {}), true);
    assert.match(slateDomReadme, /`\/internal` package subpath is reserved/);

    assert.equal('.' in (slateBrowserPackage.exports ?? {}), false);
    for (const subpath of [
      './core',
      './browser',
      './playwright',
      './transports',
    ]) {
      assert.equal(subpath in (slateBrowserPackage.exports ?? {}), true);
      assert.match(
        slateBrowserReadme,
        new RegExp(`@platejs/browser/${subpath.slice(2)}`)
      );
    }

    assert.equal('./react' in (slateLayoutPackage.exports ?? {}), true);
    assert.match(slateLayoutReadme, /slate-layout\/react/);
  });

  it('keeps declaration build paths aligned with package export types', () => {
    assert.deepEqual(
      readDtsTsconfig().compilerOptions?.paths ?? {},
      expectedPublicPackageDtsPaths
    );
  });

  it('keeps root workspace links for public package smoke tests exact', () => {
    const rootPackage = readRootPackageJson();

    for (const packageName of expectedRootWorkspacePackageDevDependencies) {
      assert.equal(
        rootPackage.devDependencies?.[packageName],
        'workspace:*',
        `${packageName} should be linked from root package.json`
      );
    }
  });

  it('keeps package README casing singular and deliberate', () => {
    for (const [packageName, expectedReadme] of Object.entries(
      expectedPackageReadmeFiles
    )) {
      const packageEntries = readdirSync(
        resolve(repoRoot, 'packages', packageName)
      );
      const readmeEntries = packageEntries
        .filter((entry) => entry === 'README.md' || entry === 'Readme.md')
        .sort();

      assert.deepEqual(
        readmeEntries,
        [expectedReadme],
        `${packageName} should have exactly one package README with deliberate casing`
      );
    }
  });

  it('keeps public docs and examples on exported package import paths', () => {
    const publicSlateImportSpecifiers = collectPublicSlateImportSpecifiers();
    const unexpectedSpecifiers = [...publicSlateImportSpecifiers.entries()]
      .filter(
        ([specifier]) => !expectedPublicPackageImportSpecifiers.has(specifier)
      )
      .map(
        ([specifier, files]) => `${specifier}: ${files.slice(0, 8).join(', ')}`
      );

    assert.deepEqual(unexpectedSpecifiers, []);
    assert.deepEqual(
      [...publicSlateImportSpecifiers.keys()],
      [
        '@platejs/yjs',
        '@platejs/yjs/react',
        '@platejs/slate',
        '@platejs/browser/playwright',
        '@platejs/slate-dom',
        '@platejs/slate-history',
        '@platejs/slate-hyperscript',
        '@platejs/slate-layout',
        '@platejs/slate-layout/react',
        '@platejs/slate-react',
      ]
    );
  });

  it('keeps package export targets aligned with build entries', () => {
    for (const [packageName, expectedEntries] of Object.entries(
      expectedPublicPackageBuildEntries
    )) {
      const packageJson = readPackageJson(packageName);
      const packageRoot = resolve(
        repoRoot,
        'packages',
        packageDirectoryName(packageName)
      );
      const exportedEntries = Object.fromEntries(
        Object.entries(packageJson.exports ?? {}).map(([subpath, target]) => [
          subpath,
          exportTargetToBuildEntry(target),
        ])
      );
      const expectedExportedEntries = Object.fromEntries(
        Object.keys(packageJson.exports ?? {}).map((subpath) => [
          subpath,
          subpath === '.'
            ? 'index'
            : subpath.slice(2) === 'internal'
              ? 'internal/index'
              : packageName === '@platejs/browser' ||
                  packageName === '@platejs/yjs'
                ? `${subpath.slice(2)}/index`
                : subpath.slice(2),
        ])
      );

      assert.deepEqual(
        exportedEntries,
        expectedExportedEntries,
        `${packageName} export targets should resolve to expected build entries`
      );
      assert.deepEqual(
        expectedEntries,
        Object.fromEntries(
          Object.entries(expectedEntries).sort(([left], [right]) =>
            left.localeCompare(right)
          )
        ),
        `${packageName} expected build entries should stay sorted`
      );

      for (const [entryName, sourcePath] of Object.entries(expectedEntries)) {
        assert.equal(
          readFileSync(resolve(packageRoot, sourcePath), 'utf8').length > 0,
          true,
          `${packageName} build entry ${entryName} source should exist`
        );
      }

      const buildScript = packageJson.scripts?.build;
      if (
        buildScript ===
        'tsdown --config ../../tooling/config/tsdown.config.ts --log-level warn'
      ) {
        assert.deepEqual(
          expectedEntries,
          { index: 'src/index.ts' },
          `${packageName} shared tsdown config should only publish the root entry`
        );
        continue;
      }

      assert.equal(
        buildScript,
        'tsdown --config ./tsdown.config.mts --log-level warn',
        `${packageName} should use a known build script`
      );
      const tsdownConfig = readFileSync(
        resolve(packageRoot, 'tsdown.config.mts'),
        'utf8'
      );

      for (const [entryName, sourcePath] of Object.entries(expectedEntries)) {
        assert.match(
          tsdownConfig,
          new RegExp(
            `${entryName.includes('/') ? `'${escapeRegExp(entryName)}'` : escapeRegExp(entryName)}:\\s*'${escapeRegExp(sourcePath)}'`
          ),
          `${packageName} tsdown config should build ${entryName}`
        );
      }
    }
  });

  it('documents current operation subtypes and check helpers', () => {
    const operationTypes = readFileSync(
      resolve(repoRoot, 'docs/api/operations/README.md'),
      'utf8'
    );
    const operationApi = readFileSync(
      resolve(repoRoot, 'docs/api/operations/operation.md'),
      'utf8'
    );

    for (const snippet of [
      'Replace Children Operations',
      "type: 'replace_children'",
      'rootWasPresent?: boolean',
      'rootIsPresent?: boolean',
      '| ReplaceChildrenOperation',
    ]) {
      assert.equal(operationTypes.includes(snippet), true);
    }

    for (const helper of [
      'isInsertNodeOperation',
      'isInsertTextOperation',
      'isMergeNodeOperation',
      'isMoveNodeOperation',
      'isRemoveNodeOperation',
      'isRemoveTextOperation',
      'isReplaceChildrenOperation',
      'isReplaceFragmentOperation',
      'isSetNodeOperation',
      'isSetSelectionOperation',
      'isSplitNodeOperation',
    ]) {
      assert.match(operationApi, new RegExp(`OperationApi\\.${helper}`));
    }
  });

  it('documents every static API method listed by Slate source interfaces', () => {
    const apiDocs = [
      [
        'Element',
        'packages/slate/src/interfaces/element.ts',
        'docs/api/nodes/element.md',
      ],
      [
        'Node',
        'packages/slate/src/interfaces/node.ts',
        'docs/api/nodes/node.md',
      ],
      [
        'Operation',
        'packages/slate/src/interfaces/operation.ts',
        'docs/api/operations/operation.md',
      ],
      [
        'Path',
        'packages/slate/src/interfaces/path.ts',
        'docs/api/locations/path.md',
      ],
      [
        'Point',
        'packages/slate/src/interfaces/point.ts',
        'docs/api/locations/point.md',
      ],
      [
        'Range',
        'packages/slate/src/interfaces/range.ts',
        'docs/api/locations/range.md',
      ],
      [
        'Text',
        'packages/slate/src/interfaces/text.ts',
        'docs/api/nodes/text.md',
      ],
    ] as const;
    const missingEntries = apiDocs.flatMap(
      ([apiName, sourcePath, docsPath]) => {
        const source = readFileSync(resolve(repoRoot, sourcePath), 'utf8');
        const docs = readFileSync(resolve(repoRoot, docsPath), 'utf8');
        const interfaceMatch = source.match(
          new RegExp(
            `export interface ${apiName}Interface \\{([\\s\\S]*?)\\n\\}`
          )
        );

        assert.ok(
          interfaceMatch,
          `${sourcePath} should export ${apiName}Interface`
        );

        const methods = [
          ...interfaceMatch[1]!.matchAll(
            /^ {2}([a-zA-Z][a-zA-Z0-9_]*)\s*[:(]/gm
          ),
        ].map((match) => match[1]!);

        return methods
          .filter(
            (method) => !new RegExp(`${apiName}Api\\.${method}\\b`).test(docs)
          )
          .map((method) => `${docsPath}: ${apiName}Api.${method}`);
      }
    );

    assert.deepEqual(missingEntries, []);
  });

  it('anchors core package docs in the docs proof map', () => {
    const source = readFileSync(
      resolve(repoRoot, 'docs/general/docs-proof-map.md'),
      'utf8'
    );
    const docsPrefixes = [
      'api/',
      'concepts/',
      'general/',
      'libraries/',
      'migration/',
      'releases/',
      'walkthroughs/',
    ];

    assert.match(source, /Core Slate owns the editor runtime/);
    assert.match(source, /Slate DOM owns DOM bridge helpers/);
    assert.match(source, /React-owned setup uses `useSlateEditor`/);
    assert.match(source, /Public package READMEs describe the latest/);
    assert.match(source, /Public package import paths, export targets/);
    assert.match(source, /strict TypeScript export\/type declaration/);
    assert.match(source, /public-package-import-smoke\.test\.ts/);
    assert.match(source, /public-package-types-smoke\.ts/);
    assert.match(source, /tsconfig\.public-package-types\.json/);
    assert.match(source, /config\/typescript\/tsconfig\.dts\.json/);
    assert.match(source, /Slate React docs and package README route/);
    assert.match(source, /Slate React runtime hooks use root terminology/);
    assert.match(source, /Editable DOM strategy layout is an explicit/);
    assert.match(source, /widget stores are hook-owned/);
    assert.match(source, /Example route proof coverage/);
    assert.match(source, /Example navigation metadata/);
    assert.match(source, /Visual\/native selection screenshots/);

    const unresolvedReferences = [...source.matchAll(/`([^`]+)`/g)].flatMap(
      (match) => {
        const reference = match[1]!;

        if (
          reference.includes('*') ||
          reference.includes(' ') ||
          reference.includes('<') ||
          reference.includes('>') ||
          reference.includes('=') ||
          reference.includes('(') ||
          reference.includes(')') ||
          reference.includes('\\') ||
          reference.startsWith('temp-copy')
        ) {
          return [];
        }
        if (
          !reference.includes('/') &&
          !/\.(?:md|ts|tsx|json)$/.test(reference) &&
          reference !== 'Readme.md' &&
          reference !== 'package.json'
        ) {
          return [];
        }
        if (expectedPublicPackageImportSpecifiers.has(reference)) {
          return [];
        }

        const candidates = [
          ...(docsPrefixes.some((prefix) => reference.startsWith(prefix)) ||
          (/\.md$/.test(reference) && !reference.includes('/'))
            ? [`docs/${reference}`]
            : []),
          reference,
        ];

        return candidates.some((candidate) =>
          existsSync(resolve(repoRoot, candidate))
        )
          ? []
          : [reference];
      }
    );

    assert.deepEqual([...new Set(unresolvedReferences)].sort(), []);
  });

  it('documents transaction transform methods with source-backed options', () => {
    const docs = readFileSync(
      resolve(repoRoot, 'docs/api/transforms.md'),
      'utf8'
    );
    const nodeSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/transforms/node.ts'),
      'utf8'
    );
    const textSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/transforms/text.ts'),
      'utf8'
    );
    const selectionSource = readFileSync(
      resolve(
        repoRoot,
        'packages/slate/src/interfaces/transforms/selection.ts'
      ),
      'utf8'
    );
    const editorSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );
    const publicStateSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/core/public-state.ts'),
      'utf8'
    );
    const methodOptionDocs = [
      {
        heading: '`tx.nodes.insert(nodes: Node | Node[], options?)`',
        options: [
          'at',
          'match',
          'mode',
          'hanging',
          'select',
          'voids',
          'batchDirty',
        ],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.remove(options?)`',
        options: ['at', 'match', 'mode', 'hanging', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.merge(options?)`',
        options: ['at', 'match', 'mode', 'hanging', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.split(options?)`',
        options: [
          'at',
          'match',
          'mode',
          'always',
          'height',
          'position',
          'voids',
        ],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.wrap(element: Element, options?)`',
        options: ['at', 'match', 'mode', 'split', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.unwrap(options?)`',
        options: ['at', 'match', 'mode', 'split', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.set(props: Partial<Node>, options?)`',
        options: [
          'at',
          'match',
          'mode',
          'hanging',
          'split',
          'voids',
          'compare',
          'merge',
        ],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.unset(props: string | string[], options?)`',
        options: ['at', 'match', 'mode', 'hanging', 'split', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.lift(options?)`',
        options: ['at', 'match', 'mode', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.nodes.move(options)`',
        options: ['at', 'match', 'mode', 'to', 'voids'],
        source: nodeSource,
      },
      {
        heading: '`tx.fragment.get(options?)`',
        options: ['at'],
        source: editorSource,
      },
      {
        heading: '`tx.fragment.insert(fragment: Node[], options?)`',
        options: ['at', 'hanging', 'voids', 'batchDirty'],
        source: textSource,
      },
      {
        heading: '`tx.fragment.delete(options?)`',
        options: ['at', 'direction'],
        source: editorSource,
      },
      {
        heading: '`tx.text.insert(text: string, options?)`',
        options: ['at', 'voids'],
        source: textSource,
      },
      {
        heading: '`tx.text.delete(options?)`',
        options: ['at', 'distance', 'unit', 'reverse', 'hanging', 'voids'],
        source: textSource,
      },
      {
        heading: '`tx.text.deleteBackward(options?)`',
        options: ['unit'],
        source: editorSource,
      },
      {
        heading: '`tx.text.deleteForward(options?)`',
        options: ['unit'],
        source: editorSource,
      },
      {
        heading: '`tx.selection.collapse(options?)`',
        options: ['edge'],
        source: selectionSource,
      },
      {
        heading: '`tx.selection.move(options?)`',
        options: ['distance', 'unit', 'reverse', 'edge'],
        source: selectionSource,
      },
      {
        heading: '`tx.selection.setPoint(props: Partial<Point>, options?)`',
        options: ['edge'],
        source: selectionSource,
      },
    ];

    for (const { heading, options, source } of methodOptionDocs) {
      const section = getMarkdownHeadingSection(docs, heading);

      for (const option of options) {
        assert.match(
          source,
          new RegExp(`\\b${escapeRegExp(option)}\\??:`),
          `${heading} option ${option} should be source-backed`
        );
        assert.match(
          section,
          new RegExp(`\`${escapeRegExp(option)}\\??`),
          `${heading} should document option ${option}`
        );
      }
    }

    for (const name of [
      'insert',
      'insertSoft',
      'deleteBackward',
      'deleteForward',
    ]) {
      assert.match(
        publicStateSource,
        new RegExp(`\\b${name}:`),
        `tx.${name} should be runtime-backed`
      );
    }
    assert.match(docs, /#### `tx\.break\.insert\(\)`/);
    assert.match(docs, /#### `tx\.break\.insertSoft\(\)`/);
    assert.doesNotMatch(
      getMarkdownHeadingSection(docs, '`tx.fragment.delete(options?)`'),
      /\b(hanging|voids)\?:/
    );
  });

  it('does not expose a duplicate tx.nodes.insertMany alias', () => {
    const scannedFiles = [
      'packages/slate/src/interfaces/editor.ts',
      'packages/slate/src/core/public-state.ts',
      'packages/slate/src/editor-runtime-view.ts',
      ...publicAuthoringFiles,
      ...publicDocumentationFiles,
    ];
    const aliasLeaks = scannedFiles.flatMap((relativePath) => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      return /\binsertMany\b|\bnodes\.insertMany\b/.test(source)
        ? [relativePath]
        : [];
    });

    assert.deepEqual(aliasLeaks, []);
  });

  it('documents the complete core transaction write groups', () => {
    const docs = readFileSync(
      resolve(repoRoot, 'docs/api/transforms.md'),
      'utf8'
    );
    const conceptDocs = readFileSync(
      resolve(repoRoot, 'docs/concepts/04-transforms.md'),
      'utf8'
    );
    const editorSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );
    const publicStateSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/core/public-state.ts'),
      'utf8'
    );
    const documentedTransactionMethods = [
      ['break', 'insert'],
      ['break', 'insertSoft'],
      ['fragment', 'get'],
      ['fragment', 'delete'],
      ['fragment', 'insert'],
      ['marks', 'get'],
      ['marks', 'add'],
      ['marks', 'remove'],
      ['marks', 'toggle'],
      ['nodes', 'insert'],
      ['nodes', 'lift'],
      ['nodes', 'merge'],
      ['nodes', 'move'],
      ['nodes', 'remove'],
      ['nodes', 'set'],
      ['nodes', 'split'],
      ['nodes', 'unset'],
      ['nodes', 'unwrap'],
      ['nodes', 'wrap'],
      ['operations', 'replay'],
      ['roots', 'create'],
      ['roots', 'delete'],
      ['roots', 'replace'],
      ['selection', 'set'],
      ['selection', 'clear'],
      ['selection', 'collapse'],
      ['selection', 'move'],
      ['selection', 'setPoint'],
      ['selection', 'setRange'],
      ['statePatches', 'replay'],
      ['text', 'insert'],
      ['text', 'delete'],
      ['text', 'deleteBackward'],
      ['text', 'deleteForward'],
      ['value', 'replace'],
    ] as const;

    for (const [group, method] of documentedTransactionMethods) {
      assert.match(
        docs,
        new RegExp(`tx\\.${group}\\.${method}\\b`),
        `docs/api/transforms.md should document tx.${group}.${method}`
      );
      assert.match(
        publicStateSource,
        new RegExp(`\\b${method}:`),
        `tx.${group}.${method} should be backed by public-state transaction source`
      );
    }

    for (const method of ['normalize', 'setField', 'withoutNormalizing']) {
      assert.match(
        docs,
        new RegExp(`tx\\.${method}\\b`),
        `docs/api/transforms.md should document tx.${method}`
      );
      assert.match(
        editorSource,
        new RegExp(`\\b${method}\\b`),
        `tx.${method} should be typed on EditorCoreUpdateTransaction`
      );
      assert.match(
        publicStateSource,
        new RegExp(`\\b${method}\\b`),
        `tx.${method} should be backed by public-state transaction source`
      );
    }

    for (const token of [
      'tx.fragment',
      'tx.break',
      'tx.value',
      'tx.roots',
      'tx.setField',
      'tx.statePatches',
      'tx.normalize',
      'tx.withoutNormalizing',
    ]) {
      assert.match(
        conceptDocs,
        new RegExp(escapeRegExp(token)),
        `docs/concepts/04-transforms.md should name ${token}`
      );
    }
    assert.match(conceptDocs, /\.\.\/api\/transforms\.md/);
  });
});

describe('primary slate package surface', () => {
  const publicEditorMethods = [
    'extend',
    'getApi',
    'read',
    'subscribe',
    'subscribeCommit',
    'update',
  ].sort();
  const requiredSlateRootExports = [
    'createEditor',
    'createEditorRuntime',
    'createEditorView',
    'defineEditorExtension',
    'defineStateField',
    'elementProperty',
    'isEditor',
    'ElementApi',
    'LocationApi',
    'NodeApi',
    'OperationApi',
    'PathApi',
    'PathRefApi',
    'PointApi',
    'PointRefApi',
    'RangeApi',
    'RangeRefApi',
    'SpanApi',
    'TextApi',
    'setDebugValueScrubber',
  ];
  const bannedSlateRootDataHelperValues = [
    'Element',
    'Location',
    'Node',
    'Operation',
    'Path',
    'PathRef',
    'Point',
    'PointRef',
    'Range',
    'RangeRef',
    'Scrubber',
    'Span',
    'Text',
  ];
  const bannedSlateRootHelperExports = [
    'above',
    'addMark',
    'after',
    'apply',
    'before',
    'bookmark',
    'collapse',
    'defineCommand',
    'deleteBackward',
    'deleteForward',
    'deleteFragment',
    'deselect',
    'elementReadOnly',
    'executeCommand',
    'getDirtyPaths',
    'getEditorRuntime',
    'getExtensionRegistry',
    'getFragment',
    'getLastCommit',
    'getOperations',
    'getPathByRuntimeId',
    'getRuntimeId',
    'getSelection',
    'getSnapshot',
    'insertBreak',
    'insertFragment',
    'insertNode',
    'insertNodes',
    'insertSoftBreak',
    'insertText',
    'isNormalizing',
    'liftNodes',
    'mergeNodes',
    'move',
    'moveNodes',
    'normalizeNode',
    'pathRef',
    'pathRefs',
    'pointRef',
    'pointRefs',
    'rangeRef',
    'rangeRefs',
    'ScrubberApi',
    'registerCommand',
    'removeMark',
    'removeNodes',
    'replace',
    'select',
    'setNodes',
    'setNormalizing',
    'setSelection',
    'shouldMergeNodesRemovePrevNode',
    'shouldNormalize',
    'splitNodes',
    'unsetNodes',
    'unwrapNodes',
    'withoutNormalizing',
    'wrapNodes',
  ];
  const bannedEditorInstanceSurface = [
    'above',
    'after',
    'before',
    'edges',
    'elementReadOnly',
    'first',
    'fragment',
    'getChildren',
    'getDirtyPaths',
    'getFragment',
    'getLastCommit',
    'getOperationDirtiness',
    'getOperations',
    'getPathByRuntimeId',
    'getRuntimeId',
    'getSelection',
    'getSnapshot',
    'hasBlocks',
    'hasInlines',
    'hasPath',
    'hasTexts',
    'isBlock',
    'isEdge',
    'isEmpty',
    'isEnd',
    'isNormalizing',
    'isStart',
    'last',
    'leaf',
    'levels',
    'next',
    'normalizeNode',
    'parent',
    'path',
    'pathRef',
    'pathRefs',
    'point',
    'pointRef',
    'pointRefs',
    'positions',
    'previous',
    'projectRange',
    'range',
    'rangeRef',
    'rangeRefs',
    'schema',
    'shouldMergeNodesRemovePrevNode',
    'shouldNormalize',
    'string',
    'unhangRange',
    'void',
  ];

  it('keeps the intended small public root', () => {
    const missing = requiredSlateRootExports.filter((key) => !(key in Slate));
    const unexpected = Object.keys(Slate)
      .filter((key) => !requiredSlateRootExports.includes(key))
      .sort();

    assert.deepEqual(missing, []);
    assert.deepEqual(unexpected, []);
    assert.equal(typeof Slate.createEditor, 'function');
    assert.equal(typeof Slate.createEditorRuntime, 'function');
    assert.equal(typeof Slate.createEditorView, 'function');
    assert.equal(typeof Slate.defineEditorExtension, 'function');
    assert.equal(typeof Slate.defineStateField, 'function');
    assert.equal(typeof Slate.elementProperty.boolean, 'function');
    assert.equal(typeof Slate.isEditor, 'function');
    assert.equal(typeof Slate.setDebugValueScrubber, 'function');
  });

  it('keeps explicit public root exports documented in source', () => {
    const sourceRoot = resolve(repoRoot, 'packages/slate/src');
    const indexSource = readFileSync(join(sourceRoot, 'index.ts'), 'utf8');
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const sourcePath = resolve(sourceRoot, `${sourceSpecifier}.ts`);
      const source = readFileSync(sourcePath, 'utf8');

      for (const rawName of rawNames.split(',')) {
        const name = rawName
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          ?.trim();

        if (!name) {
          continue;
        }

        const isType = rawName.trim().startsWith('type ');
        const declaration = new RegExp(
          isType
            ? `export\\s+(?:interface|type)\\s+${name}\\b`
            : `export\\s+(?:const|function|class)\\s+${name}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          missing.push(`${name}: missing public declaration`);
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${name}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    assert.deepEqual(missing, []);
  });

  it('does not export raw editor, core, or transform helper functions from the primary package', () => {
    const leaked = bannedSlateRootHelperExports.filter((key) => key in Slate);

    assert.deepEqual(leaked, []);
  });

  it('does not export bare data helper values from the primary package', () => {
    const leaked = bannedSlateRootDataHelperValues.filter(
      (key) => key in Slate
    );

    assert.deepEqual(leaked, []);
  });

  it('does not wildcard-export the internal editor type table from the primary package', () => {
    const rootSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/index.ts'),
      'utf8'
    );

    assert.equal(rootSource.includes("export * from './interfaces'"), false);
    assert.equal(rootSource.includes('EditorStaticApi'), false);
    assert.equal(rootSource.includes('InternalEditorStaticApi'), false);
    assert.equal(rootSource.includes('EditorElementReadOnlyOptions'), false);
  });

  it('exports public update callback types from the primary package', () => {
    const rootSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/index.ts'),
      'utf8'
    );

    assert.match(rootSource, /\bEditorUpdateContext\b/);
    assert.match(rootSource, /\bEditorUpdateTransaction\b/);
  });

  it('does not export the editor-state static namespace as a value', () => {
    assert.equal('Editor' in Slate, false);
  });

  it('does not export the legacy transform namespaces', () => {
    assert.equal('Transforms' in Slate, false);
    assert.equal('GeneralTransforms' in Slate, false);
    assert.equal('NodeTransforms' in Slate, false);
    assert.equal('SelectionTransforms' in Slate, false);
    assert.equal('TextTransforms' in Slate, false);
  });

  it('does not export the internal transform registry', () => {
    assert.equal('getEditorTransformRegistry' in Slate, false);
    assert.equal('setEditorTransformRegistry' in Slate, false);
  });

  it('does not export internal command registry helpers', () => {
    assert.equal('defineCommand' in Slate, false);
    assert.equal('registerCommand' in Slate, false);
    assert.equal('executeCommand' in Slate, false);
  });

  it('does not export duplicate commit/change aliases', () => {
    assert.equal('SnapshotChange' in Slate, false);
    assert.equal('SnapshotChangeClass' in Slate, false);
    assert.equal('OperationClass' in Slate, false);
    assert.equal('CommitListener' in Slate, false);
    assert.equal('EditorApplyOperationsOptions' in Slate, false);
    assert.equal('EditorCommandResult' in Slate, false);
    assert.equal('EditorCommit' in Slate, false);
    assert.equal('EditorCommitClass' in Slate, false);

    const indexSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/index.ts'),
      'utf8'
    );
    const editorSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );

    assert.doesNotMatch(indexSource, /\bSnapshotChange\b/);
    assert.doesNotMatch(indexSource, /\bSnapshotChangeClass\b/);
    assert.doesNotMatch(indexSource, /\bOperationClass\b/);
    assert.doesNotMatch(indexSource, /\bCommitListener\b/);
    assert.doesNotMatch(indexSource, /\bEditorApplyOperationsOptions\b/);
    assert.doesNotMatch(indexSource, /\bEditorCommandResult\b/);
    assert.doesNotMatch(editorSource, /type SnapshotChange\b/);
    assert.doesNotMatch(editorSource, /type OperationClass\b/);
    assert.doesNotMatch(editorSource, /type CommitListener\b/);
    assert.doesNotMatch(editorSource, /type EditorApplyOperationsOptions\b/);
    assert.doesNotMatch(editorSource, /type EditorCommandResult\b/);
    assert.match(indexSource, /\bEditorCommit\b/);
    assert.match(indexSource, /\bEditorCommitClass\b/);
  });

  it('keeps remaining pure type aliases explicitly classified', () => {
    const allowedPureAliases = new Set([
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryGraphModel',
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryGraphNodeInput',
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryOwner',
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryPoint',
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryRangeEndpoint',
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryRangeSegment',
      'packages/slate-react/src/view-boundary-graph.ts:SlateViewBoundaryRangeSegments',
      'packages/slate/src/interfaces/editor.ts:EditorExtensionApiMap',
      'packages/slate/src/interfaces/editor.ts:RootKey',
      'packages/slate/src/interfaces/editor.ts:RuntimeId',
      'packages/slate/src/interfaces/editor.ts:Selection',
      'packages/slate/src/interfaces/node.ts:AncestorEntryOf',
      'packages/slate/src/interfaces/node.ts:AncestorIn',
      'packages/slate/src/interfaces/element.ts:Element',
      'packages/slate/src/interfaces/element.ts:ElementIn',
      'packages/slate/src/interfaces/node.ts:DescendantEntryIn',
      'packages/slate/src/interfaces/node.ts:DescendantEntryOf',
      'packages/slate/src/interfaces/node.ts:DescendantIn',
      'packages/slate/src/interfaces/node.ts:ElementEntryOf',
      'packages/slate/src/interfaces/node.ts:NodeEntryIn',
      'packages/slate/src/interfaces/node.ts:NodeEntryOf',
      'packages/slate/src/interfaces/node.ts:TextEntryIn',
      'packages/slate/src/interfaces/node.ts:TextEntryOf',
      'packages/slate/src/interfaces/operation.ts:InsertTextOperation',
      'packages/slate/src/interfaces/operation.ts:MoveNodeOperation',
      'packages/slate/src/interfaces/operation.ts:RemoveTextOperation',
      'packages/slate/src/interfaces/operation.ts:SelectionOperation',
      'packages/slate/src/interfaces/operation.ts:SetSelectionOperation',
      'packages/slate/src/interfaces/point.ts:Point',
      'packages/slate/src/interfaces/range.ts:Range',
      'packages/slate/src/interfaces/text.ts:BooleanMarkKeysOf',
      'packages/slate/src/interfaces/text.ts:MarksIn',
      'packages/slate/src/interfaces/text.ts:MarksOf',
      'packages/slate/src/interfaces/text.ts:Text',
      'packages/slate/src/interfaces/text.ts:TextIn',
      'packages/slate/src/internal/range-text-marks.ts:TextMarks',
      'packages/slate/src/transforms-selection/set-selection.ts:SetSelectionCommand',
    ]);
    const aliasPattern =
      /^export type ([A-Za-z][A-Za-z0-9_]*)(?:<[^=]+>)? = (?:[A-Za-z][A-Za-z0-9_]*(?:<[^/\n]+>)?|string|boolean|Record<[^/\n]+>|Pick<[^/\n]+>|Extract<[^/\n]+>)$/gm;
    const foundAliases = [
      ...collectFiles(resolve(repoRoot, 'packages/slate/src'), /\.(ts|tsx)$/),
      ...collectFiles(resolve(repoRoot, 'packages/browser/src'), /\.(ts|tsx)$/),
      ...collectFiles(
        resolve(repoRoot, 'packages/slate-dom/src'),
        /\.(ts|tsx)$/
      ),
      ...collectFiles(
        resolve(repoRoot, 'packages/slate-history/src'),
        /\.(ts|tsx)$/
      ),
      ...collectFiles(
        resolve(repoRoot, 'packages/slate-hyperscript/src'),
        /\.(ts|tsx)$/
      ),
      ...collectFiles(
        resolve(repoRoot, 'packages/slate-layout/src'),
        /\.(ts|tsx)$/
      ),
      ...collectFiles(
        resolve(repoRoot, 'packages/slate-react/src'),
        /\.(ts|tsx)$/
      ),
    ].flatMap((relativePath) => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      return [...source.matchAll(aliasPattern)].map(
        (match) => `${relativePath}:${match[1]}`
      );
    });

    assert.deepEqual(
      foundAliases.filter((alias) => !allowedPureAliases.has(alias)).sort(),
      []
    );
  });

  it('keeps command middleware returns strict boolean', () => {
    const sourceFiles = ['packages/slate/src/core/command-registry.ts'];
    const failures = sourceFiles.flatMap((relativePath) => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      return [/\bvoid\s*\|\s*boolean\b/]
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relativePath}: ${pattern}`);
    });

    assert.deepEqual(failures, []);
  });

  it('keeps command middleware off the public static editor API type', () => {
    const editorSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );
    const staticApiStart = editorSource.indexOf(
      'export interface EditorStaticApi'
    );
    const staticApiEnd = editorSource.indexOf(
      '\nexport interface InternalEditorStaticApi',
      staticApiStart
    );
    const staticApiSource = editorSource.slice(staticApiStart, staticApiEnd);

    assert.equal(staticApiSource.includes('defineCommand'), false);
    assert.equal(staticApiSource.includes('registerCommand'), false);
  });

  it('does not expose document replacement helpers on editor instances', () => {
    const editor = Slate.createEditor();

    assert.equal('replace' in editor, false);
    assert.equal('reset' in editor, false);
    assert.equal((editor as Record<string, unknown>).replace, undefined);
    assert.equal((editor as Record<string, unknown>).reset, undefined);
  });

  it('keeps the public editor instance surface small', () => {
    const editor = Slate.createEditor();
    const publicMethods = Object.entries(editor)
      .filter(([, value]) => typeof value === 'function')
      .map(([key]) => key)
      .sort();

    assert.deepEqual(publicMethods, publicEditorMethods);
  });

  it('does not expose direct read/query/schema/ref aliases on editor instances', () => {
    const editor = Slate.createEditor();
    const leaked = bannedEditorInstanceSurface.filter((key) => key in editor);

    assert.deepEqual(leaked, []);
  });

  it('does not keep the public EditorInterface or static value in source', () => {
    const editorInterfaceSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );

    assert.equal(
      /\bexport\s+interface\s+EditorInterface\b/.test(editorInterfaceSource),
      false
    );
    assert.equal(
      /\bexport\s+const\s+Editor\b/.test(editorInterfaceSource),
      false
    );
  });

  it('does not type public BaseEditor through the internal static Editor table', () => {
    const editorInterfaceSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/interfaces/editor.ts'),
      'utf8'
    );
    const baseEditorSource = editorInterfaceSource.slice(
      editorInterfaceSource.indexOf('export interface BaseEditor'),
      editorInterfaceSource.indexOf('export interface EditorTransformApi')
    );

    assert.equal(/OmitFirstArg<typeof Editor\./.test(baseEditorSource), false);
  });

  it('keeps the private createEditor runtime split into typed owner groups', () => {
    const createEditorSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/create-editor.ts'),
      'utf8'
    );
    const editorRuntimeSource = readFileSync(
      resolve(repoRoot, 'packages/slate/src/core/editor-runtime.ts'),
      'utf8'
    );

    assert.equal(
      /\bconst\s+runtime\s*:\s*any\b/.test(createEditorSource),
      false
    );
    assert.equal(/Record<string,\s*any>/.test(editorRuntimeSource), false);
    assert.deepEqual(
      [
        'extensionRuntime',
        'queryRuntime',
        'refRuntime',
        'snapshotRuntime',
        'transactionRuntime',
        'transformRuntime',
      ].filter((name) => !createEditorSource.includes(`const ${name}`)),
      []
    );
  });
});

describe('primary public documentation surface', () => {
  for (const relativePath of publicDocumentationFiles) {
    it(`${relativePath} does not teach stale React or void APIs`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const failures = bannedPublicDocumentationSurface
        .filter(({ pattern }) => pattern.test(source))
        .map(({ pattern, reason }) => `${pattern}: ${reason}`);

      assert.deepEqual(failures, []);
    });
  }
});

describe('primary public snapshot and range surface', () => {
  for (const relativePath of [
    ...publicDocumentationFiles,
    ...primaryExampleFiles,
  ]) {
    it(`${relativePath} keeps snapshots and durable ranges on the public state API`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const failures = bannedPublicSnapshotAndRangeSurface
        .filter(({ pattern }) => pattern.test(source))
        .map(({ pattern, reason }) => `${pattern}: ${reason}`);

      assert.deepEqual(failures, []);
    });
  }
});

describe('primary extension examples', () => {
  for (const relativePath of extensionExampleFiles) {
    it(`${relativePath} does not teach flat extension methods`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');

      assert.equal(/\bmethods\s*[:(]/.test(source), false);
    });
  }
});

describe('primary public write surface', () => {
  for (const relativePath of publicAuthoringFiles) {
    it(`${relativePath} teaches tx writes instead of primitive editor writes`, () => {
      const source = readFileSync(resolve(repoRoot, relativePath), 'utf8');
      const matches = Array.from(
        source.matchAll(primitiveWriteTeachingPattern)
      ).map((match) => match[0]);

      if (
        matches.length > 0 &&
        classifiedPrimitiveWriteFiles.has(relativePath)
      ) {
        assert.match(classifiedPrimitiveWriteFiles.get(relativePath)!, /\S/);
        return;
      }

      assert.deepEqual(matches, []);
    });
  }
});
