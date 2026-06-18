import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { act, render } from '@testing-library/react';
import { type ComponentProps, useEffect } from 'react';
import * as SlateReact from '../src';
import {
  createReactEditor,
  Editable,
  type EditableProps,
  type RenderElementProps,
  type RenderVoidProps,
  Slate,
  type SlateChange,
  useElementSelected,
} from '../src';
import type { ReactRuntimeEditor } from '../src/plugin/react-editor';

const cwd = process.cwd();
const packageRoot = cwd.endsWith(`${sep}packages${sep}slate-react`)
  ? cwd
  : resolve(cwd, 'packages/slate-react');
const repoRoot = resolve(packageRoot, '../..');
const sourceFilePattern = /\.(md|ts|tsx)$/;
const packageDirectoryByName = new Map([
  ['@platejs/slate', 'slate'],
  ['@platejs/slate-dom', 'slate-dom'],
  ['@platejs/slate-react', 'slate-react'],
]);

const readRepoFileIfExists = (file: string) => {
  const absolutePath = resolve(repoRoot, file);

  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : null;
};

const allRepoFilesExist = (files: readonly string[]) =>
  files.every((file) => existsSync(resolve(repoRoot, file)));

type ExpectFalse<T extends false> = T;
type ExpectTrue<T extends true> = T;
type RenderElementHasPath = 'path' extends keyof RenderElementProps
  ? true
  : false;
type RenderElementHasIndex = 'index' extends keyof RenderElementProps
  ? true
  : false;
type RenderVoidHasPath = 'path' extends keyof RenderVoidProps ? true : false;

type RenderElementDoesNotExposePath = ExpectFalse<RenderElementHasPath>;
type RenderElementDoesNotExposeIndex = ExpectFalse<RenderElementHasIndex>;
type RenderVoidDoesNotExposePath = ExpectFalse<RenderVoidHasPath>;
type EditableDOMBeforeInputProps = ComponentProps<
  typeof Editable
>['onDOMBeforeInput'];
type EditableHasDOMStrategy = 'domStrategy' extends keyof EditableProps
  ? true
  : false;
type EditableHasDOMStrategyLayout =
  'domStrategyLayout' extends keyof EditableProps ? true : false;
type EditableHasLayout = 'layout' extends keyof EditableProps ? true : false;
type EditableHasRenderingStrategy =
  'renderingStrategy' extends keyof EditableProps ? true : false;
type EditableHasOnDOMStrategyMetrics =
  'onDOMStrategyMetrics' extends keyof EditableProps ? true : false;
type EditableHasOnRenderingStrategyMetrics =
  'onRenderingStrategyMetrics' extends keyof EditableProps ? true : false;
type EditableHasOnCommand = 'onCommand' extends keyof ComponentProps<
  typeof Editable
>
  ? true
  : false;
type SlateHasWidgetStore = 'widgetStore' extends keyof ComponentProps<
  typeof Slate
>
  ? true
  : false;
type SlateChangeHasCommit = 'commit' extends keyof SlateChange ? true : false;
type SlateChangeHasSnapshot = 'snapshot' extends keyof SlateChange
  ? true
  : false;
type SlateChangeHasValueChanged = 'valueChanged' extends keyof SlateChange
  ? true
  : false;
type SlateChangeHasUpdate = 'update' extends keyof SlateChange ? true : false;
type EditableAutoCompleteAcceptsBoolean =
  boolean extends NonNullable<EditableProps['autoComplete']> ? true : false;
type EditableExposesDOMStrategy = ExpectTrue<EditableHasDOMStrategy>;
type EditableExposesDOMStrategyLayout =
  ExpectTrue<EditableHasDOMStrategyLayout>;
type EditableDoesNotExposeLayout = ExpectFalse<EditableHasLayout>;
type EditableDoesNotExposeRenderingStrategy =
  ExpectFalse<EditableHasRenderingStrategy>;
type EditableExposesOnDOMStrategyMetrics =
  ExpectTrue<EditableHasOnDOMStrategyMetrics>;
type EditableDoesNotExposeOnRenderingStrategyMetrics =
  ExpectFalse<EditableHasOnRenderingStrategyMetrics>;
type EditableDoesNotExposeOnCommand = ExpectFalse<EditableHasOnCommand>;
type SlateDoesNotExposeWidgetStore = ExpectFalse<SlateHasWidgetStore>;
type SlateChangeExposesCommit = ExpectTrue<SlateChangeHasCommit>;
type SlateChangeExposesSnapshot = ExpectTrue<SlateChangeHasSnapshot>;
type SlateChangeExposesValueChanged = ExpectTrue<SlateChangeHasValueChanged>;
type SlateChangeDoesNotExposeUpdate = ExpectFalse<SlateChangeHasUpdate>;
type EditableRejectsBooleanAutoComplete =
  ExpectFalse<EditableAutoCompleteAcceptsBoolean>;

void (null as unknown as RenderElementDoesNotExposePath);
void (null as unknown as RenderElementDoesNotExposeIndex);
void (null as unknown as RenderVoidDoesNotExposePath);
void (null as unknown as EditableDOMBeforeInputProps);
void (null as unknown as EditableExposesDOMStrategy);
void (null as unknown as EditableExposesDOMStrategyLayout);
void (null as unknown as EditableDoesNotExposeLayout);
void (null as unknown as EditableDoesNotExposeRenderingStrategy);
void (null as unknown as EditableExposesOnDOMStrategyMetrics);
void (null as unknown as EditableDoesNotExposeOnRenderingStrategyMetrics);
void (null as unknown as EditableDoesNotExposeOnCommand);
void (null as unknown as SlateDoesNotExposeWidgetStore);
void (null as unknown as SlateChangeExposesCommit);
void (null as unknown as SlateChangeExposesSnapshot);
void (null as unknown as SlateChangeExposesValueChanged);
void (null as unknown as SlateChangeDoesNotExposeUpdate);
void (null as unknown as EditableRejectsBooleanAutoComplete);

const listSourceFiles = (roots: readonly string[]) => {
  const files: string[] = [];

  const visit = (absolutePath: string) => {
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      for (const child of readdirSync(absolutePath)) {
        visit(join(absolutePath, child));
      }
      return;
    }

    if (sourceFilePattern.test(absolutePath)) {
      files.push(absolutePath);
    }
  };

  for (const root of roots) {
    const absoluteRoot = resolve(repoRoot, root);

    if (existsSync(absoluteRoot)) {
      visit(absoluteRoot);
    }
  }

  return files;
};

const readPackageJson = (packageName: string) =>
  JSON.parse(
    readFileSync(
      resolve(
        repoRoot,
        'packages',
        packageDirectoryByName.get(packageName) ?? packageName,
        'package.json'
      ),
      'utf8'
    )
  ) as {
    peerDependencies?: Record<string, string>;
    version: string;
  };

const expectedRuntimePeerRange = (packageName: string) => {
  const packageJson = readPackageJson(packageName);

  return `>=${packageJson.version}`;
};

const allowedSlateInternalImportFiles = new Set([
  'packages/slate-react/src/editable/runtime-editor-api.ts',
  'packages/slate-react/src/editable/runtime-live-state.ts',
  'packages/slate-react/src/editable/runtime-mutation-state.ts',
  'packages/slate-react/src/editable/runtime-selection-state.ts',
]);

const expectedSlateReactRuntimeRootExports = [
  'Editable',
  'EditableElement',
  'Slate',
  'SlateElement',
  'SlateLeaf',
  'SlatePlaceholder',
  'SlateRuntime',
  'SlateText',
  'createReactEditor',
  'defaultScrollSelectionIntoView',
  'react',
  'useDOMStrategyVirtualOffset',
  'useDecorationSelector',
  'useEditor',
  'useEditorComposing',
  'useEditorFocused',
  'useEditorReadOnly',
  'useEditorSelection',
  'useEditorSelector',
  'useEditorState',
  'useElement',
  'useElementPath',
  'useElementSelected',
  'useNodeSelector',
  'useSetStateField',
  'useSlateActiveEditor',
  'useSlateActiveRoot',
  'useSlateAnnotation',
  'useSlateAnnotationStore',
  'useSlateAnnotations',
  'useSlateChildRoot',
  'useSlateCommandCallback',
  'useSlateContentRoot',
  'useSlateDecorationSource',
  'useSlateEditor',
  'useSlateHistory',
  'useSlateNodeRef',
  'useSlateProjectionEntries',
  'useSlateRangeDecorationSource',
  'useSlateRootChrome',
  'useSlateRootEditor',
  'useSlateRootEffect',
  'useSlateRootState',
  'useSlateRuntime',
  'useSlateRuntimeState',
  'useSlateWidget',
  'useSlateWidgetStore',
  'useSlateWidgets',
  'useStateFieldValue',
  'useTextSelector',
];

const documentedAsGroupedRootTypeExports = [
  'CreateReactEditorOptions',
  'DOMStrategyType',
  'DOMTextSyncOptions',
  'EditableDecorate',
  'EditableDOMBeforeInputHandler',
  'EditableDOMCoverageBoundaryMaterializePayload',
  'EditableDOMCoverageBoundaryPlaceholderContext',
  'EditableDOMCoverageBoundaryProps',
  'EditableDOMCoverageBoundaryScope',
  'EditableDOMStrategyCohort',
  'EditableDOMStrategyDegradationMode',
  'EditableDOMStrategyEffectiveType',
  'EditableDOMStrategyMetricsBase',
  'EditableHandlerResult',
  'EditableInputEventContext',
  'EditableKeyDownContext',
  'EditorDecorationSelectorContext',
  'EditorDecorationSelectorOptions',
  'EditorNodeSelectorContext',
  'EditorRuntimeSelectorOptions',
  'EditorSelectorOptions',
  'EditorStateSelectorOptions',
  'EditorTextSelectorContext',
  'ReactApi',
  'ReactEditorOptions',
  'SlateAnnotationProjectionData',
  'SlateAnnotationRefreshOptions',
  'SlateAnnotationStoreMetrics',
  'SlateAnnotationStoreProjector',
  'SlateCommandFocusPolicy',
  'SlateCustomSourceDirtiness',
  'SlateDecoration',
  'SlateDecorationSourceOptions',
  'SlateDecorationSourceReadContext',
  'SlateHistoryFocusPolicy',
  'SlateProjection',
  'SlateProjectionRefreshListener',
  'SlateProjectionRefreshResult',
  'SlateProjectionSlice',
  'SlateProjectionSource',
  'SlateProjectionStore',
  'SlateProjectionStoreMetrics',
  'SlateProjectionStoreOptions',
  'SlateProjectionStoreRefreshOptions',
  'SlateRangeDecoration',
  'SlateRangeProjection',
  'SlateRuntimeProps',
  'SlateRuntimeStateSelectorOptions',
  'SlateSourceDirtinessClass',
  'SlateSourceDirtinessContext',
  'SlateWidgetStoreMetrics',
  'SlateWidgetStoreProjector',
  'StateFieldSetter',
  'UseElementSelectedMode',
  'UseSlateCommandCallbackOptions',
  'UseSlateContentRootOptions',
  'UseSlateDecorationSourceOptions',
  'UseSlateEditorOptions',
  'UseSlateHistoryOptions',
  'UseSlateRangeDecorationSourceOptions',
  'UseSlateRootChromeOptions',
  'UseSlateRootEditorOptions',
  'UseSlateRootEffectOptions',
  'UseSlateRuntimeOptions',
  'UseStateFieldValueOptions',
] as const;

type SurfaceInventory = Record<
  string,
  {
    count: number;
    next: 'burn-down' | 'public-hook' | 'root-source' | 'runtime-wrapper';
    owner: string;
    rationale: string;
  }
>;

const expectSurfaceInventory = (
  pattern: RegExp,
  roots: readonly string[],
  inventory: SurfaceInventory
) => {
  const actual = Object.fromEntries(
    listSourceFiles(roots)
      .map((absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf8');
        const matches = contents.match(pattern);

        return [
          relative(repoRoot, absolutePath),
          matches ? matches.length : 0,
        ] as const;
      })
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b))
  );

  expect(actual).toEqual(
    Object.fromEntries(
      Object.entries(inventory).map(([file, entry]) => [file, entry.count])
    )
  );
  expect(
    Object.values(inventory).every(
      (entry) =>
        entry.owner.length > 0 &&
        entry.rationale.length > 0 &&
        entry.next.length > 0
    )
  ).toBe(true);
};

const getRootTypeExports = () => {
  const packageIndex = readFileSync(
    resolve(packageRoot, 'src/index.ts'),
    'utf8'
  );
  const typeExports = new Set<string>();
  const exportBlockPattern = /export\s*(type)?\s*\{([\s\S]*?)\}\s*from/g;

  for (const match of packageIndex.matchAll(exportBlockPattern)) {
    const isTypeBlock = match[1] === 'type';
    const members = match[2] ?? '';

    for (const rawMember of members.split(',')) {
      let member = rawMember.trim();

      if (!member) continue;
      if (!isTypeBlock && !member.startsWith('type ')) continue;

      member = member.replace(/^type\s+/, '').trim();
      typeExports.add(
        member
          .split(/\s+as\s+/)
          .at(-1)!
          .trim()
      );
    }
  }

  return [...typeExports].sort((left, right) => left.localeCompare(right));
};

describe('slate-react surface contract', () => {
  test('public root runtime values stay exact', () => {
    expect(Object.keys(SlateReact).sort()).toEqual(
      expectedSlateReactRuntimeRootExports
    );
  });

  test('Editable exposes native beforeinput context without public command handlers', () => {
    const editor = createReactEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'test' }] }],
    });
    let beforeInputContext:
      | Parameters<NonNullable<EditableDOMBeforeInputProps>>[1]
      | null = null;

    render(
      <Slate editor={editor}>
        <Editable
          onDOMBeforeInput={(event, context) => {
            event.preventDefault();
            beforeInputContext = context;
            context.editor.update(() => {});
            return true;
          }}
        />
      </Slate>
    );

    expect(beforeInputContext).toBe(null);
  });

  test('synced text render policy stays out of the public selector surface', () => {
    const publicRoots = [
      'docs/api',
      'docs/concepts',
      'docs/libraries',
      'docs/walkthroughs',
      'packages/slate-react/src',
      'site/examples/ts',
    ];
    const stalePublicOptionViolations = listSourceFiles(publicRoots).flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf8');

        return contents.includes('skipSyncedTextOperations')
          ? [relative(repoRoot, absolutePath)]
          : [];
      }
    );
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );

    expect(stalePublicOptionViolations).toEqual([]);
    expect(packageIndex).not.toMatch(/useMounted(?:Node|Text)RenderSelector/);
  });

  test('core live reads stay behind slate-react runtime facade modules', () => {
    const violations = listSourceFiles(['packages/slate-react/src']).flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf8');
        const relativePath = relative(repoRoot, absolutePath);

        return contents.includes("from '@platejs/slate/internal'") &&
          !allowedSlateInternalImportFiles.has(relativePath)
          ? [relativePath]
          : [];
      }
    );

    expect(violations).toEqual([]);
  });

  test('projection store uses the source snapshot when projecting ranges', () => {
    const contents = readFileSync(
      resolve(repoRoot, 'packages/slate-react/src/projection-store.ts'),
      'utf8'
    );

    expect(contents).toMatch(/projectRangeInSnapshot\(snapshot,/);
    expect(contents).not.toMatch(/Editor\.projectRange/);
  });

  test('root runtime-id selector can reuse cached full-root replace indexes', () => {
    const contents = readFileSync(
      resolve(
        repoRoot,
        'packages/slate-react/src/editable/root-selector-sources.ts'
      ),
      'utf8'
    );

    expect(contents).toMatch(/getCachedFullRootReplaceTopLevelRuntimeIds/);
    expect(contents).toMatch(
      /selectRootRuntimeIds\(editor, root, operations\)/
    );
    expect(contents).toMatch(/useEditorSelector\(\s*selector,/);
  });

  test('runtime package-private imports pin peer floors to sibling runtime packages', () => {
    const slateReactPackage = readPackageJson('@platejs/slate-react');
    const runtimeSources = [
      'packages/slate-react/src/editable/runtime-editor-api.ts',
      'packages/slate-react/src/editable/runtime-repair-engine.ts',
      'packages/slate-react/src/hooks/use-slate-runtime.tsx',
    ]
      .map((file) => readFileSync(resolve(repoRoot, file), 'utf8'))
      .join('\n');

    expect(runtimeSources).toContain("from '@platejs/slate/internal'");
    expect(runtimeSources).toContain("from '@platejs/slate-dom/internal'");
    expect(runtimeSources).toContain("from '@platejs/slate'");
    expect(slateReactPackage.peerDependencies?.['@platejs/slate']).toBe(
      expectedRuntimePeerRange('@platejs/slate')
    );
    expect(slateReactPackage.peerDependencies?.['@platejs/slate-dom']).toBe(
      expectedRuntimePeerRange('@platejs/slate-dom')
    );
  });

  test('runtime lodash subpath imports stay resolvable from built ESM', () => {
    const runtimeSelectionEngine = readFileSync(
      resolve(packageRoot, 'src/editable/runtime-selection-engine.ts'),
      'utf8'
    );

    expect(runtimeSelectionEngine).toContain("from 'lodash/debounce.js'");
    expect(runtimeSelectionEngine).toContain("from 'lodash/throttle.js'");
    expect(runtimeSelectionEngine).not.toMatch(
      /from 'lodash\/(?:debounce|throttle)'/
    );
  });

  test('generic selector substrate uses React external-store subscription primitive', () => {
    const contents = readFileSync(
      resolve(
        repoRoot,
        'packages/slate-react/src/hooks/use-generic-selector.tsx'
      ),
      'utf8'
    );

    expect(contents).toMatch(/\buseSyncExternalStore\b/);
    expect(contents).not.toMatch(/\buseReducer\b/);
  });

  test('generic slate selectors have an explicit ownership inventory', () => {
    expectSurfaceInventory(
      /\buseEditorSelector\(/g,
      ['packages/slate-react/src'],
      {
        'packages/slate-react/src/editable/root-selector-sources.ts': {
          count: 6,
          next: 'root-source',
          owner: 'Editable root selector sources',
          rationale:
            'Top-level runtime ids, root document epoch, selected top-level index, selection paths, placeholder visibility, and the editable root commit wakeup are owned by named root source selectors.',
        },
        'packages/slate-react/src/hooks/use-node-selector.tsx': {
          count: 1,
          next: 'runtime-wrapper',
          owner: 'Runtime node selector wrapper',
          rationale:
            'Public node/text selectors intentionally delegate through one model-truth selector wrapper.',
        },
        'packages/slate-react/src/hooks/use-element-selected.ts': {
          count: 1,
          next: 'public-hook',
          owner: 'Public selected hook',
          rationale:
            'The hook exposes selection state to app code through the public selector contract.',
        },
        'packages/slate-react/src/hooks/use-element-path.ts': {
          count: 1,
          next: 'public-hook',
          owner: 'Public element path hook',
          rationale:
            'The hook exposes path state to app code without adding path back to render props.',
        },
        'packages/slate-react/src/hooks/use-editor-selection.tsx': {
          count: 1,
          next: 'public-hook',
          owner: 'Public selection hook',
          rationale:
            'The hook exposes editor selection through the public selector contract.',
        },
        'packages/slate-react/src/dom-strategy/segment-placeholder.tsx': {
          count: 1,
          next: 'dom-strategy-preview',
          owner: 'DOM strategy partial-DOM placeholder',
          rationale:
            'Partial-DOM segment placeholders subscribe through the public selector contract so hidden preview text refreshes without remounting the whole placeholder.',
        },
      }
    );
  });

  test('void authoring helpers stay out of the public surface and examples', () => {
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const exampleViolations = listSourceFiles(['site/examples/ts']).flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf8');

        return /\b(?:VoidElement|InlineVoidElement)\b/.test(contents)
          ? [relative(repoRoot, absolutePath)]
          : [];
      }
    );

    expect(packageIndex).not.toMatch(/\bVoidElement\b/);
    expect(packageIndex).not.toMatch(/\bInlineVoidElement\b/);
    expect(packageIndex).not.toMatch(/\bSlateSpacer\b/);
    expect(exampleViolations).toEqual([]);
  });

  test('public host authoring uses installed DOM capabilities', () => {
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const publicHostStaticCalls = listSourceFiles([
      'docs/api',
      'docs/concepts',
      'docs/libraries',
      'docs/walkthroughs',
      'site/examples/ts',
    ]).flatMap((absolutePath) => {
      const contents = readFileSync(absolutePath, 'utf8');

      return /\b(?:ReactEditor|DOMEditor)\./.test(contents)
        ? [relative(repoRoot, absolutePath)]
        : [];
    });

    expect(packageIndex).not.toMatch(/export\s*\{\s*ReactEditor\b/);
    expect(publicHostStaticCalls).toEqual([]);
  });

  test('examples initialize editor values before the provider', () => {
    const exampleFiles = listSourceFiles(['site/examples/ts']);
    const providerInitialValueViolations = exampleFiles.flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf8');

        return /\binitialValue=/.test(contents)
          ? [relative(repoRoot, absolutePath)]
          : [];
      }
    );
    const valueReplaceInventory = Object.fromEntries(
      exampleFiles
        .map((absolutePath) => {
          const contents = readFileSync(absolutePath, 'utf8');
          const matches = contents.match(/\btx\.value\.replace\(/g);

          return [
            relative(repoRoot, absolutePath),
            matches ? matches.length : 0,
          ] as const;
        })
        .filter(([, count]) => count > 0)
        .sort(([a], [b]) => a.localeCompare(b))
    );

    expect(providerInitialValueViolations).toEqual([]);
    expect(valueReplaceInventory).toEqual(
      exampleFiles.length === 0
        ? {}
        : {
            'site/examples/ts/comment-mode.tsx': 1,
          }
    );
  });

  test('product comment examples use public annotation substrate', () => {
    const exampleFiles = ['site/examples/ts/comment-mode.tsx'];

    for (const file of exampleFiles) {
      const contents = readRepoFileIfExists(file);

      if (contents === null) {
        expect(listSourceFiles(['site/examples/ts'])).toEqual([]);
        continue;
      }

      expect(contents).toMatch(/from '@platejs\/slate'/);
      expect(contents).toMatch(/from '@platejs\/slate-react'/);
      expect(contents).toMatch(/\bBookmark\b/);
      expect(contents).toMatch(/\buseSlateAnnotationStore\b/);
      expect(contents).toMatch(/\buseSlateAnnotations\b/);
      expect(contents).toMatch(/\bannotationStore=/);
      expect(contents).not.toMatch(
        /(?:createSlateProjectionStore|ProjectionContext|projection-store|useSlateProjectionEntries|from 'slate-react\/src)/
      );
    }
  });

  test('slate-react overlay docs expose simple and scalable public paths', () => {
    const docFiles = [
      'docs/libraries/slate-react/annotations.md',
      'docs/libraries/slate-react/editable.md',
      'docs/libraries/slate-react/hooks.md',
      'docs/libraries/slate-react/slate.md',
    ] as const;

    if (!allRepoFilesExist(docFiles)) {
      const packageReadme = readFileSync(
        resolve(packageRoot, 'Readme.md'),
        'utf8'
      );
      const packageIndex = readFileSync(
        resolve(packageRoot, 'src/index.ts'),
        'utf8'
      );

      expect(packageReadme).toContain('Decoration sources, annotation stores');
      expect(packageReadme).toContain('DOM coverage boundaries');
      expect(packageIndex).toContain('useSlateAnnotationStore');
      expect(packageIndex).toContain('useSlateAnnotations');
      expect(packageIndex).toContain('useSlateWidgetStore');
      expect(packageIndex).toContain('useSlateWidgets');
      expect(packageIndex).not.toMatch(
        /(?:createSlateProjectionStore|ProjectionContext|from 'slate-react\/src)/
      );
      return;
    }

    const docs = {
      annotations: readFileSync(
        resolve(repoRoot, 'docs/libraries/slate-react/annotations.md'),
        'utf8'
      ),
      editable: readFileSync(
        resolve(repoRoot, 'docs/libraries/slate-react/editable.md'),
        'utf8'
      ),
      hooks: readFileSync(
        resolve(repoRoot, 'docs/libraries/slate-react/hooks.md'),
        'utf8'
      ),
      slate: readFileSync(
        resolve(repoRoot, 'docs/libraries/slate-react/slate.md'),
        'utf8'
      ),
    };
    const joinedDocs = Object.values(docs).join('\n');

    expect(docs.editable).toMatch(/\bdecorate\?:/);
    expect(docs.editable).toMatch(/\bEditable\.decorate\b/);
    expect(docs.slate).toMatch(/\bdecorationSources\b/);
    expect(docs.slate).toMatch(/\buseSlateDecorationSource\b/);
    expect(docs.slate).toContain('Widget stores are hook-owned.');
    expect(docs.slate).toContain('`widgetStore` prop');
    expect(docs.annotations).toMatch(/\buseSlateAnnotationStore\b/);
    expect(docs.annotations).toMatch(/\buseSlateAnnotations\b/);
    expect(docs.annotations).toMatch(/\bdeps: \[comments\]/);
    expect(docs.annotations).toMatch(/\btype SlateWidgetAnchor\b/);
    expect(docs.annotations).toMatch(/\buseSlateWidgetStore\b/);
    expect(docs.annotations).toMatch(/\buseSlateWidgets\(store\)/);
    expect(docs.hooks).toMatch(/\buseSlateWidgetStore\b/);
    expect(docs.hooks).toMatch(/\buseSlateWidgets\b/);
    expect(docs.hooks).toMatch(/\bannotationsOrOptions\b/);
    expect(docs.hooks).toContain('project: () =>');
    expect(joinedDocs).not.toMatch(
      /(?:createSlateProjectionStore|ProjectionContext|from 'slate-react\/src)/
    );
  });

  test('beginner rendering docs teach raw render props without callback memoization', () => {
    const docFiles = [
      'docs/concepts/09-rendering.md',
      'docs/walkthroughs/03-defining-custom-elements.md',
      'docs/walkthroughs/04-applying-custom-formatting.md',
      'docs/walkthroughs/05-executing-commands.md',
      'docs/walkthroughs/09-performance.md',
    ] as const;
    const docs = docFiles
      .map((file) => readRepoFileIfExists(file))
      .filter((contents): contents is string => contents !== null)
      .join('\n');

    if (docs.length === 0) {
      const packageReadme = readFileSync(
        resolve(packageRoot, 'Readme.md'),
        'utf8'
      );

      expect(packageReadme).toMatch(/\brenderElement\b/);
      expect(packageReadme).toMatch(/\buseSlateEditor\b/);
      expect(packageReadme).not.toMatch(/\beditableRenderers\b/);
      return;
    }

    expect(docs).toMatch(/\brenderElement\b/);
    expect(docs).toMatch(/\buseSlateEditor\b/);
    expect(docs).not.toMatch(/\bcreateReactEditor\b/);
    expect(docs).not.toMatch(/\buseState\(\(\) =>/);
    expect(docs).not.toMatch(/\buseCallback\b/);
    expect(docs).not.toMatch(/\beditableRenderers\b/);
  });

  test('typescript concept docs teach React value generics through useSlateEditor', () => {
    const docs = readRepoFileIfExists('docs/concepts/12-typescript.md');

    if (docs === null) {
      const genericContract = readFileSync(
        resolve(packageRoot, 'test/generic-react-editor-contract.tsx'),
        'utf8'
      );

      expect(genericContract).toMatch(/\bReactEditor<CustomValue>/);
      expect(genericContract).toMatch(/\buseSlateEditor\b/);
      return;
    }

    expect(docs).toMatch(/\buseSlateEditor<CustomValue>/);
    expect(docs).toMatch(/\btype CustomEditor = ReactEditor<CustomValue>/);
    expect(docs).not.toMatch(/\bcreateReactEditor\b/);
    expect(docs).not.toMatch(/\buseState\(\(\) =>/);
  });

  test('adapter static namespaces stay out of the public root at runtime', () => {
    expect('ReactEditor' in SlateReact).toBe(false);
    expect('DOMEditor' in SlateReact).toBe(false);
    expect('withReact' in SlateReact).toBe(false);
    expect(typeof SlateReact.react).toBe('function');
    expect(typeof SlateReact.createReactEditor).toBe('function');
  });

  test('weak-map runtime state stays out of the public root at runtime', () => {
    for (const name of [
      'EDITOR_TO_ELEMENT',
      'EDITOR_TO_FORCE_RENDER',
      'EDITOR_TO_KEY_TO_ELEMENT',
      'EDITOR_TO_PENDING_ACTION',
      'EDITOR_TO_PENDING_DIFFS',
      'EDITOR_TO_PENDING_INSERTION_MARKS',
      'EDITOR_TO_PENDING_SELECTION',
      'EDITOR_TO_PLACEHOLDER_ELEMENT',
      'EDITOR_TO_ROOT_VIEW_EDITORS',
      'EDITOR_TO_SCHEDULE_FLUSH',
      'EDITOR_TO_USER_MARKS',
      'EDITOR_TO_USER_SELECTION',
      'EDITOR_TO_WINDOW',
      'ELEMENT_TO_NODE',
      'IS_COMPOSING',
      'IS_FOCUSED',
      'IS_NODE_MAP_DIRTY',
      'IS_READ_ONLY',
      'MARK_PLACEHOLDER_SYMBOL',
      'NODE_TO_ELEMENT',
      'NODE_TO_INDEX',
      'NODE_TO_KEY',
      'NODE_TO_PARENT',
      'NODE_TO_RUNTIME_ID',
      'PLACEHOLDER_SYMBOL',
    ]) {
      expect(name in SlateReact).toBe(false);
    }
  });

  test('projection store machinery stays out of the public root at runtime', () => {
    for (const name of ['createSlateProjectionStore', 'isSlateSourceDirty']) {
      expect(name in SlateReact).toBe(false);
    }
  });

  test('raw overlay store constructors stay out of the public root at runtime', () => {
    for (const name of [
      'createSlateAnnotationStore',
      'createSlateWidgetStore',
    ]) {
      expect(name in SlateReact).toBe(false);
    }
  });

  test('raw decoration source constructors stay out of the public root at runtime', () => {
    for (const name of [
      'composeDecorationSources',
      'createDecorationSource',
      'createRangeDecorationSource',
    ]) {
      expect(name in SlateReact).toBe(false);
    }
  });

  test('text rendering internals stay out of the public root at runtime', () => {
    for (const name of [
      'DefaultPlaceholder',
      'EditableText',
      'TextString',
      'ZeroWidthString',
    ]) {
      expect(name in SlateReact).toBe(false);
    }
  });

  test('React hook aliases stay out of the public root at runtime', () => {
    for (const name of [
      'useComposing',
      'useElementIf',
      'useFocused',
      'useReadOnly',
      'useSelected',
      'useSlateSelection',
      'useSlateSelector',
      'useSlateStatic',
      'useSlateViewState',
      'useSlateViewEffect',
      'useSlateProjections',
    ]) {
      expect(name in SlateReact).toBe(false);
    }

    for (const name of [
      'useEditor',
      'useEditorComposing',
      'useEditorFocused',
      'useEditorReadOnly',
      'useEditorSelection',
      'useEditorSelector',
      'useElement',
      'useElementSelected',
      'useSlateProjectionEntries',
    ]) {
      expect(typeof SlateReact[name as keyof typeof SlateReact]).toBe(
        'function'
      );
    }
  });

  test('hook docs explain runtime and root editor names without aliases', () => {
    const hooks =
      readRepoFileIfExists('docs/libraries/slate-react/hooks.md') ??
      readFileSync(resolve(packageRoot, 'Readme.md'), 'utf8');

    if (readRepoFileIfExists('docs/libraries/slate-react/hooks.md') !== null) {
      expect(hooks).toContain('Runtime hooks read the whole editor runtime.');
      expect(hooks).toContain(
        'Use `useSlateEditor` to create an editor; use `useEditor` inside descendants'
      );
      expect(hooks).toContain('useSlateProjectionEntries<T>(runtimeId)');
      expect(hooks).toContain(
        'UI should use decoration sources, annotation stores, or widget stores first.'
      );
      expect(hooks).toContain('Root state hooks read one root.');
      expect(hooks).toContain(
        'Root editor hooks return a command-capable editor for one root.'
      );
      expect(hooks).toContain(
        'Shared selector options are `deps`, `equalityFn`, `shouldUpdate`, and'
      );
      expect(hooks).toContain('Prefer `useSlateRootEditor(root)`');
      expect(hooks).toContain('Pass `{ readOnly:');
      expect(hooks).toContain('Pass `root` to target one root.');
      expect(hooks).toContain("`focusPolicy: 'preserve'`");
      expect(hooks).toContain("default is `focus: 'preserve'`.");
    }

    expect(hooks).toContain('useSlateRootState');
    expect(hooks).toContain('useSlateRootEffect');
    expect(hooks).not.toContain('preserve-dom');
    expect(hooks).not.toContain('useSlateViewState');
    expect(hooks).not.toContain('useSlateViewEffect');
  });

  test('package README names the current runtime and root hook family', () => {
    const readme = readFileSync(resolve(packageRoot, 'Readme.md'), 'utf8');

    expect(readme).toContain(
      'Start with `useSlateEditor`, `Slate`, and `Editable`.'
    );
    expect(readme).toContain(
      'The lower-level `createReactEditor` factory installs'
    );
    expect(readme).toContain('Use it outside React component ownership');
    for (const name of [
      'useSlateRuntimeState',
      'useSlateRootState',
      'useSlateRootEditor',
      'useSlateActiveEditor',
      'useSlateCommandCallback',
      'useSlateRootEffect',
    ]) {
      expect(readme).toContain(name);
    }
    expect(readme).not.toContain('useSlateViewState');
    expect(readme).not.toContain('useSlateViewEffect');
  });

  test('public hook source JSDoc keeps the beta hover contract explicit', () => {
    const hookSources = {
      editor: readFileSync(
        resolve(packageRoot, 'src/hooks/use-slate-editor.ts'),
        'utf8'
      ),
      history: readFileSync(
        resolve(packageRoot, 'src/hooks/use-slate-history.ts'),
        'utf8'
      ),
      runtime: readFileSync(
        resolve(packageRoot, 'src/hooks/use-slate-runtime.tsx'),
        'utf8'
      ),
      stateField: readFileSync(
        resolve(packageRoot, 'src/hooks/use-state-field.ts'),
        'utf8'
      ),
    };

    expect(hookSources.editor).toContain('component or custom hook');
    expect(hookSources.editor).toContain(
      '`initialValue` seeds the editor once'
    );
    expect(hookSources.editor).toContain('Use `createReactEditor`');
    expect(hookSources.history).toContain('active or fixed root');
    expect(hookSources.history).toContain('`canUndo` / `canRedo`');
    expect(hookSources.history).toContain('`focusPolicy`');
    expect(hookSources.runtime).toContain('Use this for toolbar, sidebar');
    expect(hookSources.runtime).toContain('Root-scoped selectors skip commits');
    expect(hookSources.runtime).toContain("focus: 'restore-root'");
    expect(hookSources.stateField).toContain('committed dirty');
    expect(hookSources.stateField).toContain('preserves DOM selection');
  });

  test('all public hook exports carry source JSDoc', () => {
    const indexSource = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const hookNames = rawNames
        .split(',')
        .map((name) => name.trim().replace(/^type\s+/, ''))
        .map((name) => name.split(/\s+as\s+/)[0]?.trim() ?? '')
        .filter((name) => name.startsWith('use'));

      if (hookNames.length === 0) {
        continue;
      }

      const sourceBase = resolve(packageRoot, 'src', sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf8');

      for (const hookName of hookNames) {
        const declaration = new RegExp(
          `export\\s+(?:const|function)\\s+${hookName}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          missing.push(`${hookName}: missing public declaration`);
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${hookName}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('public component value exports carry source JSDoc', () => {
    const indexSource = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const valueNames = rawNames
        .split(',')
        .map((name) => name.trim().replace(/^type\s+/, ''))
        .map((name) => name.split(/\s+as\s+/)[0]?.trim() ?? '')
        .filter((name) => /^[A-Z]/.test(name));

      if (valueNames.length === 0) {
        continue;
      }

      const sourceBase = resolve(packageRoot, 'src', sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf8');

      for (const valueName of valueNames) {
        const declaration = new RegExp(
          `export\\s+(?:const|function|class)\\s+${valueName}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${valueName}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('public type exports carry source JSDoc', () => {
    const indexSource = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const exportPattern = /export \{([^}]+)\} from '([^']+)'/g;
    const missing: string[] = [];

    for (const match of indexSource.matchAll(exportPattern)) {
      const [, rawNames, sourceSpecifier] = match;
      const typeNames = rawNames
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name.startsWith('type '))
        .map((name) => name.replace(/^type\s+/, ''))
        .map((name) => name.split(/\s+as\s+/)[0]?.trim() ?? '');

      if (typeNames.length === 0) {
        continue;
      }

      const sourceBase = resolve(packageRoot, 'src', sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf8');

      for (const typeName of typeNames) {
        const declaration = new RegExp(
          `export\\s+(?:interface|type)\\s+${typeName}\\b`
        );
        const declarationIndex = source.search(declaration);

        if (declarationIndex === -1) {
          missing.push(`${typeName}: missing public type declaration`);
          continue;
        }

        const beforeDeclaration = source.slice(
          Math.max(0, declarationIndex - 600),
          declarationIndex
        );

        if (!/\/\*\*[\s\S]*?\*\/\s*$/.test(beforeDeclaration)) {
          missing.push(
            `${typeName}: missing immediate source JSDoc in ${relative(
              repoRoot,
              sourcePath
            )}`
          );
        }
      }
    }

    expect(missing).toEqual([]);
  });

  test('library README routes readers to runtime and root hooks', () => {
    const readme =
      readRepoFileIfExists('docs/libraries/slate-react/README.md') ??
      readFileSync(resolve(packageRoot, 'Readme.md'), 'utf8');

    if (readRepoFileIfExists('docs/libraries/slate-react/README.md') !== null) {
      expect(readme).toContain(
        'subscribe to editor state, runtime state, roots'
      );
      expect(readme).toContain('runtime/root hooks and widget hooks');
    } else {
      expect(readme).toContain('Common hooks include');
      expect(readme).toContain('useSlateRuntimeState');
    }

    expect(readme).not.toContain('useSlateViewState');
    expect(readme).not.toContain('useSlateViewEffect');
  });

  test('slate-react docs name public render primitives and advanced helper hooks', () => {
    const packageReadme = readFileSync(
      resolve(packageRoot, 'Readme.md'),
      'utf8'
    );
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const libraryReadme =
      readRepoFileIfExists('docs/libraries/slate-react/README.md') ??
      packageReadme;
    const hooks =
      readRepoFileIfExists('docs/libraries/slate-react/hooks.md') ??
      packageReadme;

    for (const name of [
      'SlateElement',
      'SlateText',
      'SlateLeaf',
      'SlatePlaceholder',
    ]) {
      expect(packageReadme).toContain(name);
      expect(libraryReadme).toContain(name);
    }

    for (const name of [
      'useSlateNodeRef',
      'useDOMStrategyVirtualOffset',
      'useSlateRangeDecorationSource',
    ]) {
      expect(packageReadme).toContain(name);
      expect(libraryReadme).toContain(name);
      expect(hooks).toContain(name);
    }

    if (readRepoFileIfExists('docs/libraries/slate-react/hooks.md') !== null) {
      expect(hooks).toContain('SlateRangeDecorationSourceOptions');
    } else {
      expect(packageIndex).toContain('SlateRangeDecorationSourceOptions');
    }
  });

  test('undocumented root type exports stay explicitly classified', () => {
    const docsFiles = listSourceFiles(['docs/libraries/slate-react']);
    const docs = [...docsFiles, resolve(packageRoot, 'Readme.md')]
      .map((absolutePath) => readFileSync(absolutePath, 'utf8'))
      .join('\n');
    const undocumentedTypeExports = getRootTypeExports().filter((name) => {
      const pattern = new RegExp(`\\b${name}\\b`);

      return !pattern.test(docs);
    });

    if (docsFiles.length === 0) {
      expect(getRootTypeExports()).toContain('EditableProps');
      expect(getRootTypeExports()).toContain('UseSlateRootEditorOptions');
      expect(undocumentedTypeExports).toContain('EditableProps');
      return;
    }

    expect(undocumentedTypeExports).toEqual(documentedAsGroupedRootTypeExports);
  });

  test('public root exports canonical Editable and render prop names without aliases', () => {
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const editableRootSource = readFileSync(
      resolve(packageRoot, 'src/components/editable.tsx'),
      'utf8'
    );

    expect(packageIndex).not.toMatch(
      /\bas\s+(?:Editable|Render|EditableProps)/
    );
    expect(packageIndex).not.toMatch(
      /\b(?:EditableTextBlocks|EditableTextBlocksProps|EditableRenderElementProps|EditableRenderVoidProps|EditableTextLeafProps|EditableTextRenderTextProps|EditableTextRenderPlaceholderProps)\b/
    );
    expect(packageIndex).not.toMatch(
      /\b(?:SlateViewBoundary|useSlateViewSelection)\b/
    );
    expect(editableRootSource).not.toMatch(
      /\bexport interface Render(?:Element|Leaf|Text)Props\b/
    );

    for (const name of [
      'EditableTextBlocks',
      'useSlateViewState',
      'useSlateViewEffect',
    ]) {
      expect(name in SlateReact).toBe(false);
    }

    for (const name of [
      'Editable',
      'useSlateRootState',
      'useSlateRootEffect',
    ]) {
      expect(typeof SlateReact[name as keyof typeof SlateReact]).toBe(
        'function'
      );
    }
  });

  test('public/internal runtime aliases stay hard-cut', () => {
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const annotationStoreSource = readFileSync(
      resolve(packageRoot, 'src/annotation-store.ts'),
      'utf8'
    );
    const runtimeAndroidSource = readFileSync(
      resolve(packageRoot, 'src/editable/runtime-android-engine.ts'),
      'utf8'
    );
    const runtimeHooksSource = readFileSync(
      resolve(packageRoot, 'src/hooks/use-slate-runtime.tsx'),
      'utf8'
    );
    const domCoverageBoundarySource = readFileSync(
      resolve(packageRoot, 'src/components/dom-coverage-boundary.tsx'),
      'utf8'
    );

    expect(packageIndex).not.toContain('SlateAnnotationStoreRefreshOptions');
    expect(annotationStoreSource).not.toMatch(
      /type SlateAnnotationStoreRefreshOptions\b/
    );
    expect(runtimeAndroidSource).not.toMatch(
      /type RuntimeAndroidInputManager\b/
    );
    expect(domCoverageBoundarySource).not.toMatch(
      /type DOMCoverageSelfBoundaryProps\b/
    );
    expect(runtimeHooksSource).not.toMatch(
      /type UseSlateRootEditorOptions = Pick<EditorViewOptions/
    );
    expect(runtimeHooksSource).toContain('readOnly?: boolean');
  });

  test('renderElement slots expose contentBoundary without unstable aliases', () => {
    const editableSource = readFileSync(
      resolve(packageRoot, 'src/components/editable-text-blocks.tsx'),
      'utf8'
    );
    const domCoverageExample = readRepoFileIfExists(
      'site/examples/ts/dom-coverage-boundaries.tsx'
    );

    expect(editableSource).toContain('contentBoundary:');
    expect(editableSource).not.toContain('unstableBoundary');

    if (domCoverageExample !== null) {
      expect(domCoverageExample).toContain('slots.contentBoundary');
      expect(domCoverageExample).not.toContain('slots.unstableBoundary');
    }
  });

  test('virtualized DOM strategy stays object-only and experimental', () => {
    const segmentPlanSource = readFileSync(
      resolve(packageRoot, 'src/dom-strategy/create-segment-plan.ts'),
      'utf8'
    );
    const editableSource = readFileSync(
      resolve(packageRoot, 'src/components/editable-text-blocks.tsx'),
      'utf8'
    );

    const domStrategyType = segmentPlanSource.match(
      /export type DOMStrategyType =([\s\S]*?)export type DOMStrategyOptions =/
    )?.[1];

    expect(domStrategyType).not.toContain("'virtualized'");
    expect(domStrategyType).not.toContain("'shell'");
    expect(segmentPlanSource).not.toContain("type: 'shell'");
    expect(segmentPlanSource).toContain("type: 'virtualized'");
    expect(segmentPlanSource).toContain('Intentionally object-only');
    expect(editableSource).toContain('`virtualized` is experimental');
  });

  test('Editable public DOM strategy naming does not expose DOM strategy props', () => {
    const editableSource = readFileSync(
      resolve(packageRoot, 'src/components/editable-text-blocks.tsx'),
      'utf8'
    );
    const editableRootSource = readFileSync(
      resolve(packageRoot, 'src/components/editable.tsx'),
      'utf8'
    );
    const packageIndex = readFileSync(
      resolve(packageRoot, 'src/index.ts'),
      'utf8'
    );
    const effectiveStrategyType = editableRootSource.match(
      /export type EditableDOMStrategyEffectiveType =([\s\S]*?)export type EditableDOMStrategyDegradationMode =/
    )?.[1];
    const degradationModeType = editableRootSource.match(
      /export type EditableDOMStrategyDegradationMode =([\s\S]*?)export type EditableDOMStrategyMetricsBase =/
    )?.[1];
    const metricsBase = editableRootSource.match(
      /export type EditableDOMStrategyMetricsBase = \{([\s\S]*?)\n\}/
    )?.[1];

    expect(editableSource).toContain('domStrategy?: DOMStrategyOptions | null');
    expect(editableSource).toContain(
      'domStrategyLayout?: EditableDOMStrategyLayout | null'
    );
    expect(editableSource).toContain('onDOMStrategyMetrics?:');
    expect(editableSource).not.toContain('layout?: EditableLayout | null');
    expect(packageIndex).toContain('EditableDOMStrategyLayout');
    expect(packageIndex).not.toContain('EditableLayout');
    expect(editableSource).not.toContain(
      'renderingStrategy?: RenderingStrategyOptions | null'
    );
    expect(editableSource).not.toContain('onRenderingStrategyMetrics?:');
    expect(effectiveStrategyType).not.toContain("'shell'");
    expect(degradationModeType).not.toContain("'shell'");
    expect(metricsBase).not.toContain('partialDOMCount');
    expect(editableRootSource).not.toContain('shellAggressiveBoundaryCount');
    expect(editableRootSource).toContain('aggressiveDomCoverageBoundaryCount');
    expect(packageIndex).toContain('EditableDOMStrategyMetrics');
    expect(packageIndex).not.toContain('EditableRenderingStrategy');
  });

  test('Editable docs expose current component props and render-element shape', () => {
    const docs =
      readRepoFileIfExists('docs/libraries/slate-react/editable.md') ??
      readFileSync(
        resolve(packageRoot, 'src/components/editable-text-blocks.tsx'),
        'utf8'
      );

    expect(docs).toContain('decorateDirtiness?: SlateSourceDirtiness');
    expect(docs).toContain(
      'decorateRuntimeScope?: SlateProjectionRuntimeScope'
    );
    expect(docs).toContain(
      'domStrategyLayout?: EditableDOMStrategyLayout | null'
    );
    expect(docs).not.toContain('layout?: EditableLayout | null');
    if (
      readRepoFileIfExists('docs/libraries/slate-react/editable.md') !== null
    ) {
      expect(docs).toContain('Pass `domStrategyLayout` only when');
      expect(docs).toContain('defaults to `defaultScrollSelectionIntoView`');
    }

    expect(docs).toContain("type: 'virtualized'");
    expect(docs).toContain("'data-slate-runtime-id': RuntimeId");
    expect(docs).toContain('isInline: boolean');
    expect(docs).toContain('slots: EditableElementSlots');
  });

  test('Editable DOM strategy option objects normalize through primitive fields', () => {
    const editableSource = readFileSync(
      resolve(packageRoot, 'src/components/editable-text-blocks.tsx'),
      'utf8'
    );

    expect(editableSource).toMatch(/\bdomStrategyVirtualizedOverscan\b/);
    expect(editableSource).not.toContain(
      '[domStrategyType, internalShellDOMStrategyOptions]'
    );
    expect(editableSource).not.toContain(
      '[domStrategyType, virtualizedDOMStrategyOptions]'
    );
  });

  test('saving walkthrough uses lazy state for one-shot initial content', () => {
    const docs = readRepoFileIfExists(
      'docs/walkthroughs/06-saving-to-a-database.md'
    );

    if (docs === null) {
      const editorHook = readFileSync(
        resolve(packageRoot, 'src/hooks/use-slate-editor.ts'),
        'utf8'
      );

      expect(editorHook).toContain('`initialValue` seeds the editor once');
      return;
    }

    expect(docs).toMatch(/\bconst \[initialValue\] = useState\(\(\) =>/);
    expect(docs).not.toMatch(/\buseMemo\b/);
  });

  test('app-owned hotkey examples use raw Editable keydown props instead of registered key commands', () => {
    for (const file of [
      'site/examples/ts/iframe.tsx',
      'site/examples/ts/richtext.tsx',
    ]) {
      const source = readRepoFileIfExists(file);

      if (source === null) {
        expect(listSourceFiles(['site/examples/ts'])).toEqual([]);
        continue;
      }

      expect(source).toMatch(/\bonKeyDown=/);
      expect(source).not.toMatch(/\beditableKeyCommands\b/);
    }

    const images = readRepoFileIfExists('site/examples/ts/images.tsx');

    if (images !== null) {
      expect(images).not.toMatch(/\bonKeyDown=/);
      expect(images).not.toMatch(/\beditableKeyCommands\b/);
    }
  });

  test('examples route transform-equivalent model behavior through extensions', () => {
    const tables = readRepoFileIfExists('site/examples/ts/tables.tsx');
    const markdown = readRepoFileIfExists(
      'site/examples/ts/markdown-shortcuts.tsx'
    );
    const richtext = readRepoFileIfExists('site/examples/ts/richtext.tsx');
    const editableDocs = readRepoFileIfExists(
      'docs/libraries/slate-react/editable.md'
    );

    if (
      tables === null ||
      markdown === null ||
      richtext === null ||
      editableDocs === null
    ) {
      const projectedCommandContract = readFileSync(
        resolve(packageRoot, 'test/projected-command-contract.test.ts'),
        'utf8'
      );

      expect(projectedCommandContract).toMatch(/\bdefineEditorExtension\b/);
      expect(projectedCommandContract).toMatch(/\btx\./);
      return;
    }

    expect(tables).toMatch(/\bdefineEditorExtension\b/);
    expect(tables).toMatch(/\bdeleteBackward\(\{ next, tx, unit \}\)/);
    expect(tables).toMatch(/\bdeleteForward\(\{ next, tx, unit \}\)/);
    expect(tables).toMatch(/\binsertBreak\(\{ next, tx \}\)/);
    expect(tables).not.toMatch(/event\.key === ['"]Backspace['"]/);
    expect(tables).not.toMatch(/event\.key === ['"]Delete['"]/);
    expect(tables).not.toMatch(/event\.key === ['"]Enter['"]/);

    expect(markdown).toMatch(
      /\bdeleteBackward\(\{ editor, next, tx, unit \}\)/
    );
    expect(markdown).toMatch(/\binsertBreak\(\{ next, tx \}\)/);
    expect(markdown).toMatch(/\binsertText\(\{ editor, next, text, tx \}\)/);
    expect(markdown).not.toMatch(/\bonKeyDown=/);

    expect(richtext).toMatch(/\binsertBreak\(\{ next, tx \}\)/);
    expect(richtext).toMatch(/\bonKeyDown=/);
    expect(richtext).not.toMatch(/event\.key === ['"]Enter['"]/);

    expect(editableDocs).toContain(
      'Use extension `transforms` for model behavior such as `deleteBackward`, `deleteForward`, and `insertBreak`.'
    );
    expect(editableDocs).toContain(
      '`onBeforeInput` is the React form-event hook on the editable root.'
    );
    expect(editableDocs).toContain('`onDOMBeforeInput` only when you need');
    expect(editableDocs).toContain('raw native `InputEvent`');
  });

  test('examples infer editable behavior callback types inline', () => {
    const violations = listSourceFiles(['site/examples/ts']).flatMap(
      (absolutePath) => {
        const source = readFileSync(absolutePath, 'utf8');
        const relativePath = relative(repoRoot, absolutePath);
        const patterns = [
          /\bconst\s+\w+\s*:\s*Editable(?:CommandHandler|InputRule|KeyCommand)\b/,
          /\btype\s+Editable(?:CommandHandler|InputRule|KeyCommand)\b/,
          /\bParameters<EditableCommandHandler>\b/,
        ];

        return patterns.some((pattern) => pattern.test(source))
          ? [relativePath]
          : [];
      }
    );

    expect(violations).toEqual([]);
  });

  test('Editable defaults translate="no" and allows override', () => {
    const initialValue = [{ type: 'block', children: [{ text: 'test' }] }];
    const editor = createReactEditor({ initialValue });

    const defaultRender = render(
      <Slate editor={editor}>
        <Editable />
      </Slate>
    );

    expect(
      defaultRender.container
        .querySelector('[data-slate-editor]')
        ?.getAttribute('translate')
    ).toBe('no');

    defaultRender.rerender(
      <Slate editor={editor}>
        <Editable translate="yes" />
      </Slate>
    );

    expect(
      defaultRender.container
        .querySelector('[data-slate-editor]')
        ?.getAttribute('translate')
    ).toBe('yes');
  });

  test('Editable consumes raw element, leaf, text, segment, and void render props', () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'code',
          children: [{ text: 'const answer = 42', bold: true }],
        },
        {
          type: 'image',
          url: 'about:blank',
          children: [{ text: '' }],
        },
      ],
    }) as ReactRuntimeEditor;

    editor.extend({
      elements: [{ type: 'image', void: 'block' }],
      name: 'test-renderers',
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          renderElement={({ attributes, children }) => (
            <pre {...attributes} data-renderer="code">
              <code>{children}</code>
            </pre>
          )}
          renderLeaf={({ children }) => (
            <strong data-renderer="bold">{children}</strong>
          )}
          renderSegment={(segment, children) => (
            <mark data-renderer="segment" data-start={segment.start}>
              {children}
            </mark>
          )}
          renderText={({ attributes, children }) => (
            <span {...attributes} data-renderer="text">
              {children}
            </span>
          )}
          renderVoid={({ element }) => (
            <img
              alt=""
              data-renderer="image"
              height={1}
              src={(element as { url: string }).url}
              width={1}
            />
          )}
        />
      </Slate>
    );

    expect(
      rendered.container.querySelector('[data-renderer="code"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="bold"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="segment"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="text"]')
    ).toBeTruthy();
    expect(
      rendered.container.querySelector('[data-renderer="image"]')
    ).toBeTruthy();
  });

  test('structured render surface keeps mount identity stable across split and merge', async () => {
    const editor = createReactEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const mounts = jest.fn();

    const renderElement = ({ children }: RenderElementProps) => {
      useEffect(() => mounts(), []);
      return <div>{children}</div>;
    };

    const rendered = render(
      <Slate editor={editor}>
        <Editable renderElement={renderElement} />
      </Slate>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.split({ at: { path: [0, 0], offset: 2 } });
      });
    });

    expect(mounts).toHaveBeenCalledTimes(2);
    rendered.unmount();

    const mergeEditor = createReactEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'te' }] },
        { type: 'block', children: [{ text: 'st' }] },
      ],
    });
    const mergeMounts = jest.fn();

    const mergeRenderElement = ({ children }: RenderElementProps) => {
      useEffect(() => mergeMounts(), []);
      return <div>{children}</div>;
    };

    render(
      <Slate editor={mergeEditor}>
        <Editable renderElement={mergeRenderElement} />
      </Slate>
    );

    await act(async () => {
      mergeEditor.update((tx) => {
        tx.nodes.merge({ at: { path: [0, 0], offset: 0 } });
      });
    });

    expect(mergeMounts).toHaveBeenCalledTimes(2);
  });

  test('parent attribute changes do not remount child element renderers', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'wrapper',
          status: 'draft',
          children: [{ type: 'child', children: [{ text: 'inside' }] }],
        },
      ],
    });
    const childMounts = jest.fn();
    const childUnmounts = jest.fn();

    const renderElement = ({ children, element }: RenderElementProps) => {
      const type = (element as { type?: string }).type;

      useEffect(() => {
        if (type !== 'child') {
          return;
        }

        childMounts();
        return () => childUnmounts();
      }, [type]);

      return <div data-type={type}>{children}</div>;
    };

    render(
      <Slate editor={editor}>
        <Editable renderElement={renderElement} />
      </Slate>
    );

    expect(childMounts).toHaveBeenCalledTimes(1);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.set({ status: 'review' }, { at: [0] });
      });
    });

    expect(childMounts).toHaveBeenCalledTimes(1);
    expect(childUnmounts).not.toHaveBeenCalled();
  });

  test('useElementSelected remains stable when the selected element path shifts after structural edits', async () => {
    const editor = createReactEditor({
      initialValue: [
        {
          id: '0',
          children: [
            { id: '0.0', children: [{ text: '' }] },
            { id: '0.1', children: [{ text: '' }] },
            { id: '0.2', children: [{ text: '' }] },
          ],
        },
        { id: '1', children: [{ text: '' }] },
        { id: '2', children: [{ text: '' }] },
      ],
    }) as ReactRuntimeEditor;
    const elementSelectedRenders: Record<string, boolean[] | undefined> = {};
    const latestElementSelected: Record<string, boolean | undefined> = {};

    const renderElement = ({
      element,
      attributes,
      children,
    }: RenderElementProps) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const selected = useElementSelected();
      const { id } = element as { id: string };
      latestElementSelected[id] = selected;

      let selectedRenders = elementSelectedRenders[id];

      if (!selectedRenders) {
        selectedRenders = [];
        elementSelectedRenders[id] = selectedRenders;
      }

      selectedRenders.push(selected);

      return <div {...attributes}>{children}</div>;
    };

    render(
      <Slate editor={editor}>
        <Editable renderElement={renderElement} />
      </Slate>
    );

    Object.values(elementSelectedRenders).forEach((selectedRenders) => {
      selectedRenders?.splice(0, selectedRenders.length);
    });

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [2, 0], offset: 0 });
      });
    });

    expect(elementSelectedRenders).toEqual({
      '0': [],
      '0.0': [],
      '0.1': [],
      '0.2': [],
      '1': [],
      '2': [true],
    });

    Object.values(elementSelectedRenders).forEach((selectedRenders) => {
      selectedRenders?.splice(0, selectedRenders.length);
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert({ id: 'new', children: [{ text: '' }] } as never, {
          at: [2],
        });
      });
    });

    expect(elementSelectedRenders).toEqual({
      '0': [],
      '0.0': [],
      '0.1': [],
      '0.2': [],
      '1': [],
      new: [false],
      '2': [true],
    });
    expect(latestElementSelected['2']).toBe(true);
  });

  test('custom element handlers resolve the current path after leading inserts', async () => {
    const editor = createReactEditor({
      initialValue: [
        { id: 'first', children: [{ text: '' }] },
        { id: 'target', children: [{ text: '' }] },
      ],
    }) as ReactRuntimeEditor;
    const renderCounts: Record<string, number | undefined> = {};
    let readTargetPath = (): number[] => {
      throw new Error('Target element did not render.');
    };

    const renderElement = ({
      attributes,
      children,
      element,
    }: RenderElementProps) => {
      const { id } = element as { id: string };
      renderCounts[id] = (renderCounts[id] ?? 0) + 1;

      if (id === 'target') {
        readTargetPath = () => editor.api.dom.assertPath(element);
      }

      return <div {...attributes}>{children}</div>;
    };

    render(
      <Slate editor={editor}>
        <Editable renderElement={renderElement} />
      </Slate>
    );

    expect(readTargetPath()).toEqual([1]);
    renderCounts.first = 0;
    renderCounts.target = 0;

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert({ id: 'inserted', children: [{ text: '' }] } as never, {
          at: [0],
        });
      });
    });

    expect(renderCounts.target ?? 0).toBe(1);
    expect(readTargetPath()).toEqual([2]);
  });

  test('renderVoid receives content-only props and runtime owns block void shell', () => {
    const editor = createReactEditor({
      initialValue: [
        { type: 'image', url: 'about:blank', children: [{ text: '' }] },
      ],
    }) as ReactRuntimeEditor;
    let renderVoidProps: RenderVoidProps | null = null;
    const renderElement = jest.fn(({ children }: RenderElementProps) => (
      <p>{children}</p>
    ));

    editor.extend({
      elements: [{ type: 'image', void: 'block' }],
      name: 'test-block-void',
    });

    const renderVoid = (props: RenderVoidProps) => {
      renderVoidProps = props;

      return <img alt="" height={1} src="about:blank" width={1} />;
    };

    const rendered = render(
      <Slate editor={editor}>
        <Editable renderElement={renderElement} renderVoid={renderVoid} />
      </Slate>
    );

    const voidElement = rendered.container.querySelector(
      '[data-slate-node="element"][data-slate-void="true"]'
    );
    const spacer = rendered.container.querySelector('[data-slate-spacer]');
    const image = rendered.container.querySelector('img');

    expect(renderElement).not.toHaveBeenCalled();
    expect(renderVoidProps).toBeTruthy();
    expect(renderVoidProps?.element.type).toBe('image');
    expect('path' in (renderVoidProps as object)).toBe(false);
    expect('target' in (renderVoidProps as object)).toBe(false);
    expect('actions' in (renderVoidProps as object)).toBe(false);
    expect('selected' in (renderVoidProps as object)).toBe(false);
    expect('focused' in (renderVoidProps as object)).toBe(false);
    expect('children' in (renderVoidProps as object)).toBe(false);
    expect('attributes' in (renderVoidProps as object)).toBe(false);
    expect(voidElement).toBeTruthy();
    expect(voidElement?.getAttribute('draggable')).toBe('true');
    expect(image).toBeTruthy();
    expect(image?.parentElement?.getAttribute('contenteditable')).toBe('false');
    expect(spacer?.querySelector('[data-slate-zero-width]')).toBeTruthy();
  });

  test('editable-island void content keeps classic void chrome while nested editors stay focusable', () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'editable-card',
          children: [{ text: '' }],
        },
      ],
    }) as ReactRuntimeEditor;

    editor.extend({
      elements: [{ type: 'editable-card', void: 'editable-island' }],
      name: 'test-editable-island-void',
    });

    const rendered = render(
      <Slate editor={editor}>
        <Editable
          renderVoid={() => (
            <div data-renderer="editable-card">
              <div contentEditable={false}>Controls</div>
              <div contentEditable>Nested editor target</div>
            </div>
          )}
        />
      </Slate>
    );

    const card = rendered.container.querySelector(
      '[data-renderer="editable-card"]'
    );
    const spacer = rendered.container.querySelector('[data-slate-spacer]');

    expect(card?.parentElement?.getAttribute('contenteditable')).toBe('false');
    expect(
      card
        ?.closest('[data-slate-node="element"][data-slate-void="true"]')
        ?.getAttribute('draggable')
    ).toBe('true');
    expect(card?.querySelector('[contenteditable="false"]')?.textContent).toBe(
      'Controls'
    );
    expect(card?.querySelector('[contenteditable="true"]')).toBeTruthy();
    expect(spacer?.querySelector('[data-slate-zero-width]')).toBeTruthy();
  });

  test('renderVoid receives content-only props and runtime owns inline void anchor', () => {
    const editor = createReactEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'Before ' },
            {
              type: 'mention',
              character: 'R2-D2',
              children: [{ text: '' }],
            },
            { text: ' after' },
          ],
        },
      ],
    }) as ReactRuntimeEditor;
    let renderVoidProps: RenderVoidProps | null = null;

    editor.extend({
      elements: [{ type: 'mention', void: 'inline' }],
      name: 'test-inline-void',
    });

    const renderElement = jest.fn(({ children }: RenderElementProps) => (
      <p>{children}</p>
    ));

    const renderVoid = (props: RenderVoidProps) => {
      renderVoidProps = props;

      return <span data-cy="visible-mention">@R2-D2</span>;
    };

    const rendered = render(
      <Slate editor={editor}>
        <Editable renderElement={renderElement} renderVoid={renderVoid} />
      </Slate>
    );

    const mention = rendered.container.querySelector(
      '[data-slate-inline="true"][data-slate-void="true"]'
    );

    expect(renderElement).toHaveBeenCalledTimes(1);
    expect(renderVoidProps).toBeTruthy();
    expect(renderVoidProps?.element.type).toBe('mention');
    expect('path' in (renderVoidProps as object)).toBe(false);
    expect('target' in (renderVoidProps as object)).toBe(false);
    expect('actions' in (renderVoidProps as object)).toBe(false);
    expect('selected' in (renderVoidProps as object)).toBe(false);
    expect('focused' in (renderVoidProps as object)).toBe(false);
    expect('children' in (renderVoidProps as object)).toBe(false);
    expect('attributes' in (renderVoidProps as object)).toBe(false);
    expect(mention?.hasAttribute('draggable')).toBe(false);
    expect(mention?.querySelector('[data-cy="visible-mention"]')).toBeTruthy();
    expect(mention?.querySelector('[data-slate-zero-width]')).toBeTruthy();
  });
});
