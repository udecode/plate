// Export-contract tests intentionally inspect namespace keys.
// Source-contract assertions keep patterns next to their claims.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

import { act, render } from '@testing-library/react';
import * as PliteRoot from 'plitejs';
import { defineEditorSchema, schema } from 'plitejs';
import { type ComponentProps, useEffect } from 'react';

import * as PliteReact from '../../src/react';
import {
  createEditor,
  Editable,
  type EditableProps,
  Plite,
  type PliteCommitContext,
  type PliteSelectionChangeContext,
  type PliteValueChangeContext,
  type RenderElementProps,
  type RenderVoidProps,
} from '../../src/react';
import type { ReactRuntimeEditor } from '../../src/react/plugin/react-editor';
import { createElementSelectedHistoryRenderElement } from './render-probes/element-selected-render-probes';

const cwd = process.cwd();
const packageRoot = cwd.endsWith(`${sep}packages${sep}plitejs`)
  ? cwd
  : resolve(cwd, 'packages/plitejs');
const repoRoot = resolve(packageRoot, '../..');
const reactSourceRoot = resolve(packageRoot, 'src/react');
const reactDocsIndexPath = resolve(
  repoRoot,
  'content/docs/plite/libraries/plite-react/index.mdx'
);
const sourceFilePattern = /\.(md|ts|tsx)$/;

const blockVoidSchema = defineEditorSchema('schema:react-surface-block-void', {
  elements: { image: { void: 'block' } },
  id: 'react-surface-block-void',
  root: schema.content.not(schema.content.text()),
  unknown: 'preserve',
  version: 1,
});

const editableIslandSchema = defineEditorSchema(
  'schema:react-surface-editable-island',
  {
    elements: {
      'editable-card': {
        content: schema.content.open(),
        void: 'editable-island',
      },
    },
    id: 'react-surface-editable-island',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

const inlineVoidSchema = defineEditorSchema(
  'schema:react-surface-inline-void',
  {
    elements: { mention: { void: 'inline' } },
    id: 'react-surface-inline-void',
    root: schema.content.not(schema.content.text()),
    unknown: 'preserve',
    version: 1,
  }
);

const readRepoFileIfExists = (file: string) => {
  const absolutePath = resolve(repoRoot, file);

  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf-8') : null;
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
type PliteHasWidgetStore = 'widgetStore' extends keyof ComponentProps<
  typeof Plite
>
  ? true
  : false;
type PliteHasOnCommit = 'onCommit' extends keyof ComponentProps<typeof Plite>
  ? true
  : false;
type PliteHasOnChange = 'onChange' extends keyof ComponentProps<typeof Plite>
  ? true
  : false;
type PliteCommitHasCommit = 'commit' extends keyof PliteCommitContext
  ? true
  : false;
type PliteCommitHasSnapshot = 'snapshot' extends keyof PliteCommitContext
  ? true
  : false;
type PliteValueChangeHasValue = 'value' extends keyof PliteValueChangeContext
  ? true
  : false;
type PliteSelectionChangeHasSelection =
  'selection' extends keyof PliteSelectionChangeContext ? true : false;
type EditableAutoCompleteAcceptsBoolean =
  boolean extends NonNullable<EditableProps['autoComplete']> ? true : false;
type EditableExposesDOMStrategy = ExpectTrue<EditableHasDOMStrategy>;
type EditableDoesNotExposeLayout = ExpectFalse<EditableHasLayout>;
type EditableDoesNotExposeRenderingStrategy =
  ExpectFalse<EditableHasRenderingStrategy>;
type EditableExposesOnDOMStrategyMetrics =
  ExpectTrue<EditableHasOnDOMStrategyMetrics>;
type EditableDoesNotExposeOnRenderingStrategyMetrics =
  ExpectFalse<EditableHasOnRenderingStrategyMetrics>;
type EditableDoesNotExposeOnCommand = ExpectFalse<EditableHasOnCommand>;
type PliteDoesNotExposeWidgetStore = ExpectFalse<PliteHasWidgetStore>;
type PliteExposesOnCommit = ExpectTrue<PliteHasOnCommit>;
type PliteDoesNotExposeOnChange = ExpectFalse<PliteHasOnChange>;
type PliteCommitExposesCommit = ExpectTrue<PliteCommitHasCommit>;
type PliteCommitExposesSnapshot = ExpectTrue<PliteCommitHasSnapshot>;
type PliteValueChangeExposesValue = ExpectTrue<PliteValueChangeHasValue>;
type PliteSelectionChangeExposesSelection =
  ExpectTrue<PliteSelectionChangeHasSelection>;
type EditableRejectsBooleanAutoComplete =
  ExpectFalse<EditableAutoCompleteAcceptsBoolean>;

void (null as unknown as RenderElementDoesNotExposePath);
void (null as unknown as RenderElementDoesNotExposeIndex);
void (null as unknown as RenderVoidDoesNotExposePath);
void (null as unknown as EditableDOMBeforeInputProps);
void (null as unknown as EditableExposesDOMStrategy);
void (null as unknown as EditableDoesNotExposeLayout);
void (null as unknown as EditableDoesNotExposeRenderingStrategy);
void (null as unknown as EditableExposesOnDOMStrategyMetrics);
void (null as unknown as EditableDoesNotExposeOnRenderingStrategyMetrics);
void (null as unknown as EditableDoesNotExposeOnCommand);
void (null as unknown as PliteDoesNotExposeWidgetStore);
void (null as unknown as PliteExposesOnCommit);
void (null as unknown as PliteDoesNotExposeOnChange);
void (null as unknown as PliteCommitExposesCommit);
void (null as unknown as PliteCommitExposesSnapshot);
void (null as unknown as PliteValueChangeExposesValue);
void (null as unknown as PliteSelectionChangeExposesSelection);
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

const readPackageJson = () =>
  JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf-8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    exports?: Record<string, unknown>;
    peerDependencies?: Record<string, string>;
    version: string;
  };

const expectedPliteReactRuntimeRootExports = [
  'Editable',
  'EditableElement',
  'EditorReadOnlyProvider',
  'Plite',
  'PliteElement',
  'PliteLeaf',
  'PlitePlaceholder',
  'PliteReactUpdatePolicy',
  'PliteRuntime',
  'PliteText',
  'createEditor',
  'defaultScrollSelectionIntoView',
  'react',
  'setDOMTextSyncRendererCapability',
  'useClaimEditableDOMCommit',
  'useDOMStrategyVirtualOffset',
  'useDecorationSelector',
  'useEditorContext',
  'useEditorComposing',
  'useEditorEditableElement',
  'useEditorFocused',
  'useOptionalEditorReadOnly',
  'useEditorReadOnly',
  'useEditorRootElement',
  'useEditorRuntimeState',
  'useEditorScrollElement',
  'useEditorScrollElementRef',
  'useEditorSelection',
  'useEditorSelector',
  'useEditorState',
  'useEditorViewState',
  'useElement',
  'useOptionalElement',
  'useElementPath',
  'useElementSelected',
  'useNodeSelector',
  'useOptionalEditorContext',
  'useSetStateField',
  'usePliteActiveEditor',
  'usePliteActiveRoot',
  'usePliteAnnotation',
  'usePliteAnnotationStore',
  'usePliteAnnotations',
  'usePliteChildRoot',
  'usePliteCommand',
  'usePliteContentRoot',
  'usePliteDecorationSource',
  'useEditor',
  'usePliteHistory',
  'usePliteNodeRef',
  'usePliteProjectionEntries',
  'usePliteRangeDecorationSource',
  'usePliteRootChrome',
  'usePliteRootEditor',
  'usePliteRootEffect',
  'usePliteRootState',
  'usePliteRuntime',
  'usePliteRuntimeState',
  'usePliteWidget',
  'usePliteWidgetGeometry',
  'usePliteWidgetIds',
  'usePliteWidgetStore',
  'usePliteWidgets',
  'useSelectionGeometry',
  'useStateFieldValue',
  'useTextSelector',
];

const documentedAsGroupedRootTypeExports = [
  'CreateEditorOptions',
  'DOMStrategyType',
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
  'ReactExtensionOptions',
  'PliteAnnotationProjectionData',
  'PliteAnnotationRefreshOptions',
  'PliteAnnotationStoreMetrics',
  'UsePliteAnnotationStoreOptions',
  'PliteCommandFocusPolicy',
  'PliteCustomSourceDirtiness',
  'PliteDecoration',
  'PliteDecorationSourceOptions',
  'PliteDecorationSourceReadContext',
  'PliteHistoryFocusPolicy',
  'PliteProjection',
  'PliteProjectionRefreshListener',
  'PliteProjectionRefreshResult',
  'PliteProjectionSlice',
  'PliteProjectionSource',
  'PliteProjectionStore',
  'PliteProjectionStoreMetrics',
  'PliteProjectionStoreOptions',
  'PliteProjectionStoreRefreshOptions',
  'PliteRangeDecoration',
  'PliteRangeProjection',
  'PliteRuntimeProps',
  'PliteRuntimeStateSelectorOptions',
  'PliteSourceDirtinessClass',
  'PliteSourceDirtinessContext',
  'PliteWidgetStoreMetrics',
  'UsePliteWidgetStoreOptions',
  'StateFieldSetter',
  'UseElementSelectedMode',
  'PliteCommandDispatcher',
  'UsePliteCommandOptions',
  'UsePliteContentRootOptions',
  'UsePliteDecorationSourceOptions',
  'UseEditorOptions',
  'UsePliteHistoryOptions',
  'UsePliteRangeDecorationSourceOptions',
  'UsePliteRootChromeOptions',
  'UsePliteRootEditorOptions',
  'UsePliteRootEffectOptions',
  'UsePliteRuntimeOptions',
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
        const contents = readFileSync(absolutePath, 'utf-8');
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
    resolve(reactSourceRoot, 'index.ts'),
    'utf-8'
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

describe('plitejs/react surface contract', () => {
  test('public root runtime values stay exact', () => {
    expect(Object.keys(PliteReact).sort()).toEqual(
      [
        ...new Set([
          ...Object.keys(PliteRoot),
          ...expectedPliteReactRuntimeRootExports,
        ]),
      ].sort()
    );
  });

  test('Editable exposes native beforeinput context without public command handlers', () => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'test' }] }],
    });
    let beforeInputContext:
      | Parameters<NonNullable<EditableDOMBeforeInputProps>>[1]
      | null = null;

    render(
      <Plite editor={editor}>
        <Editable
          onDOMBeforeInput={(event, context) => {
            event.preventDefault();
            beforeInputContext = context;
            context.editor.update(() => {});
            return true;
          }}
        />
      </Plite>
    );

    expect(beforeInputContext).toBe(null);
  });

  test('synced text render policy stays out of the public selector surface', () => {
    const publicRoots = [
      'docs/api',
      'docs/concepts',
      'docs/libraries',
      'docs/walkthroughs',
      'packages/plitejs/src/react',
      'site/examples/ts',
    ];
    const stalePublicOptionViolations = listSourceFiles(publicRoots).flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf-8');

        return contents.includes('skipSyncedTextIntents')
          ? [relative(repoRoot, absolutePath)]
          : [];
      }
    );
    const packageIndex = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );

    expect(stalePublicOptionViolations).toEqual([]);
    expect(packageIndex).not.toMatch(/useMounted(?:Node|Text)RenderSelector/);
  });

  test('React source does not import a public internal entrypoint', () => {
    const violations = listSourceFiles(['packages/plitejs/src/react']).flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf-8');
        const relativePath = relative(repoRoot, absolutePath);

        return /from ['"]plitejs\/(?:dom\/|react\/)?internal['"]/.test(contents)
          ? [relativePath]
          : [];
      }
    );

    expect(violations).toEqual([]);
  });

  test('projection store uses the source snapshot when projecting ranges', () => {
    const contents = readFileSync(
      resolve(repoRoot, 'packages/plitejs/src/react/projection-store.ts'),
      'utf-8'
    );

    expect(contents).toMatch(/projectRangeInSnapshot\(snapshot,/);
    expect(contents).not.toMatch(/Editor\.projectRange/);
  });

  test('runtime package-private imports stay relative inside plitejs', () => {
    const packageJson = readPackageJson();
    const runtimeSources = [
      'packages/plitejs/src/react/editable/runtime-editor-api.ts',
      'packages/plitejs/src/react/editable/runtime-repair-engine.ts',
      'packages/plitejs/src/react/hooks/use-plite-runtime.tsx',
    ]
      .map((file) => readFileSync(resolve(repoRoot, file), 'utf-8'))
      .join('\n');

    expect(runtimeSources).toContain("from '../../internal'");
    expect(runtimeSources).toContain("from '../../dom/internal'");
    expect(packageJson.exports).not.toHaveProperty('./internal');
    expect(packageJson.exports).not.toHaveProperty('./dom/internal');
    expect(packageJson.exports).not.toHaveProperty('./react/internal');
  });

  test('subpaths are not package dependencies', () => {
    const packageJson = readPackageJson();
    const dependencyNames = Object.keys(packageJson.dependencies ?? {});

    expect(dependencyNames.some((name) => name.startsWith('plitejs/'))).toBe(
      false
    );
  });

  test('runtime lodash subpath imports stay resolvable from built ESM', () => {
    const runtimeSelectionEngine = readFileSync(
      resolve(reactSourceRoot, 'editable/runtime-selection-engine.ts'),
      'utf-8'
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
        'packages/plitejs/src/react/hooks/use-generic-selector.tsx'
      ),
      'utf-8'
    );

    expect(contents).toMatch(/\buseSyncExternalStore\b/);
    expect(contents).not.toMatch(/\buseReducer\b/);
  });

  test('generic Plite selectors have an explicit ownership inventory', () => {
    expectSurfaceInventory(
      /\buseEditorSelector\(/g,
      ['packages/plitejs/src/react'],
      {
        'packages/plitejs/src/react/editable/root-selector-sources.ts': {
          count: 6,
          next: 'root-source',
          owner: 'Editable root selector sources',
          rationale:
            'Top-level node keys, root document epoch, selected top-level index, selection paths, placeholder visibility, and the editable root commit wakeup are owned by named root source selectors.',
        },
        'packages/plitejs/src/react/hooks/use-node-selector.tsx': {
          count: 1,
          next: 'runtime-wrapper',
          owner: 'Runtime node selector wrapper',
          rationale:
            'Public node/text selectors intentionally delegate through one model-truth selector wrapper.',
        },
        'packages/plitejs/src/react/hooks/use-element-selected.ts': {
          count: 1,
          next: 'public-hook',
          owner: 'Public selected hook',
          rationale:
            'The hook exposes selection state to app code through the public selector contract.',
        },
        'packages/plitejs/src/react/hooks/use-element-path.ts': {
          count: 1,
          next: 'public-hook',
          owner: 'Public element path hook',
          rationale:
            'The hook exposes path state to app code without adding path back to render props.',
        },
        'packages/plitejs/src/react/hooks/use-editor-selection.tsx': {
          count: 1,
          next: 'public-hook',
          owner: 'Public selection hook',
          rationale:
            'The hook exposes editor selection through the public selector contract.',
        },
        'packages/plitejs/src/react/dom-strategy/segment-placeholder.tsx': {
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
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const exampleViolations = listSourceFiles(['site/examples/ts']).flatMap(
      (absolutePath) => {
        const contents = readFileSync(absolutePath, 'utf-8');

        return /\b(?:VoidElement|InlineVoidElement)\b/.test(contents)
          ? [relative(repoRoot, absolutePath)]
          : [];
      }
    );

    expect(packageIndex).not.toMatch(/\bVoidElement\b/);
    expect(packageIndex).not.toMatch(/\bInlineVoidElement\b/);
    expect(packageIndex).not.toMatch(/\bPliteSpacer\b/);
    expect(exampleViolations).toEqual([]);
  });

  test('public host authoring uses installed DOM capabilities', () => {
    const packageIndex = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const publicHostStaticCalls = listSourceFiles([
      'docs/api',
      'docs/concepts',
      'docs/libraries',
      'docs/walkthroughs',
      'site/examples/ts',
    ]).flatMap((absolutePath) => {
      const contents = readFileSync(absolutePath, 'utf-8');

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
        const contents = readFileSync(absolutePath, 'utf-8');

        return /\binitialValue=/.test(contents)
          ? [relative(repoRoot, absolutePath)]
          : [];
      }
    );
    const valueReplaceInventory = Object.fromEntries(
      exampleFiles
        .map((absolutePath) => {
          const contents = readFileSync(absolutePath, 'utf-8');
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

      expect(contents).toMatch(/from '@platejs\/plite'/);
      expect(contents).toMatch(/from '@platejs\/plite-react'/);
      expect(contents).toMatch(/\bAnchor\b/);
      expect(contents).toMatch(/\busePliteAnnotationStore\b/);
      expect(contents).toMatch(/\busePliteAnnotations\b/);
      expect(contents).toMatch(/\bannotationStore=/);
      expect(contents).not.toMatch(
        /(?:createPliteProjectionStore|ProjectionContext|projection-store|usePliteProjectionEntries|from 'plite-react\/src)/
      );
    }
  });

  test('Plite React transient rendering docs expose simple and scalable public paths', () => {
    const docFiles = [
      'content/docs/plite/libraries/plite-react/annotations.mdx',
      'content/docs/plite/libraries/plite-react/editable.mdx',
      'content/docs/plite/libraries/plite-react/hooks.mdx',
      'content/docs/plite/libraries/plite-react/plite.mdx',
    ] as const;

    if (!allRepoFilesExist(docFiles)) {
      const packageReadme = readFileSync(reactDocsIndexPath, 'utf-8');
      const packageIndex = readFileSync(
        resolve(reactSourceRoot, 'index.ts'),
        'utf-8'
      );

      expect(packageReadme).toContain('Decoration sources, annotation stores');
      expect(packageReadme).toContain('DOM coverage boundaries');
      expect(packageIndex).toContain('usePliteAnnotationStore');
      expect(packageIndex).toContain('usePliteAnnotations');
      expect(packageIndex).toContain('usePliteWidgetStore');
      expect(packageIndex).toContain('usePliteWidgets');
      expect(packageIndex).not.toMatch(
        /(?:createPliteProjectionStore|ProjectionContext|from 'plite-react\/src)/
      );
      return;
    }

    const docs = {
      annotations: readFileSync(
        resolve(
          repoRoot,
          'content/docs/plite/libraries/plite-react/annotations.mdx'
        ),
        'utf-8'
      ),
      editable: readFileSync(
        resolve(
          repoRoot,
          'content/docs/plite/libraries/plite-react/editable.mdx'
        ),
        'utf-8'
      ),
      hooks: readFileSync(
        resolve(repoRoot, 'content/docs/plite/libraries/plite-react/hooks.mdx'),
        'utf-8'
      ),
      plite: readFileSync(
        resolve(repoRoot, 'content/docs/plite/libraries/plite-react/plite.mdx'),
        'utf-8'
      ),
    };
    const joinedDocs = Object.values(docs).join('\n');

    expect(docs.editable).toMatch(/\bdecorate\?:/);
    expect(docs.editable).toMatch(/\bEditable\.decorate\b/);
    expect(docs.plite).toMatch(/\bdecorationSources\b/);
    expect(docs.plite).toMatch(/\busePliteDecorationSource\b/);
    expect(docs.plite).toContain('Widget stores are hook-owned.');
    expect(docs.plite).toContain('`widgetStore` prop');
    expect(docs.annotations).toMatch(/\busePliteAnnotationStore\b/);
    expect(docs.annotations).toMatch(/\busePliteAnnotations\b/);
    expect(docs.annotations).toContain(
      'usePliteAnnotationStore(editor, annotations)'
    );
    expect(docs.annotations).toMatch(/\btype PliteWidgetTarget\b/);
    expect(docs.annotations).toMatch(/\busePliteWidgetStore\b/);
    expect(docs.annotations).toMatch(/\busePliteWidgetIds\(widgetStore\)/);
    expect(docs.annotations).toMatch(/\busePliteWidgetGeometry\b/);
    expect(docs.hooks).toMatch(/\busePliteWidgetStore\b/);
    expect(docs.hooks).toMatch(/\busePliteWidgets\b/);
    expect(docs.hooks).toMatch(/\buseSelectionGeometry\b/);
    expect(docs.hooks).toContain('revision: mutableAnnotationsRevision');
    expect(docs.hooks).toContain('usePliteWidgetStore(editor, widgets, {');
    expect(joinedDocs).not.toMatch(
      /(?:annotationsOrOptions|project:\s*\(\)\s*=>|deps:\s*\[comments\])/
    );
    expect(joinedDocs).not.toMatch(
      /(?:createPliteProjectionStore|ProjectionContext|from 'plite-react\/src)/
    );
  });

  test('beginner rendering docs teach raw render props without callback memoization', () => {
    const docFiles = [
      'docs/concepts/09-rendering.md',
      'content/docs/plite/walkthroughs/03-defining-custom-elements.mdx',
      'content/docs/plite/walkthroughs/04-applying-custom-formatting.mdx',
      'content/docs/plite/walkthroughs/05-executing-commands.mdx',
      'docs/walkthroughs/09-performance.md',
    ] as const;
    const docs = docFiles
      .map((file) => readRepoFileIfExists(file))
      .filter((contents): contents is string => contents !== null)
      .join('\n');

    if (docs.length === 0) {
      const packageReadme = readFileSync(reactDocsIndexPath, 'utf-8');

      expect(packageReadme).toMatch(/\brenderElement\b/);
      expect(packageReadme).toMatch(/\buseEditor\b/);
      expect(packageReadme).not.toMatch(/\beditableRenderers\b/);
      return;
    }

    expect(docs).toMatch(/\brenderElement\b/);
    expect(docs).toMatch(/\buseEditor\b/);
    expect(docs).not.toMatch(/\bcreateReactEditor\b/);
    expect(docs).not.toMatch(/\buseState\(\(\) =>/);
    expect(docs).not.toMatch(/\buseCallback\b/);
    expect(docs).not.toMatch(/\beditableRenderers\b/);
  });

  test('typescript concept docs teach React value generics through useEditor', () => {
    const docs = readRepoFileIfExists('docs/concepts/12-typescript.md');

    if (docs === null) {
      const genericContract = readFileSync(
        resolve(packageRoot, 'test/react/generic-react-editor-contract.tsx'),
        'utf-8'
      );

      expect(genericContract).toMatch(/\bEditor<CustomValue>/);
      expect(genericContract).toMatch(/\buseEditor\b/);
      return;
    }

    expect(docs).toMatch(/\buseEditor<CustomValue>/);
    expect(docs).toMatch(/\btype CustomEditor = Editor<CustomValue>/);
    expect(docs).not.toMatch(/\bcreateReactEditor\b/);
    expect(docs).not.toMatch(/\buseState\(\(\) =>/);
  });

  test('adapter static namespaces stay out of the public root at runtime', () => {
    expect('ReactEditor' in PliteReact).toBe(false);
    expect('DOMEditor' in PliteReact).toBe(false);
    expect('withReact' in PliteReact).toBe(false);
    expect(typeof PliteReact.react).toBe('function');
    expect(typeof PliteReact.createEditor).toBe('function');
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
      expect(name in PliteReact).toBe(false);
    }
  });

  test('projection store machinery stays out of the public root at runtime', () => {
    for (const name of ['createPliteProjectionStore', 'isPliteSourceDirty']) {
      expect(name in PliteReact).toBe(false);
    }
  });

  test('raw overlay store constructors stay out of the public root at runtime', () => {
    for (const name of [
      'createPliteAnnotationStore',
      'createPliteWidgetStore',
    ]) {
      expect(name in PliteReact).toBe(false);
    }
  });

  test('raw decoration source constructors stay out of the public root at runtime', () => {
    for (const name of [
      'composeDecorationSources',
      'createDecorationSource',
      'createRangeDecorationSource',
    ]) {
      expect(name in PliteReact).toBe(false);
    }
  });

  test('text rendering internals stay out of the public root at runtime', () => {
    for (const name of [
      'DefaultPlaceholder',
      'EditableText',
      'TextString',
      'ZeroWidthString',
    ]) {
      expect(name in PliteReact).toBe(false);
    }
  });

  test('React hook aliases stay out of the public root at runtime', () => {
    for (const name of [
      'useComposing',
      'useElementIf',
      'useFocused',
      'useReadOnly',
      'useSelected',
      'usePliteSelection',
      'usePliteSelector',
      'usePliteStatic',
      'usePliteViewState',
      'usePliteViewEffect',
      'usePliteProjections',
    ]) {
      expect(name in PliteReact).toBe(false);
    }

    for (const name of [
      'useEditorContext',
      'useEditorComposing',
      'useEditorFocused',
      'useOptionalEditorReadOnly',
      'useEditorReadOnly',
      'useEditorRuntimeState',
      'useEditorSelection',
      'useEditorSelector',
      'useEditorState',
      'useEditorViewState',
      'useElement',
      'useElementSelected',
      'usePliteProjectionEntries',
    ]) {
      expect(typeof PliteReact[name as keyof typeof PliteReact]).toBe(
        'function'
      );
    }
  });

  test('outer read-only provider supports shell consumers before Plite', () => {
    const Probe = () => (
      <span data-testid="read-only">
        {String(PliteReact.useOptionalEditorReadOnly())}/
        {String(PliteReact.useEditorReadOnly())}
      </span>
    );

    const { getByTestId, rerender } = render(<Probe />);

    expect(getByTestId('read-only').textContent).toBe('undefined/false');

    rerender(
      <PliteReact.EditorReadOnlyProvider readOnly>
        <Probe />
      </PliteReact.EditorReadOnlyProvider>
    );

    expect(getByTestId('read-only').textContent).toBe('true/true');

    rerender(
      <PliteReact.EditorReadOnlyProvider readOnly={false}>
        <Probe />
      </PliteReact.EditorReadOnlyProvider>
    );

    expect(getByTestId('read-only').textContent).toBe('false/false');
  });

  test('hook docs explain runtime and root editor names without aliases', () => {
    const hooks =
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/hooks.mdx'
      ) ?? readFileSync(reactDocsIndexPath, 'utf-8');

    if (
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/hooks.mdx'
      ) !== null
    ) {
      expect(hooks).toContain('Runtime hooks read the whole editor runtime.');
      expect(hooks).toContain('Create one component-owned editor.');
      expect(hooks).toContain(
        'Get the editor from the nearest `Plite` provider.'
      );
      expect(hooks).toContain('usePliteProjectionEntries<T>(nodeKey)');
      expect(hooks).toContain(
        'UI should use decoration sources, annotation stores, or widget stores first.'
      );
      expect(hooks).toContain('Root state hooks read one root.');
      expect(hooks).toContain(
        'Root editor hooks return a command-capable editor for one root.'
      );
      expect(hooks).toContain(
        'Shared selector options are `equalityFn`, `shouldUpdate`, and `deferred`.'
      );
      expect(hooks).toContain('Prefer `usePliteRootEditor(root)`');
      expect(hooks).toContain('Pass `{ readOnly:');
      expect(hooks).toContain('Pass `root` to target one root.');
      expect(hooks).toContain("`focusPolicy: 'preserve'`");
      expect(hooks).toContain("default is `focus: 'preserve'`.");
    }

    expect(hooks).toContain('usePliteRootState');
    expect(hooks).toContain('usePliteRootEffect');
    expect(hooks).not.toContain('preserve-dom');
    expect(hooks).not.toContain('usePliteViewState');
    expect(hooks).not.toContain('usePliteViewEffect');
  });

  test('package README names the current runtime and root hook family', () => {
    const readme = [
      readFileSync(reactDocsIndexPath, 'utf-8'),
      readFileSync(
        resolve(repoRoot, 'content/docs/plite/libraries/plite-react/hooks.mdx'),
        'utf-8'
      ),
    ].join('\n');

    expect(readme).toContain(
      'Start with `useEditor`, `Plite`, and `Editable`.'
    );
    expect(readme).toContain(
      'import { Plite, Editable, useEditor } from "plitejs/react";'
    );
    for (const name of [
      'usePliteRuntimeState',
      'usePliteRootState',
      'usePliteRootEditor',
      'usePliteActiveEditor',
      'usePliteCommand',
      'usePliteRootEffect',
    ]) {
      expect(readme).toContain(name);
    }
    expect(readme).not.toContain('usePliteViewState');
    expect(readme).not.toContain('usePliteViewEffect');
  });

  test('public hook source JSDoc keeps the beta hover contract explicit', () => {
    const hookSources = {
      editor: readFileSync(
        resolve(reactSourceRoot, 'hooks/use-editor.ts'),
        'utf-8'
      ),
      history: readFileSync(
        resolve(reactSourceRoot, 'hooks/use-plite-history.ts'),
        'utf-8'
      ),
      runtime: readFileSync(
        resolve(reactSourceRoot, 'hooks/use-plite-runtime.tsx'),
        'utf-8'
      ),
      stateField: readFileSync(
        resolve(reactSourceRoot, 'hooks/use-state-field.ts'),
        'utf-8'
      ),
    };

    expect(hookSources.editor).toContain('component or custom hook');
    expect(hookSources.editor).toContain(
      '`initialValue` seeds the editor once'
    );
    expect(hookSources.editor).toContain('Use `createEditor`');
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
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
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

      const sourceBase = resolve(reactSourceRoot, sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

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
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
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

      const sourceBase = resolve(reactSourceRoot, sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

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
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
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

      const sourceBase = resolve(reactSourceRoot, sourceSpecifier);
      const sourcePath = existsSync(`${sourceBase}.tsx`)
        ? `${sourceBase}.tsx`
        : `${sourceBase}.ts`;
      const source = readFileSync(sourcePath, 'utf-8');

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
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/index.mdx'
      ) ?? readFileSync(reactDocsIndexPath, 'utf-8');

    if (
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/index.mdx'
      ) !== null
    ) {
      expect(readme).toContain(
        'subscribe to editor state, runtime state, roots'
      );
      expect(readme).toContain('runtime/root hooks and widget hooks');
    } else {
      expect(readme).toContain('Common hooks include');
      expect(readme).toContain('usePliteRuntimeState');
    }

    expect(readme).not.toContain('usePliteViewState');
    expect(readme).not.toContain('usePliteViewEffect');
  });

  test('plite-react docs name public render primitives and advanced helper hooks', () => {
    const packageReadme = readFileSync(reactDocsIndexPath, 'utf-8');
    const packageIndex = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const libraryReadme =
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/index.mdx'
      ) ?? packageReadme;
    const hooks =
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/hooks.mdx'
      ) ?? packageReadme;

    for (const name of [
      'PliteElement',
      'PliteText',
      'PliteLeaf',
      'PlitePlaceholder',
    ]) {
      expect(packageReadme).toContain(name);
      expect(libraryReadme).toContain(name);
    }

    for (const name of [
      'usePliteNodeRef',
      'useDOMStrategyVirtualOffset',
      'usePliteRangeDecorationSource',
    ]) {
      expect(packageReadme).toContain(name);
      expect(libraryReadme).toContain(name);
      expect(hooks).toContain(name);
    }

    if (
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/hooks.mdx'
      ) !== null
    ) {
      expect(hooks).toContain('PliteRangeDecorationSourceOptions');
    } else {
      expect(packageIndex).toContain('PliteRangeDecorationSourceOptions');
    }
  });

  test('undocumented root type exports stay explicitly classified', () => {
    const docsFiles = listSourceFiles([
      'content/docs/plite/libraries/plite-react',
    ]);
    const docs = [...docsFiles, reactDocsIndexPath]
      .map((absolutePath) => readFileSync(absolutePath, 'utf-8'))
      .join('\n');
    const undocumentedTypeExports = getRootTypeExports().filter((name) => {
      const pattern = new RegExp(`\\b${name}\\b`);

      return !pattern.test(docs);
    });

    if (docsFiles.length === 0) {
      expect(getRootTypeExports()).toContain('EditableProps');
      expect(getRootTypeExports()).toContain('UsePliteRootEditorOptions');
      expect(undocumentedTypeExports).toContain('EditableProps');
      return;
    }

    expect(undocumentedTypeExports).toEqual(documentedAsGroupedRootTypeExports);
  });

  test('public root exports canonical Editable and render prop names without aliases', () => {
    const packageIndex = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const editableRootSource = readFileSync(
      resolve(reactSourceRoot, 'components/editable.tsx'),
      'utf-8'
    );

    expect(packageIndex).not.toMatch(
      /\bas\s+(?:Editable|Render|EditableProps)/
    );
    expect(packageIndex).not.toMatch(
      /\b(?:EditableTextBlocks|EditableTextBlocksProps|EditableRenderElementProps|EditableRenderVoidProps|EditableTextLeafProps|EditableTextRenderTextProps|EditableTextRenderPlaceholderProps)\b/
    );
    expect(packageIndex).not.toMatch(
      /\b(?:PliteViewBoundary|usePliteViewSelection)\b/
    );
    expect(editableRootSource).not.toMatch(
      /\bexport interface Render(?:Element|Leaf|Text)Props\b/
    );

    for (const name of [
      'EditableTextBlocks',
      'usePliteViewState',
      'usePliteViewEffect',
    ]) {
      expect(name in PliteReact).toBe(false);
    }

    for (const name of [
      'Editable',
      'usePliteRootState',
      'usePliteRootEffect',
    ]) {
      expect(typeof PliteReact[name as keyof typeof PliteReact]).toBe(
        'function'
      );
    }
  });

  test('public/internal runtime aliases stay hard-cut', () => {
    const packageIndex = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
    );
    const annotationStoreSource = readFileSync(
      resolve(reactSourceRoot, 'annotation-store.ts'),
      'utf-8'
    );
    const runtimeAndroidSource = readFileSync(
      resolve(reactSourceRoot, 'editable/runtime-android-engine.ts'),
      'utf-8'
    );
    const runtimeHooksSource = readFileSync(
      resolve(reactSourceRoot, 'hooks/use-plite-runtime.tsx'),
      'utf-8'
    );
    const domCoverageBoundarySource = readFileSync(
      resolve(reactSourceRoot, 'components/dom-coverage-boundary.tsx'),
      'utf-8'
    );

    expect(packageIndex).not.toContain('PliteAnnotationStoreRefreshOptions');
    expect(annotationStoreSource).not.toMatch(
      /type PliteAnnotationStoreRefreshOptions\b/
    );
    expect(runtimeAndroidSource).not.toMatch(
      /type RuntimeAndroidInputManager\b/
    );
    expect(domCoverageBoundarySource).not.toMatch(
      /type DOMCoverageSelfBoundaryProps\b/
    );
    expect(runtimeHooksSource).not.toMatch(
      /type UsePliteRootEditorOptions = Pick<EditorViewOptions/
    );
    expect(runtimeHooksSource).toContain('readOnly?: boolean');
  });

  test('renderElement slots expose contentBoundary without unstable aliases', () => {
    const editableSource = readFileSync(
      resolve(reactSourceRoot, 'components/editable-text-blocks.tsx'),
      'utf-8'
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
      resolve(reactSourceRoot, 'dom-strategy/create-segment-plan.ts'),
      'utf-8'
    );
    const editableSource = readFileSync(
      resolve(reactSourceRoot, 'components/editable-text-blocks.tsx'),
      'utf-8'
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
      resolve(reactSourceRoot, 'components/editable-text-blocks.tsx'),
      'utf-8'
    );
    const editableRootSource = readFileSync(
      resolve(reactSourceRoot, 'components/editable.tsx'),
      'utf-8'
    );
    const packageIndex = readFileSync(
      resolve(reactSourceRoot, 'index.ts'),
      'utf-8'
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
    expect(editableSource).toContain('onDOMStrategyMetrics?:');
    expect(editableSource).not.toContain('layout?: EditableLayout | null');
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
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/editable.mdx'
      ) ??
      readFileSync(
        resolve(reactSourceRoot, 'components/editable-text-blocks.tsx'),
        'utf-8'
      );

    expect(docs).toContain('decorateDirtiness?: PliteSourceDirtiness');
    expect(docs).toContain(
      'decorateRuntimeScope?: PliteProjectionRuntimeScope'
    );
    expect(docs).not.toContain('layout?: EditableLayout | null');
    if (
      readRepoFileIfExists(
        'content/docs/plite/libraries/plite-react/editable.mdx'
      ) !== null
    ) {
      expect(docs).toContain(
        'When a layout runtime owns page virtualization, pass its immutable mount data'
      );
      expect(docs).toContain('defaults to `defaultScrollSelectionIntoView`');
    }

    expect(docs).toContain("type: 'virtualized'");
    expect(docs).toContain('"data-plite-node-key": NodeKey');
    expect(docs).toContain('isInline: boolean');
    expect(docs).toContain('slots: EditableElementSlots');
  });

  test('Editable DOM strategy option objects normalize through primitive fields', () => {
    const editableSource = readFileSync(
      resolve(reactSourceRoot, 'components/editable-text-blocks.tsx'),
      'utf-8'
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
        resolve(reactSourceRoot, 'hooks/use-editor.ts'),
        'utf-8'
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
      'content/docs/plite/libraries/plite-react/editable.mdx'
    );

    if (
      tables === null ||
      markdown === null ||
      richtext === null ||
      editableDocs === null
    ) {
      const projectedCommandContract = readFileSync(
        resolve(packageRoot, 'test/react/projected-command-contract.test.ts'),
        'utf-8'
      );

      expect(projectedCommandContract).toMatch(/\bdefineExtension\b/);
      expect(projectedCommandContract).toMatch(/\btx\./);
      return;
    }

    expect(tables).toMatch(/\bdefineExtension\b/);
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
        const source = readFileSync(absolutePath, 'utf-8');
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
    const editor = createEditor({ initialValue });

    const defaultRender = render(
      <Plite editor={editor}>
        <Editable />
      </Plite>
    );

    expect(
      defaultRender.container
        .querySelector('[data-plite-editor]')
        ?.getAttribute('translate')
    ).toBe('no');

    defaultRender.rerender(
      <Plite editor={editor}>
        <Editable translate="yes" />
      </Plite>
    );

    expect(
      defaultRender.container
        .querySelector('[data-plite-editor]')
        ?.getAttribute('translate')
    ).toBe('yes');
  });

  test('Editable consumes raw element, leaf, text, segment, and void render props', () => {
    const editor = createEditor({
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

    editor.install(blockVoidSchema);

    const rendered = render(
      <Plite editor={editor}>
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
      </Plite>
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
    const editor = createEditor({
      initialValue: [{ type: 'block', children: [{ text: 'test' }] }],
    });
    const mounts = jest.fn();

    const RenderElement = ({ children }: RenderElementProps) => {
      useEffect(() => mounts(), []);
      return <div>{children}</div>;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.split({ at: { path: [0, 0], offset: 2 } });
      });
    });

    expect(mounts).toHaveBeenCalledTimes(2);
    rendered.unmount();

    const mergeEditor = createEditor({
      initialValue: [
        { type: 'block', children: [{ text: 'te' }] },
        { type: 'block', children: [{ text: 'st' }] },
      ],
    });
    const mergeMounts = jest.fn();

    const MergeRenderElement = ({ children }: RenderElementProps) => {
      useEffect(() => mergeMounts(), []);
      return <div>{children}</div>;
    };

    render(
      <Plite editor={mergeEditor}>
        <Editable renderElement={MergeRenderElement} />
      </Plite>
    );

    await act(async () => {
      mergeEditor.update((tx) => {
        tx.nodes.merge({ at: { path: [0, 0], offset: 0 } });
      });
    });

    expect(mergeMounts).toHaveBeenCalledTimes(2);
  });

  test('parent attribute changes do not remount child element renderers', async () => {
    const editor = createEditor({
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

    const RenderElement = ({ children, element }: RenderElementProps) => {
      const { type } = element as { type?: string };

      useEffect(() => {
        if (type !== 'child') {
          return undefined;
        }

        childMounts();
        return () => childUnmounts();
      }, [type]);

      return <div data-type={type}>{children}</div>;
    };

    render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
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
    const editor = createEditor({
      initialValue: [
        {
          id: '0',
          children: [
            { id: '0.0', children: [{ text: '' }], type: 'paragraph' },
            { id: '0.1', children: [{ text: '' }], type: 'paragraph' },
            { id: '0.2', children: [{ text: '' }], type: 'paragraph' },
          ],
          type: 'section',
        },
        { id: '1', children: [{ text: '' }], type: 'paragraph' },
        { id: '2', children: [{ text: '' }], type: 'paragraph' },
      ],
    }) as ReactRuntimeEditor;
    const elementSelectedRenders: Record<string, boolean[] | undefined> = {};
    const latestElementSelected: Record<string, boolean | undefined> = {};

    const RenderElement = createElementSelectedHistoryRenderElement({
      history: elementSelectedRenders,
      latest: latestElementSelected,
    });

    render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
    );

    Object.values(elementSelectedRenders).forEach((selectedRenders) => {
      selectedRenders?.splice(0);
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
      selectedRenders?.splice(0);
    });

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          { id: 'new', children: [{ text: '' }], type: 'paragraph' } as never,
          { at: [2] }
        );
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
    const editor = createEditor({
      initialValue: [
        { id: 'first', children: [{ text: '' }], type: 'paragraph' },
        { id: 'target', children: [{ text: '' }], type: 'paragraph' },
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
      <Plite editor={editor}>
        <Editable renderElement={renderElement} />
      </Plite>
    );

    expect(readTargetPath()).toEqual([1]);
    renderCounts.first = 0;
    renderCounts.target = 0;

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.insert(
          {
            id: 'inserted',
            children: [{ text: '' }],
            type: 'paragraph',
          } as never,
          { at: [0] }
        );
      });
    });

    expect(renderCounts.target ?? 0).toBe(0);
    expect(readTargetPath()).toEqual([2]);
  });

  test('renderVoid receives content-only props and runtime owns block void shell', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'image', url: 'about:blank', children: [{ text: '' }] },
      ],
    }) as ReactRuntimeEditor;
    let renderVoidProps: RenderVoidProps | null = null;
    const renderElement = jest.fn(({ children }: RenderElementProps) => (
      <p>{children}</p>
    ));

    editor.install(blockVoidSchema);

    const renderVoid = (props: RenderVoidProps) => {
      renderVoidProps = props;

      return <img alt="" height={1} src="about:blank" width={1} />;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} renderVoid={renderVoid} />
      </Plite>
    );

    const voidElement = rendered.container.querySelector(
      '[data-plite-node="element"][data-plite-void="true"]'
    );
    const spacer = rendered.container.querySelector('[data-plite-spacer]');
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
    const zeroWidth = spacer?.querySelector('[data-plite-zero-width]');

    expect(zeroWidth).toHaveAttribute('data-plite-zero-width', 'z');
    expect(zeroWidth?.querySelector('br')).toBeNull();
  });

  test('renderElement owns void nodes when renderVoid is omitted', () => {
    const editor = createEditor({
      initialValue: [
        { type: 'image', url: 'about:blank', children: [{ text: '' }] },
      ],
    }) as ReactRuntimeEditor;
    const renderElement = jest.fn(
      ({ attributes, children, element }: RenderElementProps) => (
        <figure {...attributes} data-renderer={element.type}>
          {children}
        </figure>
      )
    );

    editor.install(blockVoidSchema);

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} />
      </Plite>
    );

    const image = rendered.container.querySelector('[data-renderer="image"]');
    const spacer = image?.querySelector('[data-plite-spacer]');

    expect(renderElement).toHaveBeenCalledTimes(1);
    expect(image).toHaveAttribute('data-plite-node', 'element');
    expect(image).toHaveAttribute('data-plite-void', 'true');
    expect(spacer).toHaveStyle({
      height: '0px',
      position: 'absolute',
    });
    const zeroWidth = spacer?.querySelector('[data-plite-zero-width]');

    expect(zeroWidth).toHaveAttribute('data-plite-zero-width', 'z');
    expect(zeroWidth?.querySelector('br')).toBeNull();
  });

  test('editable-island void content keeps classic void chrome while nested editors stay focusable', () => {
    const editor = createEditor({
      initialValue: [
        {
          type: 'editable-card',
          children: [{ text: '' }],
        },
      ],
    }) as ReactRuntimeEditor;

    editor.install(editableIslandSchema);

    const rendered = render(
      <Plite editor={editor}>
        <Editable
          renderVoid={() => (
            <div data-renderer="editable-card">
              <div contentEditable={false}>Controls</div>
              <div contentEditable>Nested editor target</div>
            </div>
          )}
        />
      </Plite>
    );

    const card = rendered.container.querySelector(
      '[data-renderer="editable-card"]'
    );
    const spacer = rendered.container.querySelector('[data-plite-spacer]');

    expect(card?.parentElement?.getAttribute('contenteditable')).toBe('false');
    expect(
      card
        ?.closest('[data-plite-node="element"][data-plite-void="true"]')
        ?.getAttribute('draggable')
    ).toBe('true');
    expect(card?.querySelector('[contenteditable="false"]')?.textContent).toBe(
      'Controls'
    );
    expect(card?.querySelector('[contenteditable="true"]')).toBeTruthy();
    const zeroWidth = spacer?.querySelector('[data-plite-zero-width]');

    expect(zeroWidth).toHaveAttribute('data-plite-zero-width', 'z');
    expect(zeroWidth?.querySelector('br')).toBeNull();
  });

  test('renderVoid receives content-only props and runtime owns inline void anchor', () => {
    const editor = createEditor({
      extensions: [inlineVoidSchema],
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

    const renderElement = jest.fn(({ children }: RenderElementProps) => (
      <p>{children}</p>
    ));

    const renderVoid = (props: RenderVoidProps) => {
      renderVoidProps = props;

      return <span data-cy="visible-mention">@R2-D2</span>;
    };

    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} renderVoid={renderVoid} />
      </Plite>
    );

    const mention = rendered.container.querySelector(
      '[data-plite-inline="true"][data-plite-void="true"]'
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
    expect(mention?.querySelector('[data-plite-zero-width]')).toBeTruthy();
  });
});
