'use client';

import {
  Provider as JotaiProvider,
  atom as createJotaiAtom,
  useAtomValue,
} from 'jotai';
import { useHydrateAtoms } from 'jotai/utils';
import { createStore as createJotaiStore } from 'jotai/vanilla';
import {
  getPlateRuntime,
  defineExtension,
  property,
  schema,
  type Element as PliteElement,
  ElementIdPlugin,
  migrateElementIds,
  type Descendant,
  type Path,
  type RenderElementProps,
  type Value,
} from 'platejs';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  HeadingPlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  KbdPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  BelowRootNodes,
  ElementProvider,
  createAtomStore,
  createZustandStore,
  getRenderNodeProps,
  pipeRenderElement,
  pipeRenderLeaf,
  pipeRenderText,
  pluginRenderElement,
  pluginRenderLeaf,
  PlateContent,
  Plate,
  PlateElement,
  PlateLeaf,
  definePlatePlugin,
  createEditor,
  useEditor,
  useEditorSelector,
  useEditorState,
  useEditorValue,
  useElement,
  useElementSelector,
  usePath,
  useCreateEditor,
  usePluginStore,
  type Editor,
} from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { failInvariant } from '../../../lib/failInvariant';
import {
  CORE_PLUGIN_CENSUS_ENTRIES,
  type CorePluginCensusEntry,
  type CorePluginCensusEntryId,
  type EditorPerfPluginSetId,
} from './plugin-census';
import {
  SCENARIO_WORKLOADS,
  createBenchIdFactory,
  getDefaultElementIdFragmentBlockCount,
  getEditorPerfWorkloadValue,
  getElementIdFragmentBenchmarkData,
  getSeededEditorPerfWorkloadValue,
  type EditorPerfWorkloadId,
  type ElementIdFragmentBenchmarkKind,
  type ScenarioWorkloadId,
} from './workloads';

type BenchmarkConfig = {
  blocks: number;
  chunkSize: number;
  chunking: boolean;
  contentVisibility: 'chunk' | 'element' | 'none';
  scenarioWorkload: ScenarioWorkloadId;
};

const DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE = 1000;
const HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD =
  'huge-mixed-block' satisfies ScenarioWorkloadId;

const HUGE_DOCUMENT_BLOCK_OPTIONS = [
  2, 1000, 2500, 5000, 7500, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000,
  50_000, 100_000, 200_000,
];

const HUGE_DOCUMENT_CHUNK_SIZE_OPTIONS = [3, 10, 100, 1000];

const HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG: BenchmarkConfig = {
  blocks: 5000,
  chunking: true,
  chunkSize: DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE,
  contentVisibility: 'chunk',
  scenarioWorkload: HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD,
};

function getDocumentSearchParams() {
  if (typeof document === 'undefined') return null;

  return new URLSearchParams(document.location.search);
}

function parseNumber({
  defaultValue,
  key,
  searchParams,
}: {
  defaultValue: number;
  key: string;
  searchParams: URLSearchParams | null;
}) {
  return Number.parseInt(searchParams?.get(key) ?? '', 10) || defaultValue;
}

function parseBoolean({
  defaultValue,
  key,
  searchParams,
}: {
  defaultValue: boolean;
  key: string;
  searchParams: URLSearchParams | null;
}) {
  const value = searchParams?.get(key);

  if (value) return value === 'true';

  return defaultValue;
}

function parseEnum<T extends string>({
  defaultValue,
  key,
  options,
  searchParams,
}: {
  defaultValue: T;
  key: string;
  options: readonly T[];
  searchParams: URLSearchParams | null;
}) {
  const value = searchParams?.get(key) as T | null | undefined;

  if (value && options.includes(value)) return value;

  return defaultValue;
}

function replaceSearchParams(searchParams: URLSearchParams) {
  history.replaceState({}, '', `?${searchParams.toString()}`);
}

function getInitialHugeDocumentBenchmarkConfig(): BenchmarkConfig {
  const searchParams = getDocumentSearchParams();

  return {
    blocks: parseNumber({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.blocks,
      key: 'blocks',
      searchParams,
    }),
    chunking: parseBoolean({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.chunking,
      key: 'chunking',
      searchParams,
    }),
    chunkSize: parseNumber({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.chunkSize,
      key: 'chunk_size',
      searchParams,
    }),
    contentVisibility: parseEnum({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.contentVisibility,
      key: 'content_visibility',
      options: ['none', 'element', 'chunk'],
      searchParams,
    }),
    scenarioWorkload: parseEnum({
      defaultValue: HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG.scenarioWorkload,
      key: 'scenario_workload',
      options: SCENARIO_WORKLOADS.map(({ id }) => id),
      searchParams,
    }),
  };
}

function writeHugeDocumentBenchmarkSearchParams(config: BenchmarkConfig) {
  const searchParams = getDocumentSearchParams();

  if (!searchParams) return;

  searchParams.set('blocks', config.blocks.toString());
  searchParams.set('chunking', config.chunking ? 'true' : 'false');
  searchParams.set('chunk_size', config.chunkSize.toString());
  searchParams.set('content_visibility', config.contentVisibility);
  searchParams.set('scenario_workload', config.scenarioWorkload);
  replaceSearchParams(searchParams);
}

type RunnerBenchmarkName =
  | 'construction'
  | 'core-mount'
  | 'init-dissection'
  | 'element-id-fragment'
  | 'input'
  | 'mount'
  | 'plugin-census'
  | 'prebuilt-mount'
  | 'store-fanout';

type EditorPerfRunnerControls = {
  blocks: number;
  chunkSize: number;
  chunking: boolean;
  coreMountCase?: string;
  coreMountElementId?: string;
  fanoutSubscribers?: string;
  pluginCensusEntry?: CorePluginCensusEntryId | 'all';
  scenario?: ScenarioId;
  scenarioWorkload: ScenarioWorkloadId;
  visibility: BenchmarkConfig['contentVisibility'];
};

type EditorPerfRunnerHarness = {
  configure: (controls: EditorPerfRunnerControls) => Promise<void>;
  runBenchmark: (benchmark: RunnerBenchmarkName) => Promise<void>;
};

type BenchmarkResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  p99: number;
  stdDev: number;
};

type LatencyResult = {
  max: number;
  mean: number;
  median: number;
  min: number;
  p95: number;
  samples: number[];
};

type ScenarioId =
  | 'slate'
  | 'plate-core'
  | 'plate-core-element-id'
  | 'plate-core-element-id-seeded'
  | 'plate-basic'
  | 'plate-code-only';

type BenchmarkPlugins = EditorPerfPluginSetId;

type Scenario = {
  description: string;
  id: ScenarioId;
  label: string;
  elementId?: boolean;
  plugins: BenchmarkPlugins;
  kind: 'plate' | 'slate';
  seedIds?: boolean;
};

type ScenarioMetrics = {
  construction: BenchmarkResult | null;
  input: LatencyResult | null;
  mount: BenchmarkResult | null;
  prebuiltMount: BenchmarkResult | null;
};

type DissectionCaseId =
  | 'plate-core-element-id-off'
  | 'plate-core-element-id-raw'
  | 'plate-core-element-id-seeded'
  | 'plate-basic-element-id-off';

type DissectionCase = {
  description: string;
  id: DissectionCaseId;
  label: string;
  elementId: boolean;
  plugins: BenchmarkPlugins;
  seedIds: boolean;
};

type DissectionMetrics = {
  constructOnly: BenchmarkResult | null;
  createWithValue: BenchmarkResult | null;
  idsAssigned: BenchmarkResult | null;
  initOnly: BenchmarkResult | null;
  pluginCount: number | null;
  staticNormalize: BenchmarkResult | null;
};

type ElementIdFragmentCaseId =
  | 'plate-core-element-id-off-raw-import'
  | 'plate-core-element-id-raw-import'
  | 'plate-core-element-id-off-seeded-duplicate-paste'
  | 'plate-core-element-id-on-seeded-duplicate-paste';

type ElementIdFragmentCase = {
  description: string;
  fragmentKind: ElementIdFragmentBenchmarkKind;
  id: ElementIdFragmentCaseId;
  label: string;
  elementId: boolean;
};

type ElementIdFragmentMetrics = {
  fragmentReplace: BenchmarkResult | null;
  fragmentBlocks: number | null;
  idsAssigned: BenchmarkResult | null;
};

type FanoutCaseId =
  | 'none'
  | 'editor-state'
  | 'editor-value'
  | 'editor-selector'
  | 'plugin-store'
  | 'mixed';

type FanoutCase = {
  description: string;
  id: FanoutCaseId;
  label: string;
};

type FanoutMetrics = {
  mount: BenchmarkResult | null;
  update: BenchmarkResult | null;
  updateCommits: BenchmarkResult | null;
};

type PluginCensusLaneId = 'activated' | 'inactive';

type PluginCensusScenarioId = 'plate-core' | 'plugin' | 'slate';

type PluginCensusLaneMetrics = Record<
  PluginCensusScenarioId,
  BenchmarkResult | null
>;

type PluginCensusEntryMetrics = Record<
  PluginCensusLaneId,
  PluginCensusLaneMetrics
>;

type CoreMountCaseId =
  | 'provider-only'
  | 'provider-only-plain-context'
  | 'plite-only'
  | 'editable-static'
  | 'editable-element-plate-element-no-provider'
  | 'editable-element-plate-element-plugin-only-no-provider'
  | 'editable-element-plate-element-plugin-context-no-provider'
  | 'editable-element-pipe-plugin-precomputed-path'
  | 'editable-element-pipe-plugin-precomputed-no-below-root'
  | 'editable-element-pipe-bare-plain-fast-path'
  | 'editable-element-plugin-precomputed-no-element-hook'
  | 'editable-element-provider-only'
  | 'editable-element-provider-only-plain-context'
  | 'editable-element-provider-only-jotai-hydrate-only'
  | 'editable-element-provider-only-jotai-hydrate-sync'
  | 'editable-element-provider-only-jotai-provider'
  | 'editable-element-provider-only-zustand-provider'
  | 'editable-element-provider-prop-effect'
  | 'editable-element-provider-plate-element'
  | 'editable-element-plugin-render-node-hooks'
  | 'editable-element-plugin-render-node-hooks-plain-context'
  | 'editable-element-plugin-render-node-hooks-jotai-provider'
  | 'editable-element-plugin-render-node-hooks-jotai-hydrate-only'
  | 'editable-element-plugin-render-node-hooks-jotai-hydrate-sync'
  | 'editable-element-plugin-render-node-selector'
  | 'editable-element-plugin-render-node-selector-plain-context'
  | 'editable-element-plugin-render-node-selector-jotai-provider'
  | 'editable-element-plugin-precomputed-fast-node-props'
  | 'editable-element-plugin-precomputed-fast-node-props-jotai-hydrate-only'
  | 'editable-element-plugin-precomputed-fast-node-props-jotai-hydrate-sync'
  | 'editable-element-plugin-precomputed-fast-node-props-jotai-provider'
  | 'editable-element-plugin-precomputed-fast-node-props-zustand-provider'
  | 'editable-element-plugin-precomputed-fast-node-props-plain-context'
  | 'editable-element-render-as-no-provider'
  | 'editable-element-render-as-provider'
  | 'editable-element-plugin-precomputed-prop-effect'
  | 'editable-element-render-node-props-no-provider'
  | 'editable-element-pipe'
  | 'editable-element-pipe-render-as-basic'
  | 'editable-element-fallback-pipe'
  | 'editable-element-plugin-precomputed-path'
  | 'editable-leaf-text-bold-direct-renderers'
  | 'editable-leaf-text-bold-plugin-leaf-direct'
  | 'editable-leaf-text-bold-leaf-node-props'
  | 'editable-leaf-text-bold-plateleaf-direct'
  | 'editable-leaf-text-bold-leaf-pipe'
  | 'editable-leaf-text-bold-leaf-pipe-bold-only'
  | 'editable-leaf-text-bold-leaf-pipe-plain-outer'
  | 'editable-leaf-text-bold-pipe'
  | 'editable-leaf-text-bold-text-pipe'
  | 'editable-leaf-text-code-direct-renderers'
  | 'editable-leaf-text-code-plateleaf-direct'
  | 'editable-leaf-text-code-plugin-leaf-direct'
  | 'editable-leaf-text-code-pipe'
  | 'editable-leaf-text-code-text-pipe'
  | 'editable-leaf-text-underline-direct-renderers'
  | 'editable-leaf-text-underline-plugin-leaf-direct'
  | 'editable-leaf-text-underline-pipe'
  | 'editable-leaf-text-pipe'
  | 'editable-leaf-text-plain-renderers'
  | 'editable-render-pipes'
  | 'plate-content';

type CoreMountCase = {
  description: string;
  documentMode?:
    | 'blockquote-only'
    | 'bold-only'
    | 'code-only'
    | 'default'
    | 'paragraph-fallback'
    | 'underline-only';
  id: CoreMountCaseId;
  label: string;
  plugins?: 'basic' | 'bold-only' | 'code-only' | 'none' | 'underline-only';
};

type CoreMountElementIdMode = 'off' | 'seeded';

type CoreMountMetrics = {
  mountByElementIdMode: Record<CoreMountElementIdMode, BenchmarkResult | null>;
};

type PluginCensusSurface = {
  entryId: CorePluginCensusEntryId;
  lane: PluginCensusLaneId;
  scenarioId: PluginCensusScenarioId;
};

type FanoutEditorHandle = {
  triggerUpdate: () => void;
};

type BenchmarkEditorHandle = {
  focusEditable: () => Promise<void>;
  insertText: (text: string) => void;
  selectStart: () => void;
};

type BenchmarkEditor =
  | ReturnType<typeof createPluginCensusMountedEditor>
  | ReturnType<typeof createScenarioMountedEditor>;

type BenchElementStoreState = {
  element: PliteElement | null;
  entry: [PliteElement, Path] | null;
  path: Path | null;
};

const BLOCK_OPTIONS = HUGE_DOCUMENT_BLOCK_OPTIONS;
const CHUNK_SIZE_OPTIONS = Array.from(
  new Set([...HUGE_DOCUMENT_CHUNK_SIZE_OPTIONS, 500, 2000])
).sort((left, right) => left - right);
const FANOUT_SUBSCRIBER_OPTIONS = [0, 25, 100, 250, 500, 1000];
const BenchElementContext = React.createContext<any>(null);
const BenchZustandContext = React.createContext<any>(null);
const benchJotaiElementAtom = createJotaiAtom<PliteElement | null>(null);
const benchJotaiEntryAtom = createJotaiAtom<[PliteElement, Path] | null>(null);
const benchJotaiPathAtom = createJotaiAtom<Path | null>(null);
const benchJotaiAtoms = {
  element: benchJotaiElementAtom,
  entry: benchJotaiEntryAtom,
  path: benchJotaiPathAtom,
} as const;
const benchElementInitialState: BenchElementStoreState = {
  element: null,
  entry: null,
  path: null,
};

const { BenchElementNoEffectProvider } = createAtomStore(
  benchElementInitialState,
  {
    name: 'benchElementNoEffect' as const,
    suppressWarnings: true,
  }
);

const SCENARIOS: Scenario[] = [
  {
    description:
      'Bare Plate React editor with the same document and chunking knobs.',
    id: 'slate',
    kind: 'slate',
    label: 'Plate baseline',
    plugins: 'none',
  },
  {
    description:
      'Plate React wrapper only. No user plugins. Node IDs disabled.',
    id: 'plate-core',
    kind: 'plate',
    label: 'Plate core minimal',
    elementId: false,
    plugins: 'none',
  },
  {
    description: 'Plate React wrapper only. No user plugins. Node IDs enabled.',
    id: 'plate-core-element-id',
    kind: 'plate',
    label: 'Plate core + elementId',
    elementId: true,
    plugins: 'none',
  },
  {
    description:
      'Plate React wrapper only. No user plugins. Node IDs enabled on a document that already has ids.',
    id: 'plate-core-element-id-seeded',
    kind: 'plate',
    label: 'Plate core + elementId (seeded)',
    elementId: true,
    plugins: 'none',
    seedIds: true,
  },
  {
    description:
      'Plate plus the first real plugin tax: basic blocks and marks.',
    id: 'plate-basic',
    kind: 'plate',
    label: 'Plate basic plugins',
    elementId: false,
    plugins: 'basic',
  },
  {
    description:
      'Plate React wrapper plus CodePlugin only. This isolates the hard code mark lane without bold/italic fan-out.',
    id: 'plate-code-only',
    kind: 'plate',
    label: 'Plate code only',
    elementId: false,
    plugins: 'code-only',
  },
];

function getRunnerScenarios(scenarioId?: ScenarioId) {
  if (!scenarioId) return SCENARIOS;

  const scenario = SCENARIOS.find((item) => item.id === scenarioId);

  if (!scenario) {
    throw new Error(`Unknown editor perf scenario: ${scenarioId}`);
  }

  return [scenario];
}

function getInitialScenarioId() {
  return parseEnum({
    defaultValue: 'slate' as const,
    key: 'scenario',
    options: SCENARIOS.map(({ id }) => id),
    searchParams: getDocumentSearchParams(),
  });
}

const DISSECTION_CASES: DissectionCase[] = [
  {
    description:
      'Plate core without elementId. This is the closest thing to base wrapper tax.',
    id: 'plate-core-element-id-off',
    label: 'Plate core, elementId off',
    elementId: false,
    plugins: 'none',
    seedIds: false,
  },
  {
    description:
      'Plate core with default elementId behavior against the raw huge document.',
    id: 'plate-core-element-id-raw',
    label: 'Plate core, elementId raw',
    elementId: true,
    plugins: 'none',
    seedIds: false,
  },
  {
    description:
      'Plate core with elementId on a document that already has ids everywhere.',
    id: 'plate-core-element-id-seeded',
    label: 'Plate core, elementId pre-seeded',
    elementId: true,
    plugins: 'none',
    seedIds: true,
  },
  {
    description:
      'Plate basic plugins with elementId off to expose plugin-count tax without id work.',
    id: 'plate-basic-element-id-off',
    label: 'Plate basic, elementId off',
    elementId: false,
    plugins: 'basic',
    seedIds: false,
  },
];

const ELEMENT_ID_FRAGMENT_CASES: ElementIdFragmentCase[] = [
  {
    description:
      'Plate core without elementId, inserting a raw fragment with no ids. This is the baseline fragment.replace cost.',
    fragmentKind: 'raw-import',
    id: 'plate-core-element-id-off-raw-import',
    label: 'ElementId off, raw import',
    elementId: false,
  },
  {
    description:
      'Plate core with elementId, inserting a raw fragment with no ids. This isolates id assignment cost during import.',
    fragmentKind: 'raw-import',
    id: 'plate-core-element-id-raw-import',
    label: 'ElementId on, raw import',
    elementId: true,
  },
  {
    description:
      'Plate core without elementId, pasting a seeded fragment whose ids already exist in the destination document.',
    fragmentKind: 'seeded-duplicate-paste',
    id: 'plate-core-element-id-off-seeded-duplicate-paste',
    label: 'ElementId off, duplicate paste',
    elementId: false,
  },
  {
    description:
      'Plate core with elementId, pasting a seeded fragment whose ids already exist in the destination document. This is the real duplicate-id paste lane.',
    fragmentKind: 'seeded-duplicate-paste',
    id: 'plate-core-element-id-on-seeded-duplicate-paste',
    label: 'ElementId on, duplicate paste',
    elementId: true,
  },
];

const FANOUT_CASES: FanoutCase[] = [
  {
    description:
      'No extra benchmark subscribers. This is the baseline Plate update path.',
    id: 'none',
    label: 'No extra subscribers',
  },
  {
    description:
      'Many components reading tracked editor state through useEditorState().',
    id: 'editor-state',
    label: 'useEditorState',
  },
  {
    description:
      'Many components reading tracked editor value through useEditorValue().',
    id: 'editor-value',
    label: 'useEditorValue',
  },
  {
    description:
      'Many components reading a derived Jotai selector through useEditorSelector().',
    id: 'editor-selector',
    label: 'useEditorSelector',
  },
  {
    description:
      'Many components reading a plugin Zustand store through usePluginStore().',
    id: 'plugin-store',
    label: 'usePluginStore',
  },
  {
    description:
      'Each subscriber mixes tracked editor, tracked value, selector, and plugin store reads.',
    id: 'mixed',
    label: 'Mixed hook stack',
  },
];

function BenchElementProviderPropEffect({
  children,
  element,
  entry,
  path,
  scope,
}: React.PropsWithChildren<{
  element: PliteElement;
  entry: [PliteElement, Path];
  path: Path;
  scope?: string;
}>) {
  return (
    <BenchElementNoEffectProvider
      element={element}
      entry={entry}
      path={path}
      scope={scope}
    >
      {children}
    </BenchElementNoEffectProvider>
  );
}

function BenchJotaiStoreProvider({
  children,
  element,
  entry,
  path,
}: React.PropsWithChildren<BenchElementStoreState>) {
  const [store] = React.useState(() => {
    const nextStore = createJotaiStore();

    nextStore.set(benchJotaiElementAtom, element);
    nextStore.set(benchJotaiEntryAtom, entry);
    nextStore.set(benchJotaiPathAtom, path);

    return nextStore;
  });

  React.useLayoutEffect(() => {
    if (store.get(benchJotaiElementAtom) !== element) {
      store.set(benchJotaiElementAtom, element);
    }
    if (store.get(benchJotaiEntryAtom) !== entry) {
      store.set(benchJotaiEntryAtom, entry);
    }
    if (store.get(benchJotaiPathAtom) !== path) {
      store.set(benchJotaiPathAtom, path);
    }
  }, [element, entry, path, store]);

  return <JotaiProvider store={store}>{children}</JotaiProvider>;
}

function BenchHydrateOnlyAtoms({
  atoms,
  children,
  initialValues,
  store,
}: React.PropsWithChildren<{
  atoms: typeof benchJotaiAtoms;
  initialValues: Partial<BenchElementStoreState>;
  store: ReturnType<typeof createJotaiStore>;
}>) {
  const values: any[] = [];

  for (const key of Object.keys(atoms) as Array<keyof typeof atoms>) {
    const initialValue = initialValues[key];

    if (initialValue !== undefined) {
      values.push([atoms[key], initialValue]);
    }
  }

  useHydrateAtoms(values, { store });

  return <>{children}</>;
}

function BenchHydrateSyncAtoms({
  atoms,
  children,
  element,
  entry,
  path,
  store,
}: React.PropsWithChildren<
  BenchElementStoreState & {
    atoms: typeof benchJotaiAtoms;
    store: ReturnType<typeof createJotaiStore>;
  }
>) {
  const hydrateValues = React.useMemo(() => {
    const values: any[] = [];
    const state = { element, entry, path };

    for (const key of Object.keys(atoms) as Array<keyof typeof atoms>) {
      const value = state[key];

      if (value !== undefined) {
        values.push([atoms[key], value]);
      }
    }

    return values;
  }, [atoms, element, entry, path]);

  useHydrateAtoms(hydrateValues, { store });

  React.useLayoutEffect(() => {
    for (const [atom, value] of hydrateValues) {
      if (value !== undefined && value !== null) {
        store.set(atom, value);
      }
    }
  }, [hydrateValues, store]);

  return <>{children}</>;
}

function BenchJotaiHydrateOnlyProvider({
  children,
  element,
  entry,
  path,
}: React.PropsWithChildren<BenchElementStoreState>) {
  const [store] = React.useState(() => createJotaiStore());

  return (
    <JotaiProvider store={store}>
      <BenchHydrateOnlyAtoms
        atoms={benchJotaiAtoms}
        initialValues={{ element, entry, path }}
        store={store}
      >
        {children}
      </BenchHydrateOnlyAtoms>
    </JotaiProvider>
  );
}

function BenchJotaiHydrateSyncProvider({
  children,
  element,
  entry,
  path,
}: React.PropsWithChildren<BenchElementStoreState>) {
  const [store] = React.useState(() => createJotaiStore());

  return (
    <JotaiProvider store={store}>
      <BenchHydrateSyncAtoms
        atoms={benchJotaiAtoms}
        element={element}
        entry={entry}
        path={path}
        store={store}
      >
        {children}
      </BenchHydrateSyncAtoms>
    </JotaiProvider>
  );
}

function BenchZustandStoreProvider({
  children,
  element,
  entry,
  path,
}: React.PropsWithChildren<BenchElementStoreState>) {
  const [store] = React.useState(() =>
    createZustandStore(
      {
        element,
        entry,
        path,
      },
      {
        name: 'benchElementZustand',
      }
    )
  );

  React.useLayoutEffect(() => {
    const state = store.get('state');

    if (
      state.element !== element ||
      state.entry !== entry ||
      state.path !== path
    ) {
      store.set('state', { element, entry, path });
    }
  }, [element, entry, path, store]);

  return (
    <BenchZustandContext.Provider value={store}>
      {children}
    </BenchZustandContext.Provider>
  );
}

type BenchRenderNodeHookSource = 'element-provider' | 'jotai' | 'plain-context';

function BenchRenderNodeHookElementFromProvider({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const element = useElement();
  const path = usePath();
  const pathDepth = path.length;

  return (
    <p
      {...attributes}
      data-bench-depth={pathDepth || undefined}
      data-bench-type={element?.type ?? undefined}
    >
      {children}
    </p>
  );
}

function BenchRenderNodeHookElementFromPlainContext({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const plainContextValue = React.useContext(BenchElementContext);
  const element = plainContextValue?.element;
  const path = plainContextValue?.path;
  const pathDepth = path?.length ?? 0;

  return (
    <p
      {...attributes}
      data-bench-depth={pathDepth || undefined}
      data-bench-type={element?.type ?? undefined}
    >
      {children}
    </p>
  );
}

function BenchRenderNodeHookElementFromJotai({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const element = useAtomValue(benchJotaiElementAtom);
  const path = useAtomValue(benchJotaiPathAtom);
  const pathDepth = path?.length ?? 0;

  return (
    <p
      {...attributes}
      data-bench-depth={pathDepth || undefined}
      data-bench-type={element?.type ?? undefined}
    >
      {children}
    </p>
  );
}

function BenchRenderNodeHookElement({
  attributes,
  children,
  source,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  source: BenchRenderNodeHookSource;
}) {
  if (source === 'element-provider') {
    return (
      <BenchRenderNodeHookElementFromProvider attributes={attributes}>
        {children}
      </BenchRenderNodeHookElementFromProvider>
    );
  }

  if (source === 'plain-context') {
    return (
      <BenchRenderNodeHookElementFromPlainContext attributes={attributes}>
        {children}
      </BenchRenderNodeHookElementFromPlainContext>
    );
  }

  return (
    <BenchRenderNodeHookElementFromJotai attributes={attributes}>
      {children}
    </BenchRenderNodeHookElementFromJotai>
  );
}

type BenchRenderNodeSelectorSource =
  | 'element-provider'
  | 'jotai'
  | 'plain-context';

function BenchRenderNodeSelectorElementFromProvider({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const selected = useElementSelector(([element, path]) => ({
    pathDepth: path.length,
    type: element?.type,
  }));

  return (
    <p
      {...attributes}
      data-bench-depth={selected.pathDepth || undefined}
      data-bench-type={selected.type ?? undefined}
    >
      {children}
    </p>
  );
}

function BenchRenderNodeSelectorElementFromPlainContext({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const plainContextValue = React.useContext(BenchElementContext);
  const selected = React.useMemo(
    () => ({
      pathDepth: plainContextValue?.path?.length ?? 0,
      type: plainContextValue?.element?.type,
    }),
    [plainContextValue]
  );

  return (
    <p
      {...attributes}
      data-bench-depth={selected.pathDepth || undefined}
      data-bench-type={selected.type ?? undefined}
    >
      {children}
    </p>
  );
}

function BenchRenderNodeSelectorElementFromJotai({
  attributes,
  children,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const entry = useAtomValue(benchJotaiEntryAtom);
  const selected = React.useMemo(
    () => ({
      pathDepth: entry?.[1]?.length ?? 0,
      type: entry?.[0]?.type,
    }),
    [entry]
  );

  return (
    <p
      {...attributes}
      data-bench-depth={selected.pathDepth || undefined}
      data-bench-type={selected.type ?? undefined}
    >
      {children}
    </p>
  );
}

function BenchRenderNodeSelectorElement({
  attributes,
  children,
  source,
}: {
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  source: BenchRenderNodeSelectorSource;
}) {
  if (source === 'element-provider') {
    return (
      <BenchRenderNodeSelectorElementFromProvider attributes={attributes}>
        {children}
      </BenchRenderNodeSelectorElementFromProvider>
    );
  }

  if (source === 'plain-context') {
    return (
      <BenchRenderNodeSelectorElementFromPlainContext attributes={attributes}>
        {children}
      </BenchRenderNodeSelectorElementFromPlainContext>
    );
  }

  return (
    <BenchRenderNodeSelectorElementFromJotai attributes={attributes}>
      {children}
    </BenchRenderNodeSelectorElementFromJotai>
  );
}

const CORE_MOUNT_CASES: CoreMountCase[] = [
  {
    description:
      'Plate provider and jotai-x store hydration only. No Plate tree or editable hook work.',
    id: 'provider-only',
    label: 'Provider only',
  },
  {
    description: 'Provider plus Plate. No PlateContent or PlateContent mount.',
    id: 'plite-only',
    label: 'Plate only',
  },
  {
    description:
      'Provider plus Plate and PlateContent with direct static props. No PlateContent effect stack.',
    id: 'editable-static',
    label: 'PlateContent static props',
  },
  {
    description:
      'Static PlateContent baseline plus PlateElement only, without ElementProvider or getRenderNodeProps. This isolates the default PlateElement render cost.',
    id: 'editable-element-plate-element-no-provider',
    label: 'PlateContent + PlateElement, no provider',
  },
  {
    description:
      'PlateElement with just the resolved plugin ref and Plate class injection, but no full editor.plugin context and no getRenderNodeProps. This isolates whether the plugin object alone is enough for the plain fast path.',
    id: 'editable-element-plate-element-plugin-only-no-provider',
    label: 'PlateContent + PlateElement + plugin',
  },
  {
    description:
      'PlateElement with cached plugin context and Plate class injection, but still no ElementProvider or getRenderNodeProps. This isolates plugin-context prop weight without node-prop composition.',
    id: 'editable-element-plate-element-plugin-context-no-provider',
    label: 'PlateContent + PlateElement + plugin ctx',
  },
  {
    description:
      'The plain element-pipe fast path, but with a precomputed path map. This isolates the remaining path lookup tax after getRenderNodeProps is out of the way.',
    id: 'editable-element-pipe-plugin-precomputed-path',
    label: 'PlateContent + fast pipe (precomputed path)',
  },
  {
    description:
      'The same fast element-pipe path, but without BelowRootNodes. This isolates the cost of mounting an empty root-wrapper component on every block.',
    id: 'editable-element-pipe-plugin-precomputed-no-below-root',
    label: 'PlateContent + fast pipe (no belowRootNodes)',
  },
  {
    description:
      'A bare plain-element lower bound for paragraph nodes: direct tag output with Plate class and no hook-driven path or readOnly plumbing. This isolates the remaining dispatch tax in the real fast path.',
    id: 'editable-element-pipe-bare-plain-fast-path',
    label: 'PlateContent + bare plain fast path',
  },
  {
    description:
      'Static PlateContent baseline plus one ElementProvider per element, using a precomputed path map and no Plate wrapper logic. This isolates the per-node provider/store tax.',
    id: 'editable-element-provider-only',
    label: 'PlateContent + element provider only',
  },
  {
    description:
      'The same provider-only lane, but using a plain React context wrapper instead of ElementProvider. This isolates raw per-node provider overhead without jotai-x hydration.',
    id: 'editable-element-provider-only-plain-context',
    label: 'PlateContent + plain context only',
  },
  {
    description:
      'The provider-only lane with a raw Jotai Provider and store, but no jotai-x scope lookup or hydration helpers. This isolates the bare per-node Jotai provider/store tax.',
    id: 'editable-element-provider-only-jotai-provider',
    label: 'PlateContent + raw Jotai provider',
  },
  {
    description:
      'The provider-only lane with Jotai Provider plus jotai-x HydrateAtoms initial hydration, but no sync effects. This isolates hydration helper cost without sync churn.',
    id: 'editable-element-provider-only-jotai-hydrate-only',
    label: 'PlateContent + Jotai hydrate only',
  },
  {
    description:
      'The provider-only lane with Jotai Provider plus full jotai-x HydrateAtoms hydration and sync behavior, but no scope lookup. This isolates the helper stack without the context map.',
    id: 'editable-element-provider-only-jotai-hydrate-sync',
    label: 'PlateContent + Jotai hydrate + sync',
  },
  {
    description:
      'The provider-only lane with a plain React context plus one zustand-x store per node. This isolates whether swapping the atom store for a zustand-x store materially changes the per-node store tax.',
    id: 'editable-element-provider-only-zustand-provider',
    label: 'PlateContent + zustand-x store',
  },
  {
    description:
      'The same per-node provider lane, but the first-block effect is gated from props instead of subscribing to path inside every provider. This isolates the provider-effect path lookup tax.',
    id: 'editable-element-provider-prop-effect',
    label: 'PlateContent + provider + prop effect',
  },
  {
    description:
      'The direct pluginRenderElement path with a precomputed path map, but reading attributes from props instead of useElement(). This isolates the per-node element-store consumer cost inside ElementContent.',
    id: 'editable-element-plugin-precomputed-no-element-hook',
    label: 'PlateContent + plugin element, no useElement',
  },
  {
    description:
      'ElementProvider plus PlateElement on every node, still without getRenderNodeProps. This isolates PlateElement mount work on top of the provider.',
    id: 'editable-element-provider-plate-element',
    label: 'PlateContent + provider + PlateElement',
  },
  {
    description:
      'The direct pluginRenderElement path with manual plain-plugin node-prop composition. This isolates getRenderNodeProps tax in the rich plugin lane when the plugin has no node props or allowed attributes.',
    id: 'editable-element-plugin-precomputed-fast-node-props',
    label: 'PlateContent + plugin element, fast node props',
  },
  {
    description:
      'A custom node-component lane that actually calls useElement() and usePath() through the real ElementProvider path. This isolates provider-backed hook-consumer cost instead of PlateElement body cost.',
    id: 'editable-element-plugin-render-node-hooks',
    label: 'PlateContent + plugin node hooks',
  },
  {
    description:
      'The same custom node-component lane, but using plain React context instead of ElementProvider. This is the lower bound for useElement/usePath-style consumers without atom-store work.',
    id: 'editable-element-plugin-render-node-hooks-plain-context',
    label: 'PlateContent + plugin node hooks, plain context',
  },
  {
    description:
      'The same custom node-component lane, but using a raw Jotai Provider/store instead of ElementProvider. This isolates the hook-consumer cost on top of bare per-node Jotai.',
    id: 'editable-element-plugin-render-node-hooks-jotai-provider',
    label: 'PlateContent + plugin node hooks, raw Jotai',
  },
  {
    description:
      'The same custom node-component lane, but using Jotai hydration without sync effects. This isolates hydration-only helper cost for hook-heavy consumers.',
    id: 'editable-element-plugin-render-node-hooks-jotai-hydrate-only',
    label: 'PlateContent + plugin node hooks, Jotai hydrate only',
  },
  {
    description:
      'The same custom node-component lane, but using full Jotai hydrate plus sync behavior. This isolates the full jotai-x-style helper stack for hook-heavy consumers.',
    id: 'editable-element-plugin-render-node-hooks-jotai-hydrate-sync',
    label: 'PlateContent + plugin node hooks, Jotai hydrate + sync',
  },
  {
    description:
      'A custom node-component lane that calls useElementSelector() through the real ElementProvider path. This isolates exported selector-consumer cost instead of simple element/path hooks.',
    id: 'editable-element-plugin-render-node-selector',
    label: 'PlateContent + plugin node selector',
  },
  {
    description:
      'The same selector-consumer lane, but using plain React context instead of ElementProvider. This is the lower bound for useElementSelector-style derived reads without atom-store work.',
    id: 'editable-element-plugin-render-node-selector-plain-context',
    label: 'PlateContent + plugin node selector, plain context',
  },
  {
    description:
      'The same selector-consumer lane, but using a raw Jotai Provider/store instead of ElementProvider. This isolates selector-consumer cost on top of bare per-node Jotai.',
    id: 'editable-element-plugin-render-node-selector-jotai-provider',
    label: 'PlateContent + plugin node selector, raw Jotai',
  },
  {
    description:
      'The same rich fast-node-props lane, but with a plain React context wrapper instead of ElementProvider. This isolates the remaining per-node atom-provider tax in the richer path.',
    id: 'editable-element-plugin-precomputed-fast-node-props-plain-context',
    label: 'PlateContent + plugin element, plain context',
  },
  {
    description:
      'The rich fast-node-props lane with a raw Jotai Provider and store, but no jotai-x scope lookup. This isolates how much of the rich lane is just bare per-node Jotai provider cost.',
    id: 'editable-element-plugin-precomputed-fast-node-props-jotai-provider',
    label: 'PlateContent + plugin element, raw Jotai',
  },
  {
    description:
      'The rich fast-node-props lane with Jotai Provider plus jotai-x HydrateAtoms initial hydration, but no sync effects. This isolates helper hydration cost without provider scope lookup.',
    id: 'editable-element-plugin-precomputed-fast-node-props-jotai-hydrate-only',
    label: 'PlateContent + plugin element, Jotai hydrate only',
  },
  {
    description:
      'The rich fast-node-props lane with Jotai Provider plus full jotai-x HydrateAtoms hydration and sync behavior, but no scope lookup. This isolates helper-stack cost in the richer path.',
    id: 'editable-element-plugin-precomputed-fast-node-props-jotai-hydrate-sync',
    label: 'PlateContent + plugin element, Jotai hydrate + sync',
  },
  {
    description:
      'The rich fast-node-props lane with a plain React context plus one zustand-x store per node. This isolates how much the richer path changes if the per-node atom store becomes a zustand-x store.',
    id: 'editable-element-plugin-precomputed-fast-node-props-zustand-provider',
    label: 'PlateContent + plugin element, zustand-x',
  },
  {
    description:
      'The render.as-only element lower bound: real basic blockquote plugin, but rendered through the providerless plain fast path shape instead of ElementProvider and PlateElement.',
    documentMode: 'blockquote-only',
    id: 'editable-element-render-as-no-provider',
    label: 'PlateContent + render.as, no provider',
    plugins: 'basic',
  },
  {
    description:
      'The old render.as-only shape: real basic blockquote plugin rendered through ElementProvider plus PlateElement. This is the branch the fast path is replacing.',
    documentMode: 'blockquote-only',
    id: 'editable-element-render-as-provider',
    label: 'PlateContent + render.as, provider',
    plugins: 'basic',
  },
  {
    description:
      'The direct pluginRenderElement path with the first-block effect gated from props instead of usePath(). This isolates the remaining provider-effect overhead in the rich plugin path.',
    id: 'editable-element-plugin-precomputed-prop-effect',
    label: 'PlateContent + plugin element + prop effect',
  },
  {
    description:
      'Static PlateContent baseline plus getRenderNodeProps and PlateElement, but no ElementProvider. This isolates node-prop composition from the per-node jotai store.',
    id: 'editable-element-render-node-props-no-provider',
    label: 'PlateContent + render-node props, no provider',
  },
  {
    description:
      'Static PlateContent baseline plus the full default pipeRenderElement path. Paragraph nodes hit the core p plugin; headings fall back.',
    id: 'editable-element-pipe',
    label: 'PlateContent + element pipe',
  },
  {
    description:
      'Static PlateContent baseline plus the full default pipeRenderElement path on a blockquote-only document with basic plugins loaded. This is the real production lane for render.as-only element plugins.',
    documentMode: 'blockquote-only',
    id: 'editable-element-pipe-render-as-basic',
    label: 'PlateContent + element pipe (render.as)',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderElement on a document where paragraph nodes use an unmapped type. This isolates the fallback renderElement branch without the core p plugin.',
    documentMode: 'paragraph-fallback',
    id: 'editable-element-fallback-pipe',
    label: 'PlateContent + fallback element pipe',
  },
  {
    description:
      'Static PlateContent baseline plus the core paragraph plugin renderer with a precomputed node->path map. This isolates plugin wrapper cost from dynamic path lookup.',
    id: 'editable-element-plugin-precomputed-path',
    label: 'PlateContent + plugin element (precomputed path)',
  },
  {
    description:
      'Static PlateContent baseline plus direct bold leaf/text renderers on a bold-only document with basic plugins loaded. This is the lowest useful mark-side lower bound.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-direct-renderers',
    label: 'PlateContent + bold direct renderers',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus pluginRenderLeaf(bold) directly on a bold-only document with only BoldPlugin loaded. This isolates the active bold plugin path without pipeRenderLeaf outer-wrapper work.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-plugin-leaf-direct',
    label: 'PlateContent + bold plugin leaf direct',
    plugins: 'bold-only',
  },
  {
    description:
      'Static PlateContent baseline plus PlateLeaf rendered directly as strong on a bold-only document with basic plugins loaded. This isolates PlateLeaf body cost without node-prop composition.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-plateleaf-direct',
    label: 'PlateContent + bold PlateLeaf direct',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus getRenderNodeProps feeding PlateLeaf as strong on a bold-only document with basic plugins loaded. This isolates node-prop composition from the rest of pipeRenderLeaf.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-leaf-node-props',
    label: 'PlateContent + bold leaf node props',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf only on a bold-only document with basic plugins loaded. This isolates mark leaf wrapping from renderText work.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-leaf-pipe',
    label: 'PlateContent + bold leaf pipe',
    plugins: 'basic',
  },
  {
    description:
      'The same bold leaf-pipe lane, but with only BoldPlugin loaded instead of the full basic mark stack. This isolates unused mark-plugin fan-out inside pipeRenderLeaf.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-leaf-pipe-bold-only',
    label: 'PlateContent + bold leaf pipe (bold only)',
    plugins: 'bold-only',
  },
  {
    description:
      'The same bold-only leaf-pipe lane, but pipeRenderLeaf finishes with a plain span outer renderer instead of PlateLeaf. This isolates the outer fallback wrapper cost.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-leaf-pipe-plain-outer',
    label: 'PlateContent + bold leaf pipe (plain outer)',
    plugins: 'bold-only',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderText only on a bold-only document with basic plugins loaded. This isolates mark text wrapping from renderLeaf work.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-text-pipe',
    label: 'PlateContent + bold text pipe',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus direct code leaf/text renderers on a code-only document with basic plugins loaded. This is the hard code mark lower bound.',
    documentMode: 'code-only',
    id: 'editable-leaf-text-code-direct-renderers',
    label: 'PlateContent + code direct renderers',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus PlateLeaf rendered directly as code on a code-only document with only CodePlugin loaded. This isolates hard-affinity PlateLeaf body cost without node-prop composition.',
    documentMode: 'code-only',
    id: 'editable-leaf-text-code-plateleaf-direct',
    label: 'PlateContent + code PlateLeaf direct',
    plugins: 'code-only',
  },
  {
    description:
      'Static PlateContent baseline plus pluginRenderLeaf(code) directly on a code-only document with only CodePlugin loaded. This isolates the active code plugin path without pipeRenderLeaf outer-wrapper work.',
    documentMode: 'code-only',
    id: 'editable-leaf-text-code-plugin-leaf-direct',
    label: 'PlateContent + code plugin leaf direct',
    plugins: 'code-only',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf only on a code-only document with the code plugin loaded. This isolates the hard code mark leaf path against the existing plain-renderers control.',
    documentMode: 'code-only',
    id: 'editable-leaf-text-code-pipe',
    label: 'PlateContent + code leaf pipe',
    plugins: 'code-only',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf and pipeRenderText on a code-only document with the code plugin loaded. This is the real production lane for the hard code mark path.',
    documentMode: 'code-only',
    id: 'editable-leaf-text-code-text-pipe',
    label: 'PlateContent + code leaf/text pipes',
    plugins: 'code-only',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf and pipeRenderText on a bold-only document with basic plugins loaded. This is the real production lane for render.as-only marks.',
    documentMode: 'bold-only',
    id: 'editable-leaf-text-bold-pipe',
    label: 'PlateContent + bold leaf/text pipes',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus direct underline leaf/text renderers on an underline-only document with basic plugins loaded. This is the underline lower bound.',
    documentMode: 'underline-only',
    id: 'editable-leaf-text-underline-direct-renderers',
    label: 'PlateContent + underline direct renderers',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus pluginRenderLeaf(underline) directly on an underline-only document with only UnderlinePlugin loaded. This isolates the active underline plugin path without pipeRenderLeaf outer-wrapper work.',
    documentMode: 'underline-only',
    id: 'editable-leaf-text-underline-plugin-leaf-direct',
    label: 'PlateContent + underline plugin leaf direct',
    plugins: 'underline-only',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf and pipeRenderText on an underline-only document with basic plugins loaded. This is the real production lane for render.as-only underline marks.',
    documentMode: 'underline-only',
    id: 'editable-leaf-text-underline-pipe',
    label: 'PlateContent + underline leaf/text pipes',
    plugins: 'basic',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf and pipeRenderText only. This isolates Plate leaf/text wrapper work.',
    id: 'editable-leaf-text-pipe',
    label: 'PlateContent + leaf/text pipes',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderLeaf and pipeRenderText fed with plain span renderers. This isolates the default PlateLeaf and PlateText body cost.',
    id: 'editable-leaf-text-plain-renderers',
    label: 'PlateContent + leaf/text plain renderers',
  },
  {
    description:
      'Static PlateContent baseline plus pipeRenderElement, pipeRenderLeaf, and pipeRenderText together. This isolates the render pipes from PlateContent handlers and effects.',
    id: 'editable-render-pipes',
    label: 'PlateContent + render pipes',
  },
  {
    description:
      'Full PlateContent path with EditorStateEffect and the usual effect stack.',
    id: 'plate-content',
    label: 'Full PlateContent',
  },
];

function buildElementPathMap(value: Value) {
  const pathMap = new WeakMap<PliteElement, number[]>();

  const visit = (nodes: Descendant[], parentPath: number[] = []) => {
    nodes.forEach((node, index) => {
      if (!('type' in node)) return;

      const path = [...parentPath, index];
      const element = node as PliteElement;

      pathMap.set(element, path);
      visit(element.children as Descendant[], path);
    });
  };

  visit(value as Descendant[]);

  return pathMap;
}

function parseDataPlitePath(value: unknown): Path | undefined {
  if (typeof value !== 'string' || value.length === 0) return undefined;

  const path = value.split(',').map(Number);

  if (path.some((part) => !Number.isInteger(part) || part < 0)) {
    return undefined;
  }

  return path;
}

function getRenderElementPath(
  props: RenderElementProps,
  pathMap: WeakMap<PliteElement, number[]>
) {
  const { element } = props;

  return (
    props.path ??
    pathMap.get(element) ??
    parseDataPlitePath((props.attributes as any)['data-plite-path'])
  );
}

function consume(..._values: unknown[]) {}

function getDissectionValue(caseItem: DissectionCase, blocks: number) {
  return caseItem.seedIds
    ? getSeededEditorPerfWorkloadValue({
        blocks,
        cacheKey: `dissection:${caseItem.id}:${blocks}`,
        workloadId: 'huge-paragraph',
      })
    : getEditorPerfWorkloadValue({
        blocks,
        workloadId: 'huge-paragraph',
      });
}

function getElementIdFragmentValue(
  caseItem: ElementIdFragmentCase,
  blocks: number
) {
  return getElementIdFragmentBenchmarkData({
    blocks,
    fragmentBlocks: getDefaultElementIdFragmentBlockCount(blocks),
    kind: caseItem.fragmentKind,
  });
}

function getCoreMountValue({
  blocks,
  documentMode = 'default',
  seedIds = false,
}: {
  blocks: number;
  documentMode?: CoreMountCase['documentMode'];
  seedIds?: boolean;
}) {
  const workloadId: EditorPerfWorkloadId =
    documentMode === 'paragraph-fallback'
      ? 'huge-paragraph-fallback'
      : documentMode === 'blockquote-only'
        ? 'huge-blockquote'
        : documentMode === 'bold-only'
          ? 'huge-bold'
          : documentMode === 'code-only'
            ? 'huge-code'
            : documentMode === 'underline-only'
              ? 'huge-underline'
              : 'huge-paragraph';
  const value = getEditorPerfWorkloadValue({
    blocks,
    workloadId,
  });

  if (!seedIds) {
    return value;
  }

  return getSeededEditorPerfWorkloadValue({
    blocks,
    cacheKey: `core-mount:${documentMode}:${blocks}`,
    workloadId,
  });
}

function getScenarioPlugins(plugins: BenchmarkPlugins): any[] {
  if (plugins === 'basic') {
    return [
      BlockquotePlugin,
      HeadingPlugin,

      HorizontalRulePlugin,
      BoldPlugin,
      CodePlugin,
      ItalicPlugin,
      StrikethroughPlugin,
      ScriptPlugin,
      UnderlinePlugin,
    ];
  }

  if (plugins === 'blockquote-only') {
    return [BlockquotePlugin];
  }

  if (plugins === 'bold-only') {
    return [BoldPlugin];
  }

  if (plugins === 'code-only') {
    return [CodePlugin];
  }

  if (plugins === 'horizontal-rule-only') {
    return [HorizontalRulePlugin];
  }

  if (plugins === 'heading-only') {
    return [HeadingPlugin];
  }

  if (plugins === 'highlight-only') {
    return [HighlightPlugin];
  }

  if (plugins === 'italic-only') {
    return [ItalicPlugin];
  }

  if (plugins === 'kbd-only') {
    return [KbdPlugin];
  }

  if (plugins === 'strikethrough-only') {
    return [StrikethroughPlugin];
  }

  if (plugins === 'script-only') {
    return [ScriptPlugin];
  }

  if (plugins === 'underline-only') {
    return [UnderlinePlugin];
  }

  return [];
}

function getElementIdPlugins({
  counter,
  enabled,
}: {
  counter?: { count: number };
  enabled?: boolean;
}) {
  if (!enabled) return [];

  return [
    counter
      ? ElementIdPlugin.configure({
          initialState: { generateId: createBenchIdFactory(counter) },
        })
      : ElementIdPlugin,
  ];
}

function getScenarioValue({
  blocks,
  scenario,
  workloadId,
}: {
  blocks: number;
  scenario: Scenario;
  workloadId: ScenarioWorkloadId;
}) {
  return scenario.seedIds
    ? getSeededEditorPerfWorkloadValue({
        blocks,
        cacheKey: `scenario:${scenario.id}:${workloadId}:${blocks}`,
        workloadId,
      })
    : getEditorPerfWorkloadValue({
        blocks,
        workloadId,
      });
}

function getPluginCensusValue({
  blocks,
  entry,
  lane,
}: {
  blocks: number;
  entry: CorePluginCensusEntry;
  lane: PluginCensusLaneId;
}) {
  return getEditorPerfWorkloadValue({
    blocks,
    workloadId:
      lane === 'inactive' ? entry.inactiveWorkload : entry.activatedWorkload,
  });
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitForNextPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  });
}

function calculateStats(samples: number[]): BenchmarkResult {
  if (samples.length === 0) {
    return { max: 0, mean: 0, median: 0, min: 0, p95: 0, p99: 0, stdDev: 0 };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;
  const trimStart = Math.floor(n * 0.1);
  const trimEnd = Math.ceil(n * 0.9);
  const trimmed = sorted.slice(trimStart, trimEnd);
  const mean =
    trimmed.length > 0
      ? trimmed.reduce((sum, sample) => sum + sample, 0) / trimmed.length
      : 0;
  const variance =
    trimmed.length > 0
      ? trimmed.reduce((sum, sample) => sum + (sample - mean) ** 2, 0) /
        trimmed.length
      : 0;

  return {
    max: sorted[n - 1] ?? 0,
    mean,
    median: sorted[Math.floor(n / 2)] ?? 0,
    min: sorted[0] ?? 0,
    p95: sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0,
    p99: sorted[Math.floor(n * 0.99)] ?? sorted[n - 1] ?? 0,
    stdDev: Math.sqrt(variance),
  };
}

function calculateLatencyStats(samples: number[]): LatencyResult {
  if (samples.length === 0) {
    return { max: 0, mean: 0, median: 0, min: 0, p95: 0, samples: [] };
  }

  const sorted = [...samples].sort((a, b) => a - b);
  const n = sorted.length;

  return {
    max: sorted[n - 1] ?? 0,
    mean: samples.reduce((sum, sample) => sum + sample, 0) / n,
    median: sorted[Math.floor(n / 2)] ?? 0,
    min: sorted[0] ?? 0,
    p95: sorted[Math.floor(n * 0.95)] ?? sorted[n - 1] ?? 0,
    samples,
  };
}

const BenchmarkDenseInlinePropsSchema = defineExtension(
  'benchmark-dense-inline-props',
  {
    schema: {
      properties: [
        schema.textProperty('commentId', property.string()),
        schema.textProperty('search', property.string()),
        schema.textProperty('tokenCount', property.number()),
      ],
    },
  }
);

const BenchmarkDenseInlinePropsPlugin = definePlatePlugin(
  'benchmarkDenseInlineProps',
  {
    schema: {
      properties: {
        commentId: schema.textProperty(property.string()),
        search: schema.textProperty(property.string()),
        tokenCount: schema.textProperty(property.number()),
      },
    },
  }
);

function getWorkloadExtensions(workloadId: ScenarioWorkloadId) {
  return workloadId === 'huge-dense-inline-props'
    ? [BenchmarkDenseInlinePropsSchema]
    : [];
}

function getWorkloadPlugins(workloadId: ScenarioWorkloadId) {
  return workloadId === 'huge-dense-inline-props'
    ? [BenchmarkDenseInlinePropsPlugin]
    : [];
}

function createScenarioConstructionEditor(scenario: Scenario) {
  if (scenario.kind === 'slate') {
    return createEditor();
  }

  return createEditor({
    plugins: [
      ...getElementIdPlugins({ enabled: scenario.elementId }),
      ...getScenarioPlugins(scenario.plugins),
    ],
  });
}

function createScenarioMountedEditor({
  config,
  scenario,
  value,
}: {
  config: BenchmarkConfig;
  scenario: Scenario;
  value: Value;
}) {
  if (scenario.kind === 'slate') {
    return createEditor({
      extensions: getWorkloadExtensions(config.scenarioWorkload),
      initialValue: value,
    });
  }

  return createEditor({
    plugins: [
      ...getWorkloadPlugins(config.scenarioWorkload),
      ...getElementIdPlugins({ enabled: scenario.elementId }),
      ...getScenarioPlugins(scenario.plugins),
    ],
    initialValue: value,
  });
}

function createPlateDissectionEditor({
  caseItem,
  config,
  counter,
  value,
}: {
  caseItem: DissectionCase;
  config: BenchmarkConfig;
  counter?: { count: number };
  value?: Value;
}) {
  return createEditor({
    plugins: [
      ...getWorkloadPlugins(config.scenarioWorkload),
      ...getElementIdPlugins({ counter, enabled: caseItem.elementId }),
      ...getScenarioPlugins(caseItem.plugins),
    ],
    initialValue: value,
  });
}

function createFanoutEditor({
  config,
  value,
}: {
  config: BenchmarkConfig;
  value: Value;
}) {
  return createEditor({
    plugins: [
      ...getWorkloadPlugins(config.scenarioWorkload),
      BenchmarkStorePlugin,
    ],
    initialValue: value,
  });
}

function createCoreMountEditor({
  config,
  elementId = false,
  plugins = 'none',
  value,
}: {
  config: BenchmarkConfig;
  elementId?: boolean;
  plugins?: BenchmarkPlugins;
  value: Value;
}) {
  return createEditor({
    plugins: [
      ...getWorkloadPlugins(config.scenarioWorkload),
      ...getElementIdPlugins({ enabled: elementId }),
      ...getScenarioPlugins(plugins),
    ],
    initialValue: value,
  });
}

function createPluginCensusMountedEditor({
  config,
  plugins = 'none',
  value,
}: {
  config: BenchmarkConfig;
  plugins?: BenchmarkPlugins;
  value: Value;
}) {
  return createEditor({
    plugins: [
      ...getWorkloadPlugins(config.scenarioWorkload),
      ...getScenarioPlugins(plugins),
    ],
    initialValue: value,
  });
}

function createFanoutParagraph(index: number): Descendant {
  return {
    children: [{ text: `fanout update ${index}` }],
    type: 'paragraph',
  };
}

const getBenchmarkDOMStrategy = (config: BenchmarkConfig) =>
  config.chunking ? ('auto' as const) : ('full' as const);

type BenchmarkStorePluginState = {
  enabled: boolean;
};

const benchmarkStoreInitialState: BenchmarkStorePluginState = {
  enabled: false,
};

const BenchmarkStorePlugin = definePlatePlugin('benchmarkStore', {
  initialState: benchmarkStoreInitialState,
});

function BenchmarkElement({
  attributes,
  children,
  element,
  elementContentVisibility,
}: RenderElementProps & {
  elementContentVisibility: boolean;
}) {
  const style = {
    contentVisibility: elementContentVisibility ? ('auto' as const) : undefined,
  };

  switch (element.type) {
    case 'heading': {
      return (
        <h1
          {...attributes}
          style={style}
          className="mt-6 mb-3 text-xl font-semibold"
        >
          {children}
        </h1>
      );
    }
    default: {
      return (
        <p {...attributes} style={style} className="mb-3 leading-7">
          {children}
        </p>
      );
    }
  }
}

function ScenarioEditor({
  config,
  editorRef,
  scenario,
  value,
}: {
  config: BenchmarkConfig;
  editorRef?: React.Ref<BenchmarkEditorHandle>;
  scenario: Scenario;
  value: Value;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const renderElement = React.useCallback(
    (props: RenderElementProps) => (
      <BenchmarkElement
        {...props}
        elementContentVisibility={config.contentVisibility === 'element'}
      />
    ),
    [config.contentVisibility]
  );

  if (scenario.kind === 'slate') {
    return (
      <SlateScenarioEditor
        config={config}
        containerRef={containerRef}
        editorRef={editorRef}
        renderElement={renderElement}
        value={value}
      />
    );
  }

  return (
    <PlateScenarioEditor
      config={config}
      containerRef={containerRef}
      editorRef={editorRef}
      renderElement={renderElement}
      scenario={scenario}
      value={value}
    />
  );
}

function SlateScenarioEditor({
  config,
  containerRef,
  editorRef,
  renderElement,
  value,
}: {
  config: BenchmarkConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editorRef?: React.Ref<BenchmarkEditorHandle>;
  renderElement: (props: RenderElementProps) => React.ReactNode;
  value: Value;
}) {
  const editor = React.useMemo(
    () =>
      createEditor({
        extensions: getWorkloadExtensions(config.scenarioWorkload),
        initialValue: value,
      }),
    [config.scenarioWorkload, value]
  );

  React.useImperativeHandle(
    editorRef,
    () => ({
      focusEditable: async () => {
        const editable = containerRef.current?.querySelector<HTMLElement>(
          '[contenteditable="true"]'
        );

        editable?.focus();
        await wait(60);
      },
      insertText: (text: string) => {
        editor.update.text.insert(text);
      },
      selectStart: () => {
        const start = editor.read.points.start([]);

        if (!start) return;

        editor.update.selection.set({ anchor: start, focus: start });
      },
    }),
    [containerRef, editor]
  );

  return (
    <div ref={containerRef} className="h-full overflow-auto p-4">
      <Plate editor={editor}>
        <PlateContent
          className="min-h-[70vh] outline-none"
          domStrategy={getBenchmarkDOMStrategy(config)}
          renderElement={renderElement as any}
          spellCheck={false}
        />
      </Plate>
    </div>
  );
}

function PlateScenarioEditor({
  config,
  containerRef,
  editorRef,
  renderElement,
  scenario,
  value,
}: {
  config: BenchmarkConfig;
  containerRef: React.RefObject<HTMLDivElement | null>;
  editorRef?: React.Ref<BenchmarkEditorHandle>;
  renderElement: (props: RenderElementProps) => React.ReactNode;
  scenario: Scenario;
  value: Value;
}) {
  const editor = useCreateEditor({
    plugins: [
      ...getWorkloadPlugins(config.scenarioWorkload),
      ...getElementIdPlugins({ enabled: scenario.elementId }),
      ...getScenarioPlugins(scenario.plugins),
    ],
    initialValue: value,
  });

  React.useImperativeHandle(
    editorRef,
    () => ({
      focusEditable: async () => {
        const editable = containerRef.current?.querySelector<HTMLElement>(
          '[contenteditable="true"]'
        );

        editable?.focus();
        await wait(60);
      },
      insertText: (text: string) => {
        editor.update.text.insert(text);
      },
      selectStart: () => {
        const start = editor.read.points.start([]);

        if (!start) return;

        editor.update.selection.set({ anchor: start, focus: start });
      },
    }),
    [containerRef, editor]
  );

  return (
    <div ref={containerRef} className="h-full overflow-auto p-4">
      <Plate editor={editor}>
        <PlateContent
          className="min-h-[70vh] outline-none"
          domStrategy={getBenchmarkDOMStrategy(config)}
          renderElement={renderElement as any}
          spellCheck={false}
        />
      </Plate>
    </div>
  );
}

function PrebuiltScenarioEditor({
  config,
  editor,
  scenario,
}: {
  config: BenchmarkConfig;
  editor: BenchmarkEditor;
  scenario: Scenario;
}) {
  const renderElement = React.useCallback(
    (props: RenderElementProps) => (
      <BenchmarkElement
        {...props}
        elementContentVisibility={config.contentVisibility === 'element'}
      />
    ),
    [config.contentVisibility]
  );

  if (scenario.kind === 'slate') {
    return (
      <div className="h-full overflow-auto p-4">
        <Plate editor={editor}>
          <PlateContent
            className="min-h-[70vh] outline-none"
            domStrategy={getBenchmarkDOMStrategy(config)}
            renderElement={renderElement as any}
            spellCheck={false}
          />
        </Plate>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <Plate editor={editor}>
        <PlateContent
          className="min-h-[70vh] outline-none"
          domStrategy={getBenchmarkDOMStrategy(config)}
          renderElement={renderElement as any}
          spellCheck={false}
        />
      </Plate>
    </div>
  );
}

function PluginCensusEditorSurface({
  config,
  editor,
  scenarioId,
}: {
  config: BenchmarkConfig;
  editor: BenchmarkEditor;
  scenarioId: PluginCensusScenarioId;
}) {
  const renderElement = React.useCallback(
    (props: RenderElementProps) => (
      <BenchmarkElement
        {...props}
        elementContentVisibility={config.contentVisibility === 'element'}
      />
    ),
    [config.contentVisibility]
  );

  if (scenarioId === 'slate') {
    return (
      <div className="h-full overflow-auto p-4">
        <Plate editor={editor}>
          <PlateContent
            className="min-h-[70vh] outline-none"
            domStrategy={getBenchmarkDOMStrategy(config)}
            renderElement={renderElement as any}
            spellCheck={false}
          />
        </Plate>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4">
      <Plate editor={editor}>
        <PlateContent
          className="min-h-[70vh] outline-none"
          domStrategy={getBenchmarkDOMStrategy(config)}
          renderElement={renderElement as any}
          spellCheck={false}
        />
      </Plate>
    </div>
  );
}

function EditorStateSubscriber() {
  const blockCount = useEditorState((state) => state.children().length);

  consume(blockCount);

  return null;
}

function EditorValueSubscriber() {
  const value = useEditorValue();

  consume(value.length);

  return null;
}

function EditorSelectorSubscriber() {
  const blockCount = useEditorSelector(
    (editor) => editor.read.children().length,
    {
      equalityFn: (a, b) => a === b,
    }
  );

  consume(blockCount);

  return null;
}

function PluginStoreSubscriber() {
  const enabled = usePluginStore(BenchmarkStorePlugin, 'enabled');

  consume(enabled);

  return null;
}

function MixedSubscriber() {
  const stateBlockCount = useEditorState((state) => state.children().length);
  const value = useEditorValue();
  const blockCount = useEditorSelector(
    (nextEditor) => nextEditor.read.children().length,
    { equalityFn: (a, b) => a === b }
  );
  const enabled = usePluginStore(BenchmarkStorePlugin, 'enabled');

  consume(stateBlockCount, value.length, blockCount, enabled);

  return null;
}

function FanoutSubscriber({ caseId }: { caseId: FanoutCaseId }) {
  switch (caseId) {
    case 'editor-state': {
      return <EditorStateSubscriber />;
    }
    case 'editor-value': {
      return <EditorValueSubscriber />;
    }
    case 'editor-selector': {
      return <EditorSelectorSubscriber />;
    }
    case 'plugin-store': {
      return <PluginStoreSubscriber />;
    }
    case 'mixed': {
      return <MixedSubscriber />;
    }
    case 'none': {
      return null;
    }
  }

  return undefined;
}

function FanoutSubscribers({
  caseId,
  subscriberCount,
}: {
  caseId: FanoutCaseId;
  subscriberCount: number;
}) {
  if (caseId === 'none' || subscriberCount === 0) return null;

  return Array.from({ length: subscriberCount }, (_, index) => (
    <FanoutSubscriber key={`${caseId}:${index}`} caseId={caseId} />
  ));
}

function FanoutSurface({
  caseId,
  config,
  editor,
  subscriberCount,
  ref,
}: {
  caseId: FanoutCaseId;
  config: BenchmarkConfig;
  editor: Editor;
  subscriberCount: number;
  ref?: React.Ref<FanoutEditorHandle>;
}) {
  const updateCountRef = React.useRef(0);
  const renderElement = React.useCallback(
    (props: RenderElementProps) => (
      <BenchmarkElement
        {...props}
        elementContentVisibility={config.contentVisibility === 'element'}
      />
    ),
    [config.contentVisibility]
  );
  React.useImperativeHandle(
    ref,
    () => ({
      triggerUpdate: () => {
        updateCountRef.current += 1;

        const insertFanoutParagraph = () => {
          editor.update.nodes.insert(
            createFanoutParagraph(updateCountRef.current),
            { at: [editor.read.children().length] }
          );
        };

        const benchmarkStore = editor.plugin(BenchmarkStorePlugin);

        switch (caseId) {
          case 'editor-value': {
            insertFanoutParagraph();

            break;
          }
          case 'plugin-store': {
            benchmarkStore.store.set({
              enabled: !benchmarkStore.store.get('enabled'),
            });

            break;
          }
          case 'mixed': {
            insertFanoutParagraph();
            benchmarkStore.store.set({
              enabled: !benchmarkStore.store.get('enabled'),
            });

            break;
          }
          case 'editor-selector':
          case 'editor-state':
          case 'none': {
            insertFanoutParagraph();
          }
        }
      },
    }),
    [caseId, editor]
  );

  return (
    <div className="h-full overflow-auto p-4">
      <Plate editor={editor as any}>
        <PlateContent
          className="min-h-[70vh] outline-none"
          domStrategy={getBenchmarkDOMStrategy(config)}
          renderElement={renderElement as any}
          spellCheck={false}
        />
        <FanoutSubscribers caseId={caseId} subscriberCount={subscriberCount} />
      </Plate>
    </div>
  );
}

function BenchmarkEditableMount({
  config,
  elementBenchmarkMode,
  id,
  leafTextBenchmarkMode,
  leafTextPipeMode = 'both',
  pipeElement = false,
  pipeLeafText = false,
  precomputedElementPluginPath = false,
}: {
  config: BenchmarkConfig;
  elementBenchmarkMode?:
    | 'jotai-hydrate-only-plugin-fast-node-props'
    | 'jotai-hydrate-only-provider-only'
    | 'jotai-hydrate-sync-plugin-fast-node-props'
    | 'jotai-hydrate-sync-provider-only'
    | 'jotai-provider-only'
    | 'jotai-provider-plugin-fast-node-props'
    | 'plain-context-plugin-fast-node-props'
    | 'plain-context-provider-only'
    | 'plugin-precomputed-fast-node-props'
    | 'plugin-render-node-hooks'
    | 'plugin-render-node-hooks-jotai-hydrate-only'
    | 'plugin-render-node-hooks-jotai-hydrate-sync'
    | 'plugin-render-node-hooks-jotai-provider'
    | 'plugin-render-node-hooks-plain-context'
    | 'plugin-render-node-selector'
    | 'plugin-render-node-selector-jotai-provider'
    | 'plugin-render-node-selector-plain-context'
    | 'plugin-precomputed-no-element-hook'
    | 'plugin-precomputed-prop-effect'
    | 'plate-element-no-provider'
    | 'plate-element-plugin-only-no-provider'
    | 'plate-element-plugin-context-no-provider'
    | 'pipe-bare-plain-fast-path'
    | 'pipe-plugin-precomputed-path'
    | 'pipe-plugin-precomputed-no-below-root'
    | 'provider-only'
    | 'render-as-no-provider'
    | 'render-as-provider'
    | 'provider-prop-effect'
    | 'provider-plate-element'
    | 'zustand-provider-only'
    | 'zustand-provider-plugin-fast-node-props'
    | 'render-node-props-no-provider';
  id?: string;
  leafTextBenchmarkMode?:
    | 'bold-ctx-plateleaf'
    | 'bold-direct-renderers'
    | 'bold-plugin-leaf'
    | 'bold-plateleaf'
    | 'code-direct-renderers'
    | 'code-plateleaf'
    | 'code-plugin-leaf'
    | 'underline-direct-renderers'
    | 'underline-plugin-leaf'
    | 'plain-renderers';
  leafTextPipeMode?: 'both' | 'leaf-only' | 'text-only';
  pipeElement?: boolean;
  pipeLeafText?: boolean;
  precomputedElementPluginPath?: boolean;
}) {
  const editor = useEditor({ id });
  const pathMap = React.useMemo(
    () => buildElementPathMap((editor.read.children() ?? []) as Value),
    [editor]
  );
  const paragraphPlugin = React.useMemo(
    () => editor.plugin('paragraph'),
    [editor]
  );
  const boldPlugin = React.useMemo(() => editor.plugin('bold'), [editor]);
  const underlinePlugin = React.useMemo(
    () => editor.plugin('underline'),
    [editor]
  );
  const codePlugin = React.useMemo(() => editor.plugin('code'), [editor]);
  const renderElement = React.useCallback(
    (props: RenderElementProps) => (
      <BenchmarkElement
        {...props}
        elementContentVisibility={config.contentVisibility === 'element'}
      />
    ),
    [config.contentVisibility]
  );
  const plainLeafRenderer = React.useCallback(
    ({ attributes, children }: any) => <span {...attributes}>{children}</span>,
    []
  );
  const directBoldLeafRenderer = React.useCallback(
    ({ attributes, children }: any) => (
      <strong {...attributes}>{children}</strong>
    ),
    []
  );
  const directBoldPlateLeafRenderer = React.useCallback(
    ({ attributes, children, leaf, leafPosition, text }: any) => (
      <PlateLeaf
        {...({
          as: 'strong',
          attributes,
          children,
          editor,
          leaf,
          leafPosition,
          plugin: boldPlugin,
          text,
        } as any)}
      />
    ),
    [boldPlugin, editor]
  );
  const directBoldNodePropsLeafRenderer = React.useCallback(
    ({ attributes, children, leaf, leafPosition, text }: any) => {
      const ctxProps = getRenderNodeProps({
        editor: editor as any,
        plugin: boldPlugin as any,
        props: {
          attributes,
          children,
          leaf,
          leafPosition,
          text,
        } as any,
        readOnly: false,
      });

      return (
        <PlateLeaf as="strong" {...ctxProps}>
          {children}
        </PlateLeaf>
      );
    },
    [boldPlugin, editor]
  );
  const directBoldPluginLeafRenderer = React.useMemo(
    () =>
      boldPlugin
        ? pluginRenderLeaf(editor as any, boldPlugin as any)
        : undefined,
    [boldPlugin, editor]
  );
  const directUnderlineLeafRenderer = React.useCallback(
    ({ attributes, children }: any) => <u {...attributes}>{children}</u>,
    []
  );
  const directUnderlinePluginLeafRenderer = React.useMemo(
    () =>
      underlinePlugin
        ? pluginRenderLeaf(editor as any, underlinePlugin as any)
        : undefined,
    [editor, underlinePlugin]
  );
  const directCodeLeafRenderer = React.useCallback(
    ({ attributes, children }: any) => <code {...attributes}>{children}</code>,
    []
  );
  const directCodePlateLeafRenderer = React.useCallback(
    ({ attributes, children, leaf, leafPosition, text }: any) => (
      <PlateLeaf
        {...({
          as: 'code',
          attributes,
          children,
          editor,
          leaf,
          leafPosition,
          plugin: codePlugin,
          text,
        } as any)}
      />
    ),
    [codePlugin, editor]
  );
  const directCodePluginLeafRenderer = React.useMemo(
    () =>
      codePlugin
        ? pluginRenderLeaf(editor as any, codePlugin as any)
        : undefined,
    [codePlugin, editor]
  );
  const plainTextRenderer = React.useCallback(
    ({ attributes, children }: any) => <span {...attributes}>{children}</span>,
    []
  );
  const customElementRender = React.useMemo(() => {
    if (!elementBenchmarkMode) return undefined;

    return (props: RenderElementProps) => {
      const { element } = props;
      const path = getRenderElementPath(props, pathMap);

      if (!path) return renderElement(props);

      const elementType = element.type as string | undefined;
      const elementPortal = elementType
        ? editor.plugin(elementType)
        : undefined;
      const elementPlugin = elementPortal?.installed
        ? elementPortal
        : undefined;
      const elementClassName = elementType ? `plite-${elementType}` : undefined;
      const baseAttributes = {
        ...(props.attributes as any),
        className:
          [elementClassName, (props.attributes as any)?.className]
            .filter(Boolean)
            .join(' ') || undefined,
      };

      if (elementBenchmarkMode === 'plate-element-no-provider') {
        return (
          <PlateElement
            {...({
              attributes: baseAttributes,
              children: props.children,
              editor,
              element,
              path,
            } as any)}
          />
        );
      }

      if (elementBenchmarkMode === 'plate-element-plugin-only-no-provider') {
        return (
          <PlateElement
            {...({
              attributes: baseAttributes,
              children: props.children,
              editor,
              element,
              path,
              plugin: elementPlugin,
            } as any)}
          />
        );
      }

      if (elementBenchmarkMode === 'plate-element-plugin-context-no-provider') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };

        return (
          <PlateElement
            {...({
              ...pluginContext,
              attributes: baseAttributes,
              children: props.children,
              editor,
              element,
              path,
            } as any)}
          />
        );
      }

      if (elementBenchmarkMode === 'pipe-plugin-precomputed-path') {
        if (
          elementPlugin &&
          elementType &&
          editor.read.schema.element(elementType) !== undefined
        ) {
          return (
            <PlateElement
              {...({
                attributes: baseAttributes,
                children: props.children,
                editor,
                element,
                path,
                plugin: elementPlugin,
              } as any)}
            >
              {props.children}

              <BelowRootNodes
                {...({
                  attributes: baseAttributes,
                  editor,
                  element,
                  path,
                  plugin: elementPlugin,
                } as any)}
              />
            </PlateElement>
          );
        }

        return renderElement(props);
      }

      if (elementBenchmarkMode === 'pipe-plugin-precomputed-no-below-root') {
        if (
          elementPlugin &&
          elementType &&
          editor.read.schema.element(elementType) !== undefined
        ) {
          return (
            <PlateElement
              {...({
                attributes: baseAttributes,
                children: props.children,
                editor,
                element,
                path,
                plugin: elementPlugin,
              } as any)}
            />
          );
        }

        return renderElement(props);
      }

      if (elementBenchmarkMode === 'pipe-bare-plain-fast-path') {
        if (
          elementPlugin &&
          elementType &&
          editor.read.schema.element(elementType) !== undefined
        ) {
          const typeClass = elementPlugin.name
            ? `plite-${elementPlugin.name}`
            : undefined;
          const attributes = {
            ...baseAttributes,
            className:
              [typeClass, baseAttributes.className].filter(Boolean).join(' ') ||
              undefined,
          };
          const Tag = elementPlugin.render?.as ?? 'div';

          return (
            <Tag
              data-plite-inline={attributes['data-plite-inline']}
              data-plite-node="element"
              {...attributes}
              style={
                {
                  position: 'relative',
                  ...attributes.style,
                } as React.CSSProperties
              }
            >
              {props.children}
            </Tag>
          );
        }

        return renderElement(props);
      }

      if (elementBenchmarkMode === 'provider-only') {
        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={element.type ?? 'bench'}
          >
            <div {...props.attributes}>{props.children}</div>
          </ElementProvider>
        );
      }

      if (elementBenchmarkMode === 'render-as-provider') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          as: elementPlugin?.render?.as,
          attributes: baseAttributes,
          editor,
          path,
          plugin: elementPlugin,
        } as any;

        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={elementPlugin?.name ?? element.type ?? 'bench'}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </ElementProvider>
        );
      }

      if (elementBenchmarkMode === 'render-as-no-provider') {
        const Tag = elementPlugin?.render?.as ?? 'div';

        return (
          <Tag
            data-plite-inline={baseAttributes['data-plite-inline']}
            data-plite-node="element"
            {...baseAttributes}
            style={
              {
                position: 'relative',
                ...baseAttributes.style,
              } as React.CSSProperties
            }
          >
            {props.children}

            <BelowRootNodes
              {...({
                attributes: baseAttributes,
                editor,
                element,
                path,
                plugin: elementPlugin,
              } as any)}
            />
          </Tag>
        );
      }

      if (elementBenchmarkMode === 'plain-context-provider-only') {
        return (
          <BenchElementContext.Provider
            value={{
              element,
              entry: [element, path],
              path,
              scope: element.type ?? 'bench',
            }}
          >
            <div {...props.attributes}>{props.children}</div>
          </BenchElementContext.Provider>
        );
      }

      if (elementBenchmarkMode === 'jotai-provider-only') {
        return (
          <BenchJotaiStoreProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <div {...props.attributes}>{props.children}</div>
          </BenchJotaiStoreProvider>
        );
      }

      if (elementBenchmarkMode === 'jotai-hydrate-only-provider-only') {
        return (
          <BenchJotaiHydrateOnlyProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <div {...props.attributes}>{props.children}</div>
          </BenchJotaiHydrateOnlyProvider>
        );
      }

      if (elementBenchmarkMode === 'jotai-hydrate-sync-provider-only') {
        return (
          <BenchJotaiHydrateSyncProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <div {...props.attributes}>{props.children}</div>
          </BenchJotaiHydrateSyncProvider>
        );
      }

      if (elementBenchmarkMode === 'zustand-provider-only') {
        return (
          <BenchZustandStoreProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <div {...props.attributes}>{props.children}</div>
          </BenchZustandStoreProvider>
        );
      }

      if (elementBenchmarkMode === 'provider-prop-effect') {
        return (
          <BenchElementProviderPropEffect
            element={element}
            entry={[element, path]}
            path={path}
            scope={element.type ?? 'bench'}
          >
            <div {...props.attributes}>{props.children}</div>
          </BenchElementProviderPropEffect>
        );
      }

      if (elementBenchmarkMode === 'plugin-precomputed-no-element-hook') {
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={elementPlugin?.name ?? element.type ?? 'bench'}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </ElementProvider>
        );
      }

      if (elementBenchmarkMode === 'plugin-render-node-hooks') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={elementPlugin?.name ?? element.type ?? 'bench'}
          >
            <BenchRenderNodeHookElement
              attributes={ctxProps.attributes}
              source="element-provider"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeHookElement>
          </ElementProvider>
        );
      }

      if (elementBenchmarkMode === 'plugin-render-node-hooks-plain-context') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchElementContext.Provider
            value={{
              element,
              entry: [element, path],
              path,
              scope: elementPlugin?.name ?? element.type ?? 'bench',
            }}
          >
            <BenchRenderNodeHookElement
              attributes={ctxProps.attributes}
              source="plain-context"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeHookElement>
          </BenchElementContext.Provider>
        );
      }

      if (elementBenchmarkMode === 'plugin-render-node-hooks-jotai-provider') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchJotaiStoreProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <BenchRenderNodeHookElement
              attributes={ctxProps.attributes}
              source="jotai"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeHookElement>
          </BenchJotaiStoreProvider>
        );
      }

      if (
        elementBenchmarkMode === 'plugin-render-node-hooks-jotai-hydrate-only'
      ) {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchJotaiHydrateOnlyProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <BenchRenderNodeHookElement
              attributes={ctxProps.attributes}
              source="jotai"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeHookElement>
          </BenchJotaiHydrateOnlyProvider>
        );
      }

      if (
        elementBenchmarkMode === 'plugin-render-node-hooks-jotai-hydrate-sync'
      ) {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchJotaiHydrateSyncProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <BenchRenderNodeHookElement
              attributes={ctxProps.attributes}
              source="jotai"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeHookElement>
          </BenchJotaiHydrateSyncProvider>
        );
      }

      if (elementBenchmarkMode === 'plugin-render-node-selector') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={elementPlugin?.name ?? element.type ?? 'bench'}
          >
            <BenchRenderNodeSelectorElement
              attributes={ctxProps.attributes}
              source="element-provider"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeSelectorElement>
          </ElementProvider>
        );
      }

      if (
        elementBenchmarkMode === 'plugin-render-node-selector-plain-context'
      ) {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchElementContext.Provider
            value={{
              element,
              entry: [element, path],
              path,
              scope: elementPlugin?.name ?? element.type ?? 'bench',
            }}
          >
            <BenchRenderNodeSelectorElement
              attributes={ctxProps.attributes}
              source="plain-context"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeSelectorElement>
          </BenchElementContext.Provider>
        );
      }

      if (
        elementBenchmarkMode === 'plugin-render-node-selector-jotai-provider'
      ) {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          pluginContext: pluginContext as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchJotaiStoreProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <BenchRenderNodeSelectorElement
              attributes={ctxProps.attributes}
              source="jotai"
            >
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </BenchRenderNodeSelectorElement>
          </BenchJotaiStoreProvider>
        );
      }

      if (elementBenchmarkMode === 'plugin-precomputed-fast-node-props') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          attributes: baseAttributes,
          editor,
          path,
        } as any;

        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={elementPlugin?.name ?? element.type ?? 'bench'}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </ElementProvider>
        );
      }

      if (elementBenchmarkMode === 'plain-context-plugin-fast-node-props') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          attributes: baseAttributes,
          editor,
          path,
        } as any;

        return (
          <BenchElementContext.Provider
            value={{
              element,
              entry: [element, path],
              path,
              scope: elementPlugin?.name ?? element.type ?? 'bench',
            }}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </BenchElementContext.Provider>
        );
      }

      if (elementBenchmarkMode === 'jotai-provider-plugin-fast-node-props') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          attributes: baseAttributes,
          editor,
          path,
        } as any;

        return (
          <BenchJotaiStoreProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </BenchJotaiStoreProvider>
        );
      }

      if (
        elementBenchmarkMode === 'jotai-hydrate-only-plugin-fast-node-props'
      ) {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          attributes: baseAttributes,
          editor,
          path,
        } as any;

        return (
          <BenchJotaiHydrateOnlyProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </BenchJotaiHydrateOnlyProvider>
        );
      }

      if (
        elementBenchmarkMode === 'jotai-hydrate-sync-plugin-fast-node-props'
      ) {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          attributes: baseAttributes,
          editor,
          path,
        } as any;

        return (
          <BenchJotaiHydrateSyncProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </BenchJotaiHydrateSyncProvider>
        );
      }

      if (elementBenchmarkMode === 'zustand-provider-plugin-fast-node-props') {
        const pluginContext = elementPlugin
          ? editor.plugin(elementPlugin.name)
          : { api: editor.api, editor };
        const ctxProps = {
          ...props,
          ...pluginContext,
          attributes: baseAttributes,
          editor,
          path,
        } as any;

        return (
          <BenchZustandStoreProvider
            element={element}
            entry={[element, path]}
            path={path}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </BenchZustandStoreProvider>
        );
      }

      if (elementBenchmarkMode === 'plugin-precomputed-prop-effect') {
        const ctxProps = getRenderNodeProps({
          editor: editor as any,
          plugin: elementPlugin as any,
          props: {
            ...props,
            editor,
            path,
            plugin: elementPlugin,
          } as any,
          readOnly: false,
        });

        return (
          <BenchElementProviderPropEffect
            element={element}
            entry={[element, path]}
            path={path}
            scope={elementPlugin?.name ?? element.type ?? 'bench'}
          >
            <PlateElement {...ctxProps}>
              {props.children}

              <BelowRootNodes {...ctxProps} />
            </PlateElement>
          </BenchElementProviderPropEffect>
        );
      }

      if (elementBenchmarkMode === 'provider-plate-element') {
        return (
          <ElementProvider
            element={element}
            entry={[element, path]}
            path={path}
            scope={element.type ?? 'bench'}
          >
            <PlateElement
              {...({
                attributes: props.attributes,
                children: props.children,
                editor,
                element,
                path,
              } as any)}
            />
          </ElementProvider>
        );
      }

      const portal =
        typeof element.type === 'string'
          ? editor.plugin(element.type)
          : undefined;
      const plugin = portal?.installed ? portal : undefined;
      const ctxProps = getRenderNodeProps({
        editor: editor as any,
        plugin: plugin as any,
        props: { ...props, path } as any,
        readOnly: false,
      });

      return (
        <PlateElement {...ctxProps}>
          {props.children}

          <BelowRootNodes {...ctxProps} />
        </PlateElement>
      );
    };
  }, [editor, elementBenchmarkMode, pathMap, renderElement]);
  const precomputedElementRender = React.useMemo(() => {
    const paragraphType = paragraphPlugin.schema.type;

    if (
      !precomputedElementPluginPath ||
      editor.read.schema.element(paragraphType) === undefined
    ) {
      return undefined;
    }

    const renderParagraph = pluginRenderElement(
      editor as any,
      paragraphPlugin as any
    );

    return (props: RenderElementProps) => {
      const { element } = props;

      if (element.type !== paragraphType) {
        return renderElement(props);
      }

      const path = getRenderElementPath(props, pathMap);

      if (!path) return renderElement(props);

      return renderParagraph({
        ...props,
        path,
      } as any) as any;
    };
  }, [
    editor,
    paragraphPlugin,
    pathMap,
    precomputedElementPluginPath,
    renderElement,
  ]);
  const finalRenderElement = React.useMemo(
    () =>
      customElementRender
        ? customElementRender
        : precomputedElementRender
          ? precomputedElementRender
          : pipeElement
            ? pipeRenderElement(editor as any, renderElement as any)
            : renderElement,
    [
      customElementRender,
      editor,
      pipeElement,
      precomputedElementRender,
      renderElement,
    ]
  );
  const finalRenderLeaf = React.useMemo(
    () =>
      leafTextBenchmarkMode === 'bold-direct-renderers'
        ? (directBoldLeafRenderer as any)
        : leafTextBenchmarkMode === 'bold-plugin-leaf'
          ? (directBoldPluginLeafRenderer as any)
          : leafTextBenchmarkMode === 'code-direct-renderers'
            ? (directCodeLeafRenderer as any)
            : leafTextBenchmarkMode === 'code-plateleaf'
              ? (directCodePlateLeafRenderer as any)
              : leafTextBenchmarkMode === 'code-plugin-leaf'
                ? (directCodePluginLeafRenderer as any)
                : leafTextBenchmarkMode === 'underline-direct-renderers'
                  ? (directUnderlineLeafRenderer as any)
                  : leafTextBenchmarkMode === 'underline-plugin-leaf'
                    ? (directUnderlinePluginLeafRenderer as any)
                    : leafTextBenchmarkMode === 'bold-plateleaf'
                      ? (directBoldPlateLeafRenderer as any)
                      : leafTextBenchmarkMode === 'bold-ctx-plateleaf'
                        ? (directBoldNodePropsLeafRenderer as any)
                        : pipeLeafText && leafTextPipeMode !== 'text-only'
                          ? pipeRenderLeaf(
                              editor as any,
                              leafTextBenchmarkMode === 'plain-renderers'
                                ? (plainLeafRenderer as any)
                                : undefined
                            )
                          : undefined,
    [
      directBoldLeafRenderer,
      directBoldPluginLeafRenderer,
      directBoldNodePropsLeafRenderer,
      directBoldPlateLeafRenderer,
      directCodeLeafRenderer,
      directCodePlateLeafRenderer,
      directCodePluginLeafRenderer,
      directUnderlineLeafRenderer,
      directUnderlinePluginLeafRenderer,
      editor,
      leafTextBenchmarkMode,
      leafTextPipeMode,
      pipeLeafText,
      plainLeafRenderer,
    ]
  );
  const finalRenderText = React.useMemo(
    () =>
      leafTextBenchmarkMode === 'bold-direct-renderers'
        ? (plainTextRenderer as any)
        : leafTextBenchmarkMode === 'bold-plugin-leaf' ||
            leafTextBenchmarkMode === 'code-direct-renderers' ||
            leafTextBenchmarkMode === 'code-plateleaf' ||
            leafTextBenchmarkMode === 'code-plugin-leaf' ||
            leafTextBenchmarkMode === 'underline-direct-renderers' ||
            leafTextBenchmarkMode === 'underline-plugin-leaf' ||
            leafTextBenchmarkMode === 'bold-plateleaf' ||
            leafTextBenchmarkMode === 'bold-ctx-plateleaf'
          ? (plainTextRenderer as any)
          : pipeLeafText && leafTextPipeMode !== 'leaf-only'
            ? pipeRenderText(
                editor as any,
                leafTextBenchmarkMode === 'plain-renderers'
                  ? (plainTextRenderer as any)
                  : undefined
              )
            : undefined,
    [
      editor,
      leafTextBenchmarkMode,
      leafTextPipeMode,
      pipeLeafText,
      plainTextRenderer,
    ]
  );

  return (
    <Plate editor={editor}>
      <PlateContent
        className="min-h-[70vh] outline-none"
        readOnly={false}
        renderElement={finalRenderElement as any}
        renderLeaf={finalRenderLeaf}
        renderText={finalRenderText}
        spellCheck={false}
      />
    </Plate>
  );
}

function CoreMountSurface({
  caseId,
  config,
  editor,
}: {
  caseId: CoreMountCaseId;
  config: BenchmarkConfig;
  editor: Editor;
}) {
  const { id } = editor;

  return (
    <div className="h-full overflow-auto p-4">
      <Plate editor={editor}>
        {caseId === 'provider-only' ? (
          <div className="min-h-[70vh]" />
        ) : caseId === 'plite-only' ? (
          <Plate editor={editor}>
            <div />
          </Plate>
        ) : caseId === 'editable-static' ? (
          <BenchmarkEditableMount config={config} id={id} />
        ) : caseId === 'editable-element-plate-element-no-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plate-element-no-provider"
            id={id}
          />
        ) : caseId ===
          'editable-element-plate-element-plugin-only-no-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plate-element-plugin-only-no-provider"
            id={id}
          />
        ) : caseId ===
          'editable-element-plate-element-plugin-context-no-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plate-element-plugin-context-no-provider"
            id={id}
          />
        ) : caseId === 'editable-element-pipe-plugin-precomputed-path' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="pipe-plugin-precomputed-path"
            id={id}
          />
        ) : caseId ===
          'editable-element-pipe-plugin-precomputed-no-below-root' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="pipe-plugin-precomputed-no-below-root"
            id={id}
          />
        ) : caseId === 'editable-element-pipe-bare-plain-fast-path' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="pipe-bare-plain-fast-path"
            id={id}
          />
        ) : caseId === 'editable-element-provider-only' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="provider-only"
            id={id}
          />
        ) : caseId === 'editable-element-render-as-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="render-as-provider"
            id={id}
          />
        ) : caseId === 'editable-element-render-as-no-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="render-as-no-provider"
            id={id}
          />
        ) : caseId === 'editable-element-provider-only-plain-context' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plain-context-provider-only"
            id={id}
          />
        ) : caseId === 'editable-element-provider-only-jotai-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="jotai-provider-only"
            id={id}
          />
        ) : caseId === 'editable-element-provider-only-jotai-hydrate-only' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="jotai-hydrate-only-provider-only"
            id={id}
          />
        ) : caseId === 'editable-element-provider-only-jotai-hydrate-sync' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="jotai-hydrate-sync-provider-only"
            id={id}
          />
        ) : caseId === 'editable-element-provider-only-zustand-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="zustand-provider-only"
            id={id}
          />
        ) : caseId === 'editable-element-provider-prop-effect' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="provider-prop-effect"
            id={id}
          />
        ) : caseId === 'editable-element-plugin-precomputed-no-element-hook' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-precomputed-no-element-hook"
            id={id}
          />
        ) : caseId === 'editable-element-provider-plate-element' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="provider-plate-element"
            id={id}
          />
        ) : caseId === 'editable-element-plugin-render-node-hooks' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-hooks"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-render-node-hooks-plain-context' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-hooks-plain-context"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-render-node-hooks-jotai-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-hooks-jotai-provider"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-render-node-hooks-jotai-hydrate-only' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-hooks-jotai-hydrate-only"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-render-node-hooks-jotai-hydrate-sync' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-hooks-jotai-hydrate-sync"
            id={id}
          />
        ) : caseId === 'editable-element-plugin-render-node-selector' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-selector"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-render-node-selector-plain-context' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-selector-plain-context"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-render-node-selector-jotai-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-render-node-selector-jotai-provider"
            id={id}
          />
        ) : caseId === 'editable-element-plugin-precomputed-fast-node-props' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-precomputed-fast-node-props"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-precomputed-fast-node-props-plain-context' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plain-context-plugin-fast-node-props"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-precomputed-fast-node-props-jotai-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="jotai-provider-plugin-fast-node-props"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-precomputed-fast-node-props-jotai-hydrate-only' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="jotai-hydrate-only-plugin-fast-node-props"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-precomputed-fast-node-props-jotai-hydrate-sync' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="jotai-hydrate-sync-plugin-fast-node-props"
            id={id}
          />
        ) : caseId ===
          'editable-element-plugin-precomputed-fast-node-props-zustand-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="zustand-provider-plugin-fast-node-props"
            id={id}
          />
        ) : caseId === 'editable-element-plugin-precomputed-prop-effect' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="plugin-precomputed-prop-effect"
            id={id}
          />
        ) : caseId === 'editable-element-render-node-props-no-provider' ? (
          <BenchmarkEditableMount
            config={config}
            elementBenchmarkMode="render-node-props-no-provider"
            id={id}
          />
        ) : caseId === 'editable-element-pipe' ? (
          <BenchmarkEditableMount config={config} id={id} pipeElement />
        ) : caseId === 'editable-element-pipe-render-as-basic' ? (
          <BenchmarkEditableMount config={config} id={id} pipeElement />
        ) : caseId === 'editable-element-fallback-pipe' ? (
          <BenchmarkEditableMount config={config} id={id} pipeElement />
        ) : caseId === 'editable-element-plugin-precomputed-path' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            precomputedElementPluginPath
          />
        ) : caseId === 'editable-leaf-text-bold-direct-renderers' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="bold-direct-renderers"
          />
        ) : caseId === 'editable-leaf-text-bold-plugin-leaf-direct' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="bold-plugin-leaf"
          />
        ) : caseId === 'editable-leaf-text-bold-plateleaf-direct' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="bold-plateleaf"
          />
        ) : caseId === 'editable-leaf-text-bold-leaf-node-props' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="bold-ctx-plateleaf"
          />
        ) : caseId === 'editable-leaf-text-bold-leaf-pipe' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextPipeMode="leaf-only"
            pipeLeafText
          />
        ) : caseId === 'editable-leaf-text-bold-leaf-pipe-bold-only' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextPipeMode="leaf-only"
            pipeLeafText
          />
        ) : caseId === 'editable-leaf-text-bold-leaf-pipe-plain-outer' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="plain-renderers"
            leafTextPipeMode="leaf-only"
            pipeLeafText
          />
        ) : caseId === 'editable-leaf-text-bold-text-pipe' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextPipeMode="text-only"
            pipeLeafText
          />
        ) : caseId === 'editable-leaf-text-code-direct-renderers' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="code-direct-renderers"
          />
        ) : caseId === 'editable-leaf-text-code-plateleaf-direct' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="code-plateleaf"
          />
        ) : caseId === 'editable-leaf-text-code-plugin-leaf-direct' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="code-plugin-leaf"
          />
        ) : caseId === 'editable-leaf-text-code-pipe' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextPipeMode="leaf-only"
            pipeLeafText
          />
        ) : caseId === 'editable-leaf-text-code-text-pipe' ? (
          <BenchmarkEditableMount config={config} id={id} pipeLeafText />
        ) : caseId === 'editable-leaf-text-bold-pipe' ? (
          <BenchmarkEditableMount config={config} id={id} pipeLeafText />
        ) : caseId === 'editable-leaf-text-underline-direct-renderers' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="underline-direct-renderers"
          />
        ) : caseId === 'editable-leaf-text-underline-plugin-leaf-direct' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="underline-plugin-leaf"
          />
        ) : caseId === 'editable-leaf-text-underline-pipe' ? (
          <BenchmarkEditableMount config={config} id={id} pipeLeafText />
        ) : caseId === 'editable-leaf-text-pipe' ? (
          <BenchmarkEditableMount config={config} id={id} pipeLeafText />
        ) : caseId === 'editable-leaf-text-plain-renderers' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            leafTextBenchmarkMode="plain-renderers"
            pipeLeafText
          />
        ) : caseId === 'editable-render-pipes' ? (
          <BenchmarkEditableMount
            config={config}
            id={id}
            pipeElement
            pipeLeafText
          />
        ) : (
          <PlateContent
            className="min-h-[70vh] outline-none"
            domStrategy={getBenchmarkDOMStrategy(config)}
            renderElement={(props) => (
              <BenchmarkElement
                {...props}
                elementContentVisibility={
                  config.contentVisibility === 'element'
                }
              />
            )}
            spellCheck={false}
          />
        )}
      </Plate>
    </div>
  );
}

function ResultCard({
  constructionRunsLabel,
  isActive,
  label,
  metrics,
  mountRunsLabel,
  prebuiltMountRunsLabel,
}: {
  constructionRunsLabel: string;
  isActive: boolean;
  label: string;
  metrics: ScenarioMetrics;
  mountRunsLabel: string;
  prebuiltMountRunsLabel: string;
}) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-4',
        isActive && 'border-primary ring-1 ring-primary/30'
      )}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        {isActive ? (
          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
            mounted
          </span>
        ) : null}
      </div>

      <div className="space-y-1 font-mono text-sm">
        <div className="text-muted-foreground">
          Construction ({constructionRunsLabel})
        </div>
        {metrics.construction ? (
          <>
            <div className="flex justify-between">
              <span>mean</span>
              <span>{metrics.construction.mean.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>median</span>
              <span>{metrics.construction.median.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>p95</span>
              <span>{metrics.construction.p95.toFixed(2)} ms</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}

        <div className="text-muted-foreground">Mount ({mountRunsLabel})</div>
        {metrics.mount ? (
          <>
            <div className="flex justify-between">
              <span>mean</span>
              <span>{metrics.mount.mean.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>median</span>
              <span>{metrics.mount.median.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>p95</span>
              <span>{metrics.mount.p95.toFixed(2)} ms</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}

        <div className="text-muted-foreground">
          Prebuilt mount ({prebuiltMountRunsLabel})
        </div>
        {metrics.prebuiltMount ? (
          <>
            <div className="flex justify-between">
              <span>mean</span>
              <span>{metrics.prebuiltMount.mean.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>median</span>
              <span>{metrics.prebuiltMount.median.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>p95</span>
              <span>{metrics.prebuiltMount.p95.toFixed(2)} ms</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}

        <div className="pt-3 text-muted-foreground">Input latency</div>
        {metrics.input ? (
          <>
            <div className="flex justify-between">
              <span>mean</span>
              <span>{metrics.input.mean.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>median</span>
              <span>{metrics.input.median.toFixed(2)} ms</span>
            </div>
            <div className="flex justify-between">
              <span>p95</span>
              <span>{metrics.input.p95.toFixed(2)} ms</span>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground">No data</div>
        )}
      </div>
    </div>
  );
}

function FanoutCard({
  description,
  label,
  metrics,
}: {
  description: string;
  label: string;
  metrics: FanoutMetrics;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">mount mean</span>
          <span>
            {metrics.mount ? `${metrics.mount.mean.toFixed(2)} ms` : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">update mean</span>
          <span>
            {metrics.update
              ? `${metrics.update.mean.toFixed(2)} ms`
              : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">update commits</span>
          <span>
            {metrics.updateCommits
              ? metrics.updateCommits.mean.toFixed(2)
              : 'No data'}
          </span>
        </div>
      </div>
    </div>
  );
}

function CoreMountCard({
  activeElementIdMode,
  description,
  label,
  metrics,
}: {
  activeElementIdMode: CoreMountElementIdMode;
  description: string;
  label: string;
  metrics: CoreMountMetrics;
}) {
  const activeMetrics = metrics.mountByElementIdMode[activeElementIdMode];
  const offMetrics = metrics.mountByElementIdMode.off;
  const seededMetrics = metrics.mountByElementIdMode.seeded;

  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">off mean</span>
          <span>
            {offMetrics ? `${offMetrics.mean.toFixed(2)} ms` : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">seeded mean</span>
          <span>
            {seededMetrics ? `${seededMetrics.mean.toFixed(2)} ms` : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {activeElementIdMode} median
          </span>
          <span>
            {activeMetrics
              ? `${activeMetrics.median.toFixed(2)} ms`
              : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {activeElementIdMode} p95
          </span>
          <span>
            {activeMetrics ? `${activeMetrics.p95.toFixed(2)} ms` : 'No data'}
          </span>
        </div>
      </div>
    </div>
  );
}

function PluginCensusCard({
  entry,
  metrics,
}: {
  entry: CorePluginCensusEntry;
  metrics: PluginCensusEntryMetrics;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{entry.label}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {entry.description}
          </p>
        </div>
        <div className="rounded-md border px-2 py-1 font-mono text-xs">
          budget {entry.provisionalMountBudgetMs} ms
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {(['inactive', 'activated'] as const).map((lane) => (
          <div key={lane} className="rounded-md border p-3">
            <div className="mb-2 font-medium capitalize">{lane}</div>
            <div className="space-y-1 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plate</span>
                <span>
                  {metrics[lane].slate
                    ? `${metrics[lane].slate.mean.toFixed(2)} ms`
                    : 'No data'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plate core</span>
                <span>
                  {metrics[lane]['plate-core']
                    ? `${metrics[lane]['plate-core'].mean.toFixed(2)} ms`
                    : 'No data'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{entry.label}</span>
                <span>
                  {metrics[lane].plugin
                    ? `${metrics[lane].plugin.mean.toFixed(2)} ms`
                    : 'No data'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">delta vs core</span>
                <span>
                  {metrics[lane].plugin && metrics[lane]['plate-core']
                    ? `${(
                        metrics[lane].plugin.mean -
                        metrics[lane]['plate-core'].mean
                      ).toFixed(2)} ms`
                    : 'No data'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DissectionCard({
  label,
  description,
  metrics,
}: {
  label: string;
  description: string;
  metrics: DissectionMetrics;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">plugins</span>
          <span>{metrics.pluginCount ?? 'n/a'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">construct only</span>
          <span>
            {metrics.constructOnly
              ? `${metrics.constructOnly.mean.toFixed(2)} ms`
              : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">init only</span>
          <span>
            {metrics.initOnly
              ? `${metrics.initOnly.mean.toFixed(2)} ms`
              : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">create with value</span>
          <span>
            {metrics.createWithValue
              ? `${metrics.createWithValue.mean.toFixed(2)} ms`
              : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">pure migrateElementIds</span>
          <span>
            {metrics.staticNormalize
              ? `${metrics.staticNormalize.mean.toFixed(2)} ms`
              : 'n/a'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ids assigned in init</span>
          <span>
            {metrics.idsAssigned
              ? metrics.idsAssigned.mean.toFixed(0)
              : 'No data'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ElementIdFragmentCard({
  label,
  description,
  metrics,
}: {
  label: string;
  description: string;
  metrics: ElementIdFragmentMetrics;
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>

      <div className="mt-4 space-y-1 font-mono text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">fragment blocks</span>
          <span>{metrics.fragmentBlocks ?? 'n/a'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">fragment.replace</span>
          <span>
            {metrics.fragmentReplace
              ? `${metrics.fragmentReplace.mean.toFixed(2)} ms`
              : 'No data'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">ids assigned</span>
          <span>
            {metrics.idsAssigned
              ? metrics.idsAssigned.mean.toFixed(0)
              : 'No data'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EditorPerfPage() {
  const [config, setConfig] = React.useState<BenchmarkConfig>(
    () => HUGE_DOCUMENT_DEFAULT_BENCHMARK_CONFIG
  );
  const [didLoadSearchParams, setDidLoadSearchParams] = React.useState(false);
  const [activeScenarioId, setActiveScenarioId] =
    React.useState<ScenarioId>('slate');
  const [activeFanoutCaseId, setActiveFanoutCaseId] =
    React.useState<FanoutCaseId>('none');
  const [activeCoreMountCaseId, setActiveCoreMountCaseId] =
    React.useState<CoreMountCaseId>('provider-only');
  const [activeCoreMountElementIdMode, setActiveCoreMountElementIdMode] =
    React.useState<CoreMountElementIdMode>('off');
  const [activePluginCensusEntryId, setActivePluginCensusEntryId] =
    React.useState<CorePluginCensusEntryId | 'all'>('all');
  const [displayMode, setDisplayMode] = React.useState<'live' | 'prebuilt'>(
    'live'
  );
  const [mountVersion, setMountVersion] = React.useState(0);
  const [prebuiltEditor, setPrebuiltEditor] =
    React.useState<BenchmarkEditor | null>(null);
  const [fanoutSubscriberCount, setFanoutSubscriberCount] = React.useState(250);
  const [fanoutEditor, setFanoutEditor] = React.useState<Editor | null>(null);
  const [fanoutMountVersion, setFanoutMountVersion] = React.useState(0);
  const [coreMountEditor, setCoreMountEditor] = React.useState<Editor | null>(
    null
  );
  const [coreMountVersion, setCoreMountVersion] = React.useState(0);
  const [pluginCensusEditor, setPluginCensusEditor] =
    React.useState<BenchmarkEditor | null>(null);
  const [pluginCensusVersion, setPluginCensusVersion] = React.useState(0);
  const [pluginCensusSurface, setPluginCensusSurface] =
    React.useState<PluginCensusSurface | null>(null);
  const [runningLabel, setRunningLabel] = React.useState<string | null>(null);
  const [lastCompletedBenchmark, setLastCompletedBenchmark] = React.useState<
    string | null
  >(null);
  const [lastCompletedBenchmarkToken, setLastCompletedBenchmarkToken] =
    React.useState(0);
  const [results, setResults] = React.useState<
    Record<ScenarioId, ScenarioMetrics>
  >(
    () =>
      Object.fromEntries(
        SCENARIOS.map((scenario) => [
          scenario.id,
          {
            construction: null,
            input: null,
            mount: null,
            prebuiltMount: null,
          } satisfies ScenarioMetrics,
        ])
      ) as Record<ScenarioId, ScenarioMetrics>
  );
  const [dissectionResults, setDissectionResults] = React.useState<
    Record<DissectionCaseId, DissectionMetrics>
  >(
    () =>
      Object.fromEntries(
        DISSECTION_CASES.map((caseItem) => [
          caseItem.id,
          {
            constructOnly: null,
            createWithValue: null,
            idsAssigned: null,
            initOnly: null,
            pluginCount: null,
            staticNormalize: null,
          } satisfies DissectionMetrics,
        ])
      ) as Record<DissectionCaseId, DissectionMetrics>
  );
  const [elementIdFragmentResults, setElementIdFragmentResults] =
    React.useState<Record<ElementIdFragmentCaseId, ElementIdFragmentMetrics>>(
      () =>
        Object.fromEntries(
          ELEMENT_ID_FRAGMENT_CASES.map((caseItem) => [
            caseItem.id,
            {
              fragmentReplace: null,
              fragmentBlocks: null,
              idsAssigned: null,
            } satisfies ElementIdFragmentMetrics,
          ])
        ) as Record<ElementIdFragmentCaseId, ElementIdFragmentMetrics>
    );
  const [fanoutResults, setFanoutResults] = React.useState<
    Record<FanoutCaseId, FanoutMetrics>
  >(
    () =>
      Object.fromEntries(
        FANOUT_CASES.map((caseItem) => [
          caseItem.id,
          {
            mount: null,
            update: null,
            updateCommits: null,
          } satisfies FanoutMetrics,
        ])
      ) as Record<FanoutCaseId, FanoutMetrics>
  );
  const [coreMountResults, setCoreMountResults] = React.useState<
    Record<CoreMountCaseId, CoreMountMetrics>
  >(
    () =>
      Object.fromEntries(
        CORE_MOUNT_CASES.map((caseItem) => [
          caseItem.id,
          {
            mountByElementIdMode: {
              off: null,
              seeded: null,
            },
          } satisfies CoreMountMetrics,
        ])
      ) as Record<CoreMountCaseId, CoreMountMetrics>
  );
  const [pluginCensusResults, setPluginCensusResults] = React.useState<
    Record<CorePluginCensusEntryId, PluginCensusEntryMetrics>
  >(
    () =>
      Object.fromEntries(
        CORE_PLUGIN_CENSUS_ENTRIES.map((entry) => [
          entry.id,
          {
            activated: {
              'plate-core': null,
              plugin: null,
              slate: null,
            },
            inactive: {
              'plate-core': null,
              plugin: null,
              slate: null,
            },
          } satisfies PluginCensusEntryMetrics,
        ])
      ) as Record<CorePluginCensusEntryId, PluginCensusEntryMetrics>
  );

  const editorRef = React.useRef<BenchmarkEditorHandle | null>(null);
  const fanoutHandleRef = React.useRef<FanoutEditorHandle | null>(null);
  const mountDurationRef = React.useRef<Partial<Record<ScenarioId, number>>>(
    {}
  );
  const fanoutMountDurationRef = React.useRef<
    Partial<Record<FanoutCaseId, number>>
  >({});
  const fanoutUpdateDurationRef = React.useRef<
    Partial<Record<FanoutCaseId, number>>
  >({});
  const fanoutUpdateCommitCountRef = React.useRef<
    Partial<Record<FanoutCaseId, number>>
  >({});
  const coreMountDurationRef = React.useRef<
    Partial<Record<CoreMountCaseId, number>>
  >({});
  const pluginCensusDurationRef = React.useRef<
    Partial<Record<PluginCensusScenarioId, number>>
  >({});
  const runnerScenarioIdRef = React.useRef<ScenarioId | undefined>(undefined);
  const activeScenario = React.useMemo(
    () =>
      SCENARIOS.find((scenario) => scenario.id === activeScenarioId) ??
      failInvariant('Expected value to be defined'),
    [activeScenarioId]
  );
  const activeFanoutCase = React.useMemo(
    () =>
      FANOUT_CASES.find((caseItem) => caseItem.id === activeFanoutCaseId) ??
      failInvariant('Expected value to be defined'),
    [activeFanoutCaseId]
  );
  const activeCoreMountCase = React.useMemo(
    () =>
      CORE_MOUNT_CASES.find(
        (caseItem) => caseItem.id === activeCoreMountCaseId
      ) ?? failInvariant('Expected value to be defined'),
    [activeCoreMountCaseId]
  );
  const selectedPluginCensusEntries = React.useMemo(
    () =>
      activePluginCensusEntryId === 'all'
        ? CORE_PLUGIN_CENSUS_ENTRIES
        : CORE_PLUGIN_CENSUS_ENTRIES.filter(
            (entry) => entry.id === activePluginCensusEntryId
          ),
    [activePluginCensusEntryId]
  );
  const activePluginCensusEntry = React.useMemo(
    () =>
      CORE_PLUGIN_CENSUS_ENTRIES.find(
        (entry) =>
          entry.id ===
          (pluginCensusSurface?.entryId ??
            (activePluginCensusEntryId === 'all'
              ? CORE_PLUGIN_CENSUS_ENTRIES[0]?.id
              : activePluginCensusEntryId))
      ) ?? null,
    [activePluginCensusEntryId, pluginCensusSurface]
  );

  const activeValue = React.useMemo(
    () =>
      getScenarioValue({
        blocks: config.blocks,
        scenario: activeScenario,
        workloadId: config.scenarioWorkload,
      }),
    [activeScenario, config.blocks, config.scenarioWorkload]
  );
  const exportData = React.useMemo(
    () => ({
      config,
      lastCompletedRun: {
        benchmark: lastCompletedBenchmark,
        token: lastCompletedBenchmarkToken,
      },
      results,
      dissection: {
        cases: DISSECTION_CASES,
        results: dissectionResults,
        runs: {
          createWithValue: 25,
          constructOnly: 25,
          initOnly: 25,
          staticNormalize: 25,
        },
      },
      elementIdFragment: {
        cases: ELEMENT_ID_FRAGMENT_CASES,
        config: {
          fragmentBlocks: getDefaultElementIdFragmentBlockCount(config.blocks),
        },
        results: elementIdFragmentResults,
        runs: {
          fragmentReplace: 25,
        },
      },
      fanout: {
        cases: FANOUT_CASES,
        config: {
          subscriberCount: fanoutSubscriberCount,
        },
        results: fanoutResults,
        runs: {
          mount: 10,
          update: 10,
        },
      },
      coreMount: {
        activeCaseId: activeCoreMountCaseId,
        activeElementIdMode: activeCoreMountElementIdMode,
        cases: CORE_MOUNT_CASES,
        results: coreMountResults,
        runs: {
          mount: 10,
        },
      },
      pluginCensus: {
        activeEntryId: activePluginCensusEntryId,
        entries: CORE_PLUGIN_CENSUS_ENTRIES,
        results: pluginCensusResults,
        runs: {
          mount: 10,
        },
      },
      runs: {
        construction: 50,
        input: 20,
        mount: 10,
        prebuiltMount: 10,
      },
      scenarios: SCENARIOS.map(
        ({ description, id, kind, label, elementId, plugins, seedIds }) => ({
          description,
          id,
          kind,
          label,
          elementId: elementId ?? null,
          plugins,
          seedIds: seedIds ?? false,
        })
      ),
    }),
    [
      config,
      activeCoreMountCaseId,
      activeCoreMountElementIdMode,
      activePluginCensusEntryId,
      coreMountResults,
      dissectionResults,
      elementIdFragmentResults,
      fanoutResults,
      fanoutSubscriberCount,
      lastCompletedBenchmark,
      lastCompletedBenchmarkToken,
      pluginCensusResults,
      results,
    ]
  );

  const markBenchmarkComplete = React.useCallback((benchmark: string) => {
    setLastCompletedBenchmark(benchmark);
    setLastCompletedBenchmarkToken((current) => current + 1);
  }, []);

  const remountScenario = React.useCallback(async (scenarioId: ScenarioId) => {
    mountDurationRef.current[scenarioId] = undefined;
    setDisplayMode('live');
    setPrebuiltEditor(null);
    setActiveScenarioId(scenarioId);
    setMountVersion((version) => version + 1);
    await waitForNextPaint();
    await wait(80);
  }, []);

  const mountPrebuiltScenario = React.useCallback(
    async (scenarioId: ScenarioId) => {
      mountDurationRef.current[scenarioId] = undefined;

      const scenario =
        SCENARIOS.find((item) => item.id === scenarioId) ??
        failInvariant('Expected value to be defined');
      const nextEditor = createScenarioMountedEditor({
        config,
        scenario,
        value: getScenarioValue({
          blocks: config.blocks,
          scenario,
          workloadId: config.scenarioWorkload,
        }),
      });

      setDisplayMode('prebuilt');
      setPrebuiltEditor(nextEditor);
      setActiveScenarioId(scenarioId);
      setMountVersion((version) => version + 1);
      await waitForNextPaint();
      await wait(80);
    },
    [config]
  );

  const mountFanoutCase = React.useCallback(
    async (caseId: FanoutCaseId) => {
      fanoutMountDurationRef.current[caseId] = undefined;
      fanoutUpdateDurationRef.current[caseId] = undefined;
      fanoutUpdateCommitCountRef.current[caseId] = 0;

      const nextEditor = createFanoutEditor({
        config,
        value: getEditorPerfWorkloadValue({
          blocks: config.blocks,
          workloadId: 'huge-mixed-block',
        }),
      });

      setFanoutEditor(nextEditor);
      setActiveFanoutCaseId(caseId);
      setFanoutMountVersion((version) => version + 1);
      await waitForNextPaint();
      await wait(80);
    },
    [config]
  );

  const unmountFanoutSurface = React.useCallback(async () => {
    setFanoutEditor(null);
    await waitForNextPaint();
    await wait(40);
  }, []);

  const mountCoreMountCase = React.useCallback(
    async (caseId: CoreMountCaseId) => {
      coreMountDurationRef.current[caseId] = undefined;
      const caseItem = CORE_MOUNT_CASES.find((item) => item.id === caseId);
      const seedIds = activeCoreMountElementIdMode === 'seeded';
      const value = getCoreMountValue({
        blocks: config.blocks,
        documentMode: caseItem?.documentMode,
        seedIds,
      });

      const nextEditor = createCoreMountEditor({
        config,
        elementId: seedIds,
        plugins: caseItem?.plugins ?? 'none',
        value,
      });

      setCoreMountEditor(nextEditor);
      setActiveCoreMountCaseId(caseId);
      setCoreMountVersion((version) => version + 1);
      await waitForNextPaint();
      await wait(80);
    },
    [activeCoreMountElementIdMode, config]
  );

  const unmountCoreMountSurface = React.useCallback(async () => {
    setCoreMountEditor(null);
    await waitForNextPaint();
    await wait(40);
  }, []);

  const mountPluginCensusScenario = React.useCallback(
    async ({
      entryId,
      lane,
      scenarioId,
    }: {
      entryId: CorePluginCensusEntryId;
      lane: PluginCensusLaneId;
      scenarioId: PluginCensusScenarioId;
    }) => {
      pluginCensusDurationRef.current[scenarioId] = undefined;

      const entry =
        CORE_PLUGIN_CENSUS_ENTRIES.find((item) => item.id === entryId) ??
        failInvariant('Expected value to be defined');
      const value = getPluginCensusValue({
        blocks: config.blocks,
        entry,
        lane,
      });
      const nextEditor =
        scenarioId === 'slate'
          ? createScenarioMountedEditor({
              config,
              scenario: {
                description: 'Plate baseline for plugin census.',
                id: 'slate',
                kind: 'slate',
                label: 'Plate',
                plugins: 'none',
              },
              value,
            })
          : createPluginCensusMountedEditor({
              config,
              plugins: scenarioId === 'plugin' ? entry.pluginSet : 'none',
              value,
            });

      setPluginCensusEditor(nextEditor);
      setPluginCensusSurface({ entryId, lane, scenarioId });
      setPluginCensusVersion((version) => version + 1);
      await waitForNextPaint();
      await wait(80);
    },
    [config]
  );

  const unmountPluginCensusSurface = React.useCallback(async () => {
    setPluginCensusEditor(null);
    setPluginCensusSurface(null);
    await waitForNextPaint();
    await wait(40);
  }, []);

  const onRender = React.useCallback<React.ProfilerOnRenderCallback>(
    (id, phase, actualDuration) => {
      if (phase === 'mount') {
        mountDurationRef.current[id as ScenarioId] = actualDuration;
      }
    },
    []
  );

  const onFanoutRender = React.useCallback<React.ProfilerOnRenderCallback>(
    (id, phase, actualDuration) => {
      const caseId = id as FanoutCaseId;

      if (phase === 'mount') {
        fanoutMountDurationRef.current[caseId] = actualDuration;
      }

      if (phase === 'update') {
        fanoutUpdateDurationRef.current[caseId] =
          (fanoutUpdateDurationRef.current[caseId] ?? 0) + actualDuration;
        fanoutUpdateCommitCountRef.current[caseId] =
          (fanoutUpdateCommitCountRef.current[caseId] ?? 0) + 1;
      }
    },
    []
  );

  const onCoreMountRender = React.useCallback<React.ProfilerOnRenderCallback>(
    (id, phase, actualDuration) => {
      if (phase === 'mount') {
        coreMountDurationRef.current[id as CoreMountCaseId] = actualDuration;
      }
    },
    []
  );

  const onPluginCensusRender =
    React.useCallback<React.ProfilerOnRenderCallback>(
      (id, phase, actualDuration) => {
        if (phase === 'mount') {
          pluginCensusDurationRef.current[id as PluginCensusScenarioId] =
            actualDuration;
        }
      },
      []
    );

  const runMountBenchmark = React.useCallback(async () => {
    const previousScenarioId = activeScenarioId;
    const WARMUP_RUNS = 3;
    const MEASURED_RUNS = 10;
    const COOLDOWN_MS = 120;

    setRunningLabel('Running mount benchmark');

    try {
      for (const scenario of getRunnerScenarios(runnerScenarioIdRef.current)) {
        const samples: number[] = [];

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;

          await remountScenario(scenario.id);

          const duration = mountDurationRef.current[scenario.id];

          if (!isWarmup && duration != null) {
            samples.push(duration);
          }

          await wait(COOLDOWN_MS);
        }

        setResults((current) => ({
          ...current,
          [scenario.id]: {
            ...current[scenario.id],
            mount: calculateStats(samples),
          },
        }));
      }
    } finally {
      await remountScenario(previousScenarioId);
      setRunningLabel(null);
    }
    markBenchmarkComplete('mount');
  }, [activeScenarioId, markBenchmarkComplete, remountScenario]);

  const runConstructionBenchmark = React.useCallback(async () => {
    const CONSTRUCTIONS_PER_SAMPLE = 20;
    const WARMUP_RUNS = 10;
    const MEASURED_RUNS = 50;

    setRunningLabel('Running construction benchmark');

    try {
      for (const scenario of getRunnerScenarios(runnerScenarioIdRef.current)) {
        const samples: number[] = [];

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;
          const start = performance.now();

          for (
            let construction = 0;
            construction < CONSTRUCTIONS_PER_SAMPLE;
            construction++
          ) {
            createScenarioConstructionEditor(scenario);
          }

          const duration =
            (performance.now() - start) / CONSTRUCTIONS_PER_SAMPLE;

          if (!isWarmup) {
            samples.push(duration);
          }

          if (run % 10 === 0) {
            await wait(0);
          }
        }

        setResults((current) => ({
          ...current,
          [scenario.id]: {
            ...current[scenario.id],
            construction: calculateStats(samples),
          },
        }));
      }
    } finally {
      setRunningLabel(null);
    }
    markBenchmarkComplete('construction');
  }, [markBenchmarkComplete]);

  const runPrebuiltMountBenchmark = React.useCallback(async () => {
    const previousScenarioId = activeScenarioId;
    const WARMUP_RUNS = 3;
    const MEASURED_RUNS = 10;
    const COOLDOWN_MS = 120;

    setRunningLabel('Running prebuilt mount benchmark');

    try {
      for (const scenario of getRunnerScenarios(runnerScenarioIdRef.current)) {
        const samples: number[] = [];

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;

          await mountPrebuiltScenario(scenario.id);

          const duration = mountDurationRef.current[scenario.id];

          if (!isWarmup && duration != null) {
            samples.push(duration);
          }

          await wait(COOLDOWN_MS);
        }

        setResults((current) => ({
          ...current,
          [scenario.id]: {
            ...current[scenario.id],
            prebuiltMount: calculateStats(samples),
          },
        }));
      }
    } finally {
      await remountScenario(previousScenarioId);
      setRunningLabel(null);
    }
    markBenchmarkComplete('prebuilt-mount');
  }, [
    activeScenarioId,
    markBenchmarkComplete,
    mountPrebuiltScenario,
    remountScenario,
  ]);

  const runPluginCensusBenchmark = React.useCallback(async () => {
    const WARMUP_RUNS = 3;
    const MEASURED_RUNS = 10;
    const COOLDOWN_MS = 120;
    const scenarioIds: PluginCensusScenarioId[] = [
      'slate',
      'plate-core',
      'plugin',
    ];

    setRunningLabel('Running core plugin census');

    try {
      for (const entry of selectedPluginCensusEntries) {
        for (const lane of ['inactive', 'activated'] as const) {
          const nextLaneMetrics: PluginCensusLaneMetrics = {
            'plate-core': null,
            plugin: null,
            slate: null,
          };

          for (const scenarioId of scenarioIds) {
            const samples: number[] = [];

            for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
              const isWarmup = run < WARMUP_RUNS;

              await mountPluginCensusScenario({
                entryId: entry.id,
                lane,
                scenarioId,
              });

              const duration = pluginCensusDurationRef.current[scenarioId];

              if (!isWarmup && duration != null) {
                samples.push(duration);
              }

              await wait(COOLDOWN_MS);
            }

            nextLaneMetrics[scenarioId] = calculateStats(samples);
          }

          setPluginCensusResults((current) => ({
            ...current,
            [entry.id]: {
              ...current[entry.id],
              [lane]: nextLaneMetrics,
            },
          }));
        }
      }
    } finally {
      await unmountPluginCensusSurface();
      setRunningLabel(null);
    }

    markBenchmarkComplete('plugin-census');
  }, [
    markBenchmarkComplete,
    mountPluginCensusScenario,
    selectedPluginCensusEntries,
    unmountPluginCensusSurface,
  ]);

  const runDissectionBenchmark = React.useCallback(async () => {
    const WARMUP_RUNS = 5;
    const MEASURED_RUNS = 25;

    setRunningLabel('Running Plate init dissection benchmark');

    try {
      for (const caseItem of DISSECTION_CASES) {
        const constructOnlySamples: number[] = [];
        const createWithValueSamples: number[] = [];
        const idsAssignedSamples: number[] = [];
        const initOnlySamples: number[] = [];
        const staticNormalizeSamples: number[] = [];
        let pluginCount: number | null = null;

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;

          const constructStart = performance.now();
          const constructEditor = createPlateDissectionEditor({
            caseItem,
            config,
          });
          const constructDuration = performance.now() - constructStart;

          pluginCount = getPlateRuntime(constructEditor).pluginList.length;

          if (!isWarmup) {
            constructOnlySamples.push(constructDuration);
          }

          const initCounter = { count: 0 };
          const initStart = performance.now();
          createPlateDissectionEditor({
            caseItem,
            config,
            counter: initCounter,
            value: getDissectionValue(caseItem, config.blocks),
          });
          const initDuration = performance.now() - initStart;

          if (!isWarmup) {
            idsAssignedSamples.push(initCounter.count);
            initOnlySamples.push(initDuration);
          }

          const createCounter = { count: 0 };
          const createStart = performance.now();
          const createdEditor = createPlateDissectionEditor({
            caseItem,
            config,
            counter: createCounter,
            value: getDissectionValue(caseItem, config.blocks),
          });
          const createDuration = performance.now() - createStart;

          pluginCount = getPlateRuntime(createdEditor).pluginList.length;

          if (!isWarmup) {
            createWithValueSamples.push(createDuration);
          }

          if (caseItem.elementId) {
            const staticNormalizeCounter = { count: 0 };
            const staticNormalizeStart = performance.now();

            migrateElementIds(getDissectionValue(caseItem, config.blocks), {
              generateId: createBenchIdFactory(
                staticNormalizeCounter,
                'static-normalize'
              ),
            });

            const staticNormalizeDuration =
              performance.now() - staticNormalizeStart;

            if (!isWarmup) {
              staticNormalizeSamples.push(staticNormalizeDuration);
            }
          }

          if (run % 5 === 0) {
            await wait(0);
          }
        }

        setDissectionResults((current) => ({
          ...current,
          [caseItem.id]: {
            constructOnly: calculateStats(constructOnlySamples),
            createWithValue: calculateStats(createWithValueSamples),
            idsAssigned: calculateStats(idsAssignedSamples),
            initOnly: calculateStats(initOnlySamples),
            pluginCount,
            staticNormalize: caseItem.elementId
              ? calculateStats(staticNormalizeSamples)
              : null,
          },
        }));
      }
    } finally {
      setRunningLabel(null);
    }
    markBenchmarkComplete('init-dissection');
  }, [config, markBenchmarkComplete]);

  const runElementIdFragmentBenchmark = React.useCallback(async () => {
    const WARMUP_RUNS = 5;
    const MEASURED_RUNS = 25;

    setRunningLabel('Running elementId paste/import dissection');

    try {
      for (const caseItem of ELEMENT_ID_FRAGMENT_CASES) {
        const fragmentReplaceSamples: number[] = [];
        const idsAssignedSamples: number[] = [];
        let fragmentBlocks: number | null = null;

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;
          const idCounter = { count: 0 };
          const { fragment, value } = getElementIdFragmentValue(
            caseItem,
            config.blocks
          );
          const editor = createEditor({
            plugins: getElementIdPlugins({
              counter: idCounter,
              enabled: caseItem.elementId,
            }),
            initialValue: value,
          });
          const idCountBeforeInsert = idCounter.count;

          const end = editor.read.points.end([]);

          if (!end) {
            throw new Error('Node id fragment benchmark requires a text end.');
          }

          editor.update.selection.set({ anchor: end, focus: end });

          const insertStart = performance.now();
          editor.update((tx) => {
            tx.fragment.replace(fragment);
          });
          const insertDuration = performance.now() - insertStart;

          if (!isWarmup) {
            fragmentBlocks = fragment.length;
            fragmentReplaceSamples.push(insertDuration);
            idsAssignedSamples.push(idCounter.count - idCountBeforeInsert);
          }

          if (run % 5 === 0) {
            await wait(0);
          }
        }

        setElementIdFragmentResults((current) => ({
          ...current,
          [caseItem.id]: {
            fragmentReplace: calculateStats(fragmentReplaceSamples),
            fragmentBlocks,
            idsAssigned: calculateStats(idsAssignedSamples),
          },
        }));
      }
    } finally {
      setRunningLabel(null);
    }

    markBenchmarkComplete('element-id-fragment');
  }, [config, markBenchmarkComplete]);

  const runFanoutBenchmark = React.useCallback(async () => {
    const WARMUP_RUNS = 3;
    const MEASURED_RUNS = 10;
    const COOLDOWN_MS = 120;

    setRunningLabel(
      `Running store fan-out benchmark (${fanoutSubscriberCount} subscribers)`
    );

    try {
      for (const caseItem of FANOUT_CASES) {
        const mountSamples: number[] = [];
        const updateSamples: number[] = [];
        const updateCommitSamples: number[] = [];

        for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
          const isWarmup = run < WARMUP_RUNS;

          await mountFanoutCase(caseItem.id);

          const handle = fanoutHandleRef.current;

          if (!handle) {
            throw new Error(`Fanout handle missing for ${caseItem.id}`);
          }

          fanoutUpdateDurationRef.current[caseItem.id] = 0;
          fanoutUpdateCommitCountRef.current[caseItem.id] = 0;

          handle.triggerUpdate();
          await waitForNextPaint();
          await wait(80);

          if (!isWarmup) {
            mountSamples.push(fanoutMountDurationRef.current[caseItem.id] ?? 0);
            updateSamples.push(
              fanoutUpdateDurationRef.current[caseItem.id] ?? 0
            );
            updateCommitSamples.push(
              fanoutUpdateCommitCountRef.current[caseItem.id] ?? 0
            );
          }

          await unmountFanoutSurface();
          await wait(COOLDOWN_MS);
        }

        setFanoutResults((current) => ({
          ...current,
          [caseItem.id]: {
            mount: calculateStats(mountSamples),
            update: calculateStats(updateSamples),
            updateCommits: calculateStats(updateCommitSamples),
          },
        }));
      }
    } finally {
      await unmountFanoutSurface();
      setRunningLabel(null);
    }
    markBenchmarkComplete('store-fanout');
  }, [
    fanoutSubscriberCount,
    markBenchmarkComplete,
    mountFanoutCase,
    unmountFanoutSurface,
  ]);

  const runCoreMountCases = React.useCallback(
    async ({
      caseIds,
      label,
    }: {
      caseIds: CoreMountCaseId[];
      label: string;
    }) => {
      const WARMUP_RUNS = 3;
      const MEASURED_RUNS = 10;
      const COOLDOWN_MS = 120;

      setRunningLabel(label);

      try {
        for (const caseId of caseIds) {
          const samples: number[] = [];

          for (let run = 0; run < WARMUP_RUNS + MEASURED_RUNS; run++) {
            const isWarmup = run < WARMUP_RUNS;

            await mountCoreMountCase(caseId);

            if (!isWarmup) {
              samples.push(coreMountDurationRef.current[caseId] ?? 0);
            }

            await unmountCoreMountSurface();
            await wait(COOLDOWN_MS);
          }

          setCoreMountResults((current) => ({
            ...current,
            [caseId]: {
              mountByElementIdMode: {
                ...current[caseId].mountByElementIdMode,
                [activeCoreMountElementIdMode]: calculateStats(samples),
              },
            },
          }));
        }
      } finally {
        await unmountCoreMountSurface();
        setRunningLabel(null);
      }
    },
    [activeCoreMountElementIdMode, mountCoreMountCase, unmountCoreMountSurface]
  );

  const runCoreMountBenchmark = React.useCallback(async () => {
    await runCoreMountCases({
      caseIds: CORE_MOUNT_CASES.map((caseItem) => caseItem.id),
      label: 'Running Plate core mount dissection',
    });
    markBenchmarkComplete('core-mount');
  }, [markBenchmarkComplete, runCoreMountCases]);

  const runActiveCoreMountBenchmark = React.useCallback(async () => {
    await runCoreMountCases({
      caseIds: [activeCoreMountCaseId],
      label: `Running Plate core mount stage: ${activeCoreMountCase.label}`,
    });
    markBenchmarkComplete('core-mount');
  }, [
    activeCoreMountCase,
    activeCoreMountCaseId,
    markBenchmarkComplete,
    runCoreMountCases,
  ]);

  const runInputBenchmark = React.useCallback(async () => {
    const previousScenarioId = activeScenarioId;
    const WARMUP_SAMPLES = 5;
    const MEASURED_SAMPLES = 20;

    setRunningLabel('Running input latency benchmark');

    try {
      for (const scenario of getRunnerScenarios(runnerScenarioIdRef.current)) {
        const samples: number[] = [];

        await remountScenario(scenario.id);

        const handle = editorRef.current;
        if (!handle) continue;

        await handle.focusEditable();
        handle.selectStart();
        await waitForNextPaint();
        await wait(60);

        for (
          let sampleIndex = 0;
          sampleIndex < WARMUP_SAMPLES + MEASURED_SAMPLES;
          sampleIndex++
        ) {
          const isWarmup = sampleIndex < WARMUP_SAMPLES;
          const char = String.fromCharCode(97 + (sampleIndex % 26));
          const start = performance.now();

          handle.insertText(char);
          await waitForNextPaint();

          const latency = performance.now() - start;

          if (!isWarmup) {
            samples.push(latency);
          }

          await wait(40);
        }

        setResults((current) => ({
          ...current,
          [scenario.id]: {
            ...current[scenario.id],
            input: calculateLatencyStats(samples),
          },
        }));
      }
    } finally {
      await remountScenario(previousScenarioId);
      setRunningLabel(null);
    }
    markBenchmarkComplete('input');
  }, [activeScenarioId, markBenchmarkComplete, remountScenario]);

  const configureRunnerControls = React.useCallback(
    async ({
      blocks,
      chunkSize,
      chunking,
      coreMountCase,
      coreMountElementId,
      fanoutSubscribers,
      pluginCensusEntry,
      scenario,
      scenarioWorkload,
      visibility,
    }: EditorPerfRunnerControls) => {
      getRunnerScenarios(scenario);
      runnerScenarioIdRef.current = scenario;
      setDisplayMode('live');
      setPrebuiltEditor(null);
      setFanoutEditor(null);
      setCoreMountEditor(null);
      setConfig({
        blocks,
        chunkSize,
        chunking,
        contentVisibility: visibility,
        scenarioWorkload,
      });
      setFanoutSubscriberCount(
        fanoutSubscribers ? Number(fanoutSubscribers) : 250
      );

      if (coreMountCase) {
        setActiveCoreMountCaseId(coreMountCase as CoreMountCaseId);
      }
      if (coreMountElementId) {
        setActiveCoreMountElementIdMode(
          coreMountElementId as CoreMountElementIdMode
        );
      }
      if (pluginCensusEntry) {
        setActivePluginCensusEntryId(pluginCensusEntry);
      }

      setMountVersion((version) => version + 1);
      await waitForNextPaint();
      await wait(80);
    },
    []
  );

  const runRunnerBenchmark = React.useCallback(
    async (benchmark: RunnerBenchmarkName) => {
      if (benchmark === 'construction') {
        await runConstructionBenchmark();
        return;
      }
      if (benchmark === 'prebuilt-mount') {
        await runPrebuiltMountBenchmark();
        return;
      }
      if (benchmark === 'init-dissection') {
        await runDissectionBenchmark();
        return;
      }
      if (benchmark === 'element-id-fragment') {
        await runElementIdFragmentBenchmark();
        return;
      }
      if (benchmark === 'core-mount') {
        await runActiveCoreMountBenchmark();
        return;
      }
      if (benchmark === 'store-fanout') {
        await runFanoutBenchmark();
        return;
      }
      if (benchmark === 'plugin-census') {
        await runPluginCensusBenchmark();
        return;
      }
      if (benchmark === 'mount') {
        await runMountBenchmark();
        return;
      }

      await runInputBenchmark();
    },
    [
      runConstructionBenchmark,
      runDissectionBenchmark,
      runElementIdFragmentBenchmark,
      runFanoutBenchmark,
      runInputBenchmark,
      runMountBenchmark,
      runPluginCensusBenchmark,
      runPrebuiltMountBenchmark,
      runActiveCoreMountBenchmark,
    ]
  );

  React.useEffect(() => {
    const runnerWindow = window as Window & {
      __editorPerfHarness?: EditorPerfRunnerHarness;
    };
    const harness: EditorPerfRunnerHarness = {
      configure: configureRunnerControls,
      runBenchmark: runRunnerBenchmark,
    };

    runnerWindow.__editorPerfHarness = harness;

    return () => {
      if (runnerWindow.__editorPerfHarness === harness) {
        runnerWindow.__editorPerfHarness = undefined;
      }
    };
  }, [configureRunnerControls, runRunnerBenchmark]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      setConfig(getInitialHugeDocumentBenchmarkConfig());
      setActiveScenarioId(getInitialScenarioId());
      setDidLoadSearchParams(true);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  React.useEffect(() => {
    if (!didLoadSearchParams) return;

    writeHugeDocumentBenchmarkSearchParams(config);
  }, [config, didLoadSearchParams]);

  return (
    <main className="container mx-auto space-y-6 p-8">
      <span className="sr-only" data-test-id="editor-perf-active-scenario">
        {activeScenarioId}
      </span>
      <span className="sr-only" data-test-id="huge-document-effective-strategy">
        {getBenchmarkDOMStrategy(config)}
      </span>
      <span className="sr-only" data-test-id="huge-document-requested-strategy">
        {getBenchmarkDOMStrategy(config)}
      </span>
      <section className="space-y-3">
        <h1 className="text-3xl font-bold">Plate vs Plate Editor Perf</h1>
        <p className="max-w-4xl text-muted-foreground">
          One scenario is mounted at a time. That is intentional. Mounting four
          huge editors at once would make the numbers useless.
        </p>
        <p className="max-w-4xl text-sm text-muted-foreground">
          The input lane calls the editor API against reduced plugin sets. Run
          <code> pnpm --filter www perf:homepage-input</code> for native
          keyboard latency through the complete homepage editor stack.
        </p>
      </section>

      <section className="rounded-xl border bg-muted/20 p-5">
        <div className="mb-4 grid gap-4 md:grid-cols-7">
          <label className="space-y-2">
            <span className="block text-sm font-medium">Blocks</span>
            <select
              aria-label="Blocks"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={config.blocks}
              onChange={(event) => {
                setConfig((current) => ({
                  ...current,
                  blocks: Number(event.target.value),
                }));
                setMountVersion((version) => version + 1);
              }}
            >
              {BLOCK_OPTIONS.map((blocks) => (
                <option key={blocks} value={blocks}>
                  {blocks.toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">Chunk size</span>
            <select
              aria-label="Chunk size"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={config.chunkSize}
              onChange={(event) => {
                setConfig((current) => ({
                  ...current,
                  chunkSize: Number(event.target.value),
                }));
                setMountVersion((version) => version + 1);
              }}
            >
              {CHUNK_SIZE_OPTIONS.map((chunkSize) => (
                <option key={chunkSize} value={chunkSize}>
                  {chunkSize.toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">Scenario workload</span>
            <select
              aria-label="Scenario workload"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={config.scenarioWorkload}
              onChange={(event) => {
                setConfig((current) => ({
                  ...current,
                  scenarioWorkload: event.target.value as ScenarioWorkloadId,
                }));
                setMountVersion((version) => version + 1);
              }}
            >
              {SCENARIO_WORKLOADS.map((workload) => (
                <option key={workload.id} value={workload.id}>
                  {workload.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Content visibility
            </span>
            <select
              aria-label="Content visibility"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={config.contentVisibility}
              onChange={(event) => {
                setConfig((current) => ({
                  ...current,
                  contentVisibility: event.target
                    .value as BenchmarkConfig['contentVisibility'],
                }));
                setMountVersion((version) => version + 1);
              }}
            >
              <option value="none">none</option>
              <option value="element">element</option>
              <option value="chunk">chunk</option>
            </select>
          </label>

          <label className="flex items-end gap-3 rounded-md border bg-background px-4 py-3">
            <input
              aria-label="Chunking enabled"
              checked={config.chunking}
              type="checkbox"
              onChange={(event) => {
                setConfig((current) => ({
                  ...current,
                  chunking: event.target.checked,
                }));
                setMountVersion((version) => version + 1);
              }}
            />
            <span className="text-sm font-medium">Chunking enabled</span>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Fan-out subscribers
            </span>
            <select
              aria-label="Fan-out subscribers"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={fanoutSubscriberCount}
              onChange={(event) => {
                setFanoutSubscriberCount(Number(event.target.value));
              }}
            >
              {FANOUT_SUBSCRIBER_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count.toLocaleString()}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="block text-sm font-medium">
              Core plugin census
            </span>
            <select
              aria-label="Core plugin census entry"
              className="w-full rounded-md border bg-background px-3 py-2"
              value={activePluginCensusEntryId}
              onChange={(event) => {
                setActivePluginCensusEntryId(
                  event.target.value as CorePluginCensusEntryId | 'all'
                );
              }}
            >
              <option value="all">All core plugins</option>
              {CORE_PLUGIN_CENSUS_ENTRIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SCENARIOS.map((scenario) => (
            <Button
              key={scenario.id}
              disabled={!!runningLabel}
              variant={scenario.id === activeScenarioId ? 'default' : 'outline'}
              onClick={() => {
                setActiveScenarioId(scenario.id);
                setMountVersion((version) => version + 1);
              }}
            >
              {scenario.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            data-testid="run-construction-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runConstructionBenchmark}
          >
            Run construction benchmark
          </Button>
          <Button
            data-testid="run-mount-benchmark"
            disabled={!!runningLabel}
            onClick={runMountBenchmark}
          >
            Run mount benchmark
          </Button>
          <Button
            data-testid="run-prebuilt-mount-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runPrebuiltMountBenchmark}
          >
            Run prebuilt mount benchmark
          </Button>
          <Button
            data-testid="run-input-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runInputBenchmark}
          >
            Run input latency benchmark
          </Button>
          <Button
            data-testid="run-dissection-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runDissectionBenchmark}
          >
            Run init dissection
          </Button>
          <Button
            data-testid="run-element-id-fragment-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runElementIdFragmentBenchmark}
          >
            Run paste/import dissection
          </Button>
          <Button
            data-testid="run-store-fanout-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runFanoutBenchmark}
          >
            Run store fan-out benchmark
          </Button>
          <Button
            data-testid="run-core-mount-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runCoreMountBenchmark}
          >
            Run core mount dissection
          </Button>
          <Button
            data-testid="run-active-core-mount-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runActiveCoreMountBenchmark}
          >
            Run active core mount stage
          </Button>
          <Button
            data-testid="run-plugin-census-benchmark"
            disabled={!!runningLabel}
            variant="secondary"
            onClick={runPluginCensusBenchmark}
          >
            Run core plugin census
          </Button>
          <Button
            disabled={!!runningLabel}
            variant="outline"
            onClick={() => {
              setMountVersion((version) => version + 1);
            }}
          >
            Remount active scenario
          </Button>
        </div>

        {runningLabel ? (
          <p
            data-testid="editor-perf-running-label"
            className="mt-3 text-sm text-muted-foreground"
          >
            {runningLabel}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border bg-background p-4">
            <h2 className="mb-2 font-semibold">Active scenario</h2>
            <div className="font-medium">{activeScenario.label}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeScenario.description}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">blocks</div>
                <div>{config.blocks.toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">chunk size</div>
                <div>{config.chunkSize.toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">chunking</div>
                <div>{config.chunking ? 'on' : 'off'}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">visibility</div>
                <div>{config.contentVisibility}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">scenario workload</div>
                <div>{config.scenarioWorkload}</div>
              </div>
            </div>
          </div>

          {SCENARIOS.map((scenario) => (
            <ResultCard
              key={scenario.id}
              constructionRunsLabel="50 measured"
              isActive={scenario.id === activeScenarioId}
              label={scenario.label}
              metrics={results[scenario.id]}
              mountRunsLabel="10 measured"
              prebuiltMountRunsLabel="10 measured"
            />
          ))}

          {CORE_PLUGIN_CENSUS_ENTRIES.map((entry) => (
            <PluginCensusCard
              key={entry.id}
              entry={entry}
              metrics={pluginCensusResults[entry.id]}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-background">
            <React.Profiler
              key={`${displayMode}:${activeScenarioId}:${mountVersion}`}
              id={activeScenarioId}
              onRender={onRender}
            >
              {displayMode === 'prebuilt' && prebuiltEditor ? (
                <PrebuiltScenarioEditor
                  key={`${displayMode}:${activeScenarioId}:${config.blocks}:${config.chunkSize}:${config.chunking}:${config.contentVisibility}:${mountVersion}`}
                  config={config}
                  editor={prebuiltEditor}
                  scenario={activeScenario}
                />
              ) : (
                <ScenarioEditor
                  key={`${displayMode}:${activeScenarioId}:${config.blocks}:${config.chunkSize}:${config.chunking}:${config.contentVisibility}:${mountVersion}`}
                  config={config}
                  editorRef={editorRef}
                  scenario={activeScenario}
                  value={activeValue}
                />
              )}
            </React.Profiler>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <h2 className="font-semibold">Plate init dissection</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This lane splits Plate into wrapper construction, value init, pure{' '}
              <code>migrateElementIds</code>, and the mount of a prebuilt
              editor. That is the cleanest way to separate store/plugin tax,
              elementId tax, and React/provider tax.
            </p>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {DISSECTION_CASES.map((caseItem) => (
                <DissectionCard
                  key={caseItem.id}
                  description={caseItem.description}
                  label={caseItem.label}
                  metrics={dissectionResults[caseItem.id]}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <h2 className="font-semibold">ElementId paste/import dissection</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This lane times real <code>fragment.replace</code> work against
              raw import data and duplicate-id paste data. That is the only
              honest way to see whether ElementId normalization still has money
              on the table.
            </p>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {ELEMENT_ID_FRAGMENT_CASES.map((caseItem) => (
                <ElementIdFragmentCard
                  key={caseItem.id}
                  description={caseItem.description}
                  label={caseItem.label}
                  metrics={elementIdFragmentResults[caseItem.id]}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <h2 className="font-semibold">Plate store fan-out</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This lane mounts a prebuilt Plate core editor, then fans out extra
              subscribers over one hook path at a time. The delta from{' '}
              <code>No extra subscribers</code> is the real subscription tax.
            </p>
            <div className="mt-4 grid gap-3 font-mono text-sm sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">active case</div>
                <div>{activeFanoutCase.label}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">
                  subscribers per case
                </div>
                <div>{fanoutSubscriberCount.toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border">
              {fanoutEditor ? (
                <React.Profiler
                  key={`fanout:${activeFanoutCaseId}:${fanoutMountVersion}`}
                  id={activeFanoutCaseId}
                  onRender={onFanoutRender}
                >
                  <FanoutSurface
                    key={`fanout:${activeFanoutCaseId}:${config.blocks}:${config.chunkSize}:${config.chunking}:${config.contentVisibility}:${fanoutSubscriberCount}:${fanoutMountVersion}`}
                    ref={fanoutHandleRef}
                    caseId={activeFanoutCaseId}
                    config={config}
                    editor={fanoutEditor}
                    subscriberCount={
                      activeFanoutCaseId === 'none' ? 0 : fanoutSubscriberCount
                    }
                  />
                </React.Profiler>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  The fan-out surface mounts only while this benchmark is
                  running.
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {FANOUT_CASES.map((caseItem) => (
                <FanoutCard
                  key={caseItem.id}
                  description={caseItem.description}
                  label={caseItem.label}
                  metrics={fanoutResults[caseItem.id]}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <h2 className="font-semibold">Plate core mount dissection</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This lane peels Plate mount cost stage by stage: provider, Plate
              wrapper, editable-props hook stack, minimal editable mount, then
              full <code>PlateContent</code>. If <code>jotai-x</code> were the
              whole story, the provider-only step would already be ugly.
            </p>

            <div className="mt-4 rounded-lg border">
              {coreMountEditor ? (
                <React.Profiler
                  key={`core-mount:${activeCoreMountCaseId}:${activeCoreMountElementIdMode}:${coreMountVersion}`}
                  id={activeCoreMountCaseId}
                  onRender={onCoreMountRender}
                >
                  <CoreMountSurface
                    key={`core-mount:${activeCoreMountCaseId}:${activeCoreMountElementIdMode}:${config.blocks}:${config.chunkSize}:${config.chunking}:${config.contentVisibility}:${coreMountVersion}`}
                    caseId={activeCoreMountCaseId}
                    config={config}
                    editor={coreMountEditor}
                  />
                </React.Profiler>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  The core mount surface mounts only while this benchmark is
                  running.
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-3 font-mono text-sm sm:grid-cols-2">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">active stage</div>
                <div>{activeCoreMountCase.label}</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">workload</div>
                <div>{config.blocks.toLocaleString()} blocks</div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">elementId mode</div>
                <div>{activeCoreMountElementIdMode}</div>
              </div>
            </div>

            <label className="mt-4 block space-y-2">
              <span className="block text-sm font-medium">
                Core mount stage
              </span>
              <select
                aria-label="Core mount stage"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={activeCoreMountCaseId}
                onChange={(event) => {
                  setActiveCoreMountCaseId(
                    event.target.value as CoreMountCaseId
                  );
                }}
              >
                {CORE_MOUNT_CASES.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block space-y-2">
              <span className="block text-sm font-medium">
                Core mount elementId mode
              </span>
              <select
                aria-label="Core mount elementId mode"
                className="w-full rounded-md border bg-background px-3 py-2"
                value={activeCoreMountElementIdMode}
                onChange={(event) => {
                  setActiveCoreMountElementIdMode(
                    event.target.value as CoreMountElementIdMode
                  );
                }}
              >
                <option value="off">off</option>
                <option value="seeded">seeded</option>
              </select>
            </label>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {CORE_MOUNT_CASES.map((caseItem) => (
                <CoreMountCard
                  activeElementIdMode={activeCoreMountElementIdMode}
                  key={caseItem.id}
                  description={caseItem.description}
                  label={caseItem.label}
                  metrics={coreMountResults[caseItem.id]}
                />
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <h2 className="font-semibold">Layer 1 core plugin census</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              This lane adds one core plugin at a time, measures an inactive
              paragraph workload, then measures the plugin on its activated
              workload. The only numbers that matter are the deltas against
              <code> Plate core</code>, not vague “feels fine” nonsense.
            </p>

            <div className="mt-4 grid gap-3 font-mono text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">selected entry</div>
                <div>
                  {activePluginCensusEntryId === 'all'
                    ? 'all core plugins'
                    : (activePluginCensusEntry?.label ?? 'n/a')}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">perf class</div>
                <div>
                  {activePluginCensusEntry?.performanceClass ?? 'mixed'}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">inactive workload</div>
                <div>
                  {activePluginCensusEntry?.inactiveWorkload ?? 'varies'}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">activated workload</div>
                <div>
                  {activePluginCensusEntry?.activatedWorkload ?? 'varies'}
                </div>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-muted-foreground">mounted lane</div>
                <div>
                  {pluginCensusSurface
                    ? `${pluginCensusSurface.entryId}:${pluginCensusSurface.lane}:${pluginCensusSurface.scenarioId}`
                    : 'idle'}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-lg border">
              {pluginCensusEditor && pluginCensusSurface ? (
                <React.Profiler
                  key={`plugin-census:${pluginCensusSurface.entryId}:${pluginCensusSurface.lane}:${pluginCensusSurface.scenarioId}:${pluginCensusVersion}`}
                  id={pluginCensusSurface.scenarioId}
                  onRender={onPluginCensusRender}
                >
                  <PluginCensusEditorSurface
                    key={`plugin-census:${pluginCensusSurface.entryId}:${pluginCensusSurface.lane}:${pluginCensusSurface.scenarioId}:${config.blocks}:${config.chunkSize}:${config.chunking}:${config.contentVisibility}:${pluginCensusVersion}`}
                    config={config}
                    editor={pluginCensusEditor}
                    scenarioId={pluginCensusSurface.scenarioId}
                  />
                </React.Profiler>
              ) : (
                <div className="p-4 text-sm text-muted-foreground">
                  The plugin census surface mounts only while this benchmark is
                  running.
                </div>
              )}
            </div>
          </div>

          <details className="rounded-xl border bg-background p-4">
            <summary className="cursor-pointer font-medium">
              Export benchmark JSON
            </summary>
            <div data-testid="editor-perf-last-completed-token" hidden>
              {lastCompletedBenchmarkToken}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Construction benchmarks isolate editor creation. They
              intentionally ignore DOM-only render knobs like chunking and
              content visibility.
            </p>
            <pre
              data-testid="editor-perf-json"
              className="mt-4 overflow-auto rounded-md border bg-muted/30 p-4 text-xs"
            >
              {JSON.stringify(exportData, null, 2)}
            </pre>
          </details>
        </div>
      </section>
    </main>
  );
}
