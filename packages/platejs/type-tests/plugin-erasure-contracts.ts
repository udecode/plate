import {
  type BasePluginInput,
  createEditor as createHeadlessEditor,
  defineBasePlugin,
  type DefinitionOf,
  DOMPlugin,
  type InferDependencies,
} from 'platejs';
import { createEditor, type Editor, toPlatePlugin } from 'platejs/react';
import { type EditorExtensionInstalledCapabilitiesOf, schema } from 'plitejs';

import type {
  NormalizePluginState,
  PluginDependencySource,
} from '../src/lib/plugin/PluginDefinition';
import type { InternalPluginDefinitionOf } from '../src/lib/plugin/pluginDefinitionLookup.internal';

type Equal<TLeft, TRight> = [TLeft] extends [TRight]
  ? [TRight] extends [TLeft]
    ? true
    : false
  : false;

type Assert<T extends true> = T;

type OpaqueRuntimeState = {
  editor: Editor | null;
  plugins: readonly BasePluginInput[];
};

type NormalizedOpaqueRuntimeState = NormalizePluginState<OpaqueRuntimeState>;
export type OpaqueEditorStateRemainsNameable = Assert<
  Equal<NormalizedOpaqueRuntimeState['editor'], Editor | null>
>;

const BoundaryLeafPlugin = defineBasePlugin('boundaryLeaf', {
  api: () => ({
    label: () => 'leaf' as const,
  }),
  initialState: {
    count: 2,
  },
  read: () => ({
    isReady: () => true,
  }),
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  selectors: {
    doubled: (state) => state.count * 2,
  },
  update: () => ({
    increment: (amount: number) => amount + 1,
  }),
});

const BoundaryBranchPlugin = defineBasePlugin('boundaryBranch', {
  api: ({ editor }) => {
    const transitiveApi: 'leaf' = editor.api.boundaryLeaf.label();
    const transitiveRead: boolean = editor.read.boundaryLeaf.isReady();

    void transitiveApi;
    void transitiveRead;

    return {
      label: () => 'branch' as const,
    };
  },
  dependencies: [BoundaryLeafPlugin],
  read: () => ({
    isReady: () => 'branch-ready' as const,
  }),
  update: ({ tx }) => ({
    increment: (amount: number) => {
      tx.boundaryLeaf.increment(amount);

      return amount + 2;
    },
  }),
});

export const BoundaryOwnerPlugin = defineBasePlugin('boundaryOwner', {
  api: ({ editor }) => {
    const directApi: 'branch' = editor.api.boundaryBranch.label();
    const directRead: 'branch-ready' = editor.read.boundaryBranch.isReady();
    const transitiveApi: 'leaf' = editor.api.boundaryLeaf.label();
    const transitiveRead: boolean = editor.read.boundaryLeaf.isReady();

    // @ts-expect-error Absent dependency API groups stay absent.
    editor.api.missingDependency.run();
    // @ts-expect-error Absent dependency read groups stay absent.
    editor.read.missingDependency.run();

    void directApi;
    void directRead;
    void transitiveApi;
    void transitiveRead;

    return {};
  },
  dependencies: [BoundaryBranchPlugin],
  update: ({ tx }) => {
    const directUpdate: number = tx.boundaryBranch.increment(1);
    const transitiveUpdate: number = tx.boundaryLeaf.increment(1);

    // @ts-expect-error Absent dependency transaction groups stay absent.
    tx.missingDependency.run();

    void directUpdate;
    void transitiveUpdate;

    return {};
  },
});

export const BoundaryReactOwnerPlugin = toPlatePlugin(BoundaryOwnerPlugin);
export const ConvertedDomPlugin = toPlatePlugin(DOMPlugin);
export const BoundaryStagedPlugin = defineBasePlugin('boundaryStaged', {
  api: () => ({
    first: () => 'first' as const,
  }),
  initialState: {
    count: 1,
  },
  read: () => ({
    first: () => 1 as const,
  }),
  update: () => ({
    first: () => 1 as const,
  }),
})
  .extend(({ api, read, store }) => {
    api.first() satisfies 'first';
    read.first() satisfies 1;
    void (store.get().count satisfies number);

    return {
      api: () => ({
        second: () => {
          api.first() satisfies 'first';

          return 'second' as const;
        },
      }),
      initialState: { second: true },
      read: () => ({
        second: () => {
          read.first() satisfies 1;

          return 2 as const;
        },
      }),
      selectors: {
        second: (state) => state.count + 1,
      },
      update: ({ tx }) => ({
        second: () => {
          tx.boundaryStaged.first() satisfies 1;

          return 2 as const;
        },
      }),
    };
  })
  .extend(({ api, read, store }) => {
    api.second() satisfies 'second';
    read.second() satisfies 2;
    void (store.get().second satisfies boolean);

    return {
      api: () => ({
        third: () => {
          api.second() satisfies 'second';

          return 'third' as const;
        },
      }),
      initialState: { third: 'ready' as const },
      read: () => ({
        third: () => {
          read.second() satisfies 2;

          return 3 as const;
        },
      }),
      update: ({ tx }) => ({
        third: () => {
          tx.boundaryStaged.second() satisfies 2;

          return 3 as const;
        },
      }),
    };
  });
export const BoundaryStagedReactPlugin = toPlatePlugin(BoundaryStagedPlugin);

type BoundaryStagedReactDefinitionIsExact = Assert<
  Equal<
    DefinitionOf<typeof BoundaryStagedReactPlugin>,
    DefinitionOf<typeof BoundaryStagedPlugin>
  >
>;
type ConvertedDomDefinitionIsExact = Assert<
  Equal<DefinitionOf<typeof ConvertedDomPlugin>, DefinitionOf<typeof DOMPlugin>>
>;

type BoundaryOwnerInternalDefinition = InternalPluginDefinitionOf<
  typeof BoundaryOwnerPlugin
>;
type BoundaryOwnerProviderIsExact = Assert<
  Equal<BoundaryOwnerInternalDefinition['name'], 'boundaryOwner'>
>;
type BoundaryBranchDependency =
  InferDependencies<BoundaryOwnerInternalDefinition>[0];
type BoundaryBranchReferenceIsExact = Assert<
  Equal<BoundaryBranchDependency['name'], 'boundaryBranch'>
>;
type BoundaryBranchDependencySource =
  PluginDependencySource<BoundaryBranchDependency>;
type BoundaryDependencySourceKeepsApi = Assert<
  'api' extends keyof BoundaryBranchDependencySource ? true : false
>;
type BoundaryDependencySourceDropsStoreState = Assert<
  'initialState' extends keyof BoundaryBranchDependencySource ? false : true
>;

type BoundaryReactInstalled = EditorExtensionInstalledCapabilitiesOf<
  typeof BoundaryReactOwnerPlugin
>;
type BoundaryReactInstalledNames =
  BoundaryReactInstalled extends Readonly<{
    name: infer TName;
  }>
    ? TName
    : never;
type BoundaryReactWitnessIsExact = Assert<
  Equal<
    BoundaryReactInstalledNames,
    'boundaryBranch' | 'boundaryLeaf' | 'boundaryOwner'
  >
>;
type ConvertedDomDefinition = DefinitionOf<typeof ConvertedDomPlugin>;
type ConvertedDomKeepsBaseUpdate = Assert<
  'autoScroll' extends keyof ConvertedDomDefinition['update'] ? true : false
>;
type ConvertedDomKeepsRawUpdate = Assert<
  'insertData' extends keyof ConvertedDomDefinition['update'] ? true : false
>;
type ConvertedDomInstalled = EditorExtensionInstalledCapabilitiesOf<
  typeof ConvertedDomPlugin
>;
type ConvertedDomInstalledUpdate = Extract<
  ConvertedDomInstalled,
  Readonly<{ name: 'dom'; update: object }>
>['update'];
type ConvertedDomWitnessKeepsBaseUpdate = Assert<
  'autoScroll' extends keyof ConvertedDomInstalledUpdate ? true : false
>;
type ConvertedDomWitnessKeepsRawUpdate = Assert<
  'insertData' extends keyof ConvertedDomInstalledUpdate ? true : false
>;

export type {
  BoundaryBranchReferenceIsExact,
  BoundaryDependencySourceDropsStoreState,
  BoundaryDependencySourceKeepsApi,
  BoundaryOwnerProviderIsExact,
  BoundaryReactWitnessIsExact,
  BoundaryStagedReactDefinitionIsExact,
  ConvertedDomDefinitionIsExact,
  ConvertedDomKeepsBaseUpdate,
  ConvertedDomKeepsRawUpdate,
  ConvertedDomWitnessKeepsBaseUpdate,
  ConvertedDomWitnessKeepsRawUpdate,
};

const editor = createHeadlessEditor({ plugins: [BoundaryOwnerPlugin] });
const directDependencyName: 'boundaryBranch' =
  BoundaryOwnerPlugin.dependencies[0].name;
const directApi: 'branch' = editor.api.boundaryBranch.label();
const directRead: 'branch-ready' = editor.read.boundaryBranch.isReady();
const directUpdate: number = editor.update.boundaryBranch.increment(1);
const transitiveApi: 'leaf' = editor.api.boundaryLeaf.label();
const transitiveRead: boolean = editor.read.boundaryLeaf.isReady();
const transitiveUpdate: number = editor.update.boundaryLeaf.increment(1);
const leafType: 'boundaryLeaf' =
  editor.read.schema.create(BoundaryLeafPlugin).type;

const leafPortal = editor.plugin(BoundaryLeafPlugin);
const installed: boolean = leafPortal.installed;
const portalApi: 'leaf' = leafPortal.api.label();
const portalCount: number = leafPortal.store.get('count');
const portalRead: boolean = leafPortal.read.isReady();
const portalSelector: number = leafPortal.store.get('doubled');
const portalUpdate: number = leafPortal.update.increment(1);
const dynamicPortal = editor.plugin('boundaryLeaf');
void (dynamicPortal.installed satisfies boolean);
void (dynamicPortal.name satisfies string);
const reactEditor = createEditor({ plugins: [BoundaryReactOwnerPlugin] });
const reactDirectApi: 'branch' = reactEditor.api.boundaryBranch.label();
const reactTransitiveApi: 'leaf' = reactEditor.api.boundaryLeaf.label();
const reactTransitiveUpdate: number =
  reactEditor.update.boundaryLeaf.increment(1);
const stagedEditor = createHeadlessEditor({ plugins: [BoundaryStagedPlugin] });
const stagedApi: 'third' = stagedEditor.api.boundaryStaged.third();
const stagedRead: 3 = stagedEditor.read.boundaryStaged.third();
const stagedUpdate: 3 = stagedEditor.update.boundaryStaged.third();
const stagedPortal = stagedEditor.plugin(BoundaryStagedPlugin);
const stagedState: 'ready' = stagedPortal.store.get().third;
const stagedSelector: number = stagedPortal.store.get('second');
const stagedReactEditor = createEditor({
  plugins: [BoundaryStagedReactPlugin],
});
const stagedReactApi: 'third' = stagedReactEditor.api.boundaryStaged.third();

const weakNameReference = { name: 'boundaryLeaf' } as const;
// @ts-expect-error Weak name objects are not public plugin lookup inputs.
editor.plugin(weakNameReference);

// @ts-expect-error Dependency API members stay exact after runtime erasure.
editor.api.boundaryLeaf.missing();
// @ts-expect-error Dependency read members stay exact after runtime erasure.
editor.read.boundaryLeaf.missing();
// @ts-expect-error Dependency update members stay exact after runtime erasure.
editor.update.boundaryLeaf.missing();
// @ts-expect-error Dependency selector keys stay exact after runtime erasure.
leafPortal.store.get('missing');
// @ts-expect-error Absent dependency API groups stay absent.
editor.api.missingDependency.run();
// @ts-expect-error Absent dependency read groups stay absent.
editor.read.missingDependency.run();
// @ts-expect-error Absent dependency update groups stay absent.
editor.update.missingDependency.run();

void directApi;
void directDependencyName;
void directRead;
void directUpdate;
void installed;
void leafType;
void portalApi;
void portalCount;
void portalRead;
void portalSelector;
void portalUpdate;
void reactDirectApi;
void reactTransitiveApi;
void reactTransitiveUpdate;
void stagedApi;
void stagedRead;
void stagedState;
void stagedSelector;
void stagedReactApi;
void stagedUpdate;
void transitiveApi;
void transitiveRead;
void transitiveUpdate;
