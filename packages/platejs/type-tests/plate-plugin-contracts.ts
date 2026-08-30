import type { DefinitionOf } from 'platejs';
import { createEditor, definePlatePlugin } from 'platejs/react';
import { ContentSlice } from 'plitejs';

import { createPluginContext } from '../src/react/plugin/createPluginContext.internal';

type IsAny<T> = 0 extends 1 & T ? true : false;
type AssertFalse<T extends false> = T;
type AssertTrue<T extends true> = T;

const ConfiguredPlateCodecContractPlugin = definePlatePlugin(
  'configuredPlateCodecContract',
  {
    codecs: ({ defineCodecs }) =>
      defineCodecs({
        'application/x-plate-codec-contract': {
          decode: () => ContentSlice.closed([{ text: 'value' }]),
          scope: 'document',
        },
      }),
  }
).configure({});

// @ts-expect-error Consumer configuration is terminal for React codec authoring.
ConfiguredPlateCodecContractPlugin.extend(({ defineCodecs }) => ({
  codecs: defineCodecs({}),
}));

export const MinimalPlateDefinitionPlugin = definePlatePlugin(
  'minimalPlateDefinition',
  {
    editOnly: true,
  }
);
type MinimalPlateDefinition = DefinitionOf<typeof MinimalPlateDefinitionPlugin>;
declare const minimalPlateDefinition: MinimalPlateDefinition;
const exactMinimalPlateDefinitionName: 'minimalPlateDefinition' =
  minimalPlateDefinition.name;
type MinimalPlateDefinitionHasInject = AssertFalse<
  'inject' extends keyof MinimalPlateDefinition ? true : false
>;
type MinimalPlateDefinitionHasOn = AssertFalse<
  'on' extends keyof MinimalPlateDefinition ? true : false
>;
type MinimalPlateDefinitionHasRender = AssertFalse<
  'render' extends keyof MinimalPlateDefinition ? true : false
>;
type MinimalPlateRuntimeHasInject = AssertTrue<
  'inject' extends keyof typeof MinimalPlateDefinitionPlugin ? true : false
>;
type MinimalPlateRuntimeHasOn = AssertTrue<
  'on' extends keyof typeof MinimalPlateDefinitionPlugin ? true : false
>;
type MinimalPlateRuntimeHasRender = AssertTrue<
  'render' extends keyof typeof MinimalPlateDefinitionPlugin ? true : false
>;

void exactMinimalPlateDefinitionName;

export type {
  MinimalPlateDefinitionHasInject,
  MinimalPlateDefinitionHasOn,
  MinimalPlateDefinitionHasRender,
  MinimalPlateRuntimeHasInject,
  MinimalPlateRuntimeHasOn,
  MinimalPlateRuntimeHasRender,
};

const ObjectStateInferencePlugin = definePlatePlugin('objectStateInference', {
  api: ({ editor, store }) => {
    const editorIsAny: IsAny<typeof editor> = false;
    const pluginState = store.get();
    const pluginStateIsAny: IsAny<typeof pluginState> = false;
    const pluginStateModeIsAny: IsAny<typeof pluginState.mode> = false;
    const exactMode: 'object' = pluginState.mode;

    void editorIsAny;
    void pluginStateIsAny;
    void pluginStateModeIsAny;

    return {
      getMode: () => exactMode,
    };
  },
  initialState: {
    mode: 'object' as const,
  },
  read: ({ editor, store }) => {
    const editorIsAny: IsAny<typeof editor> = false;
    const pluginState = store.get();
    const pluginStateIsAny: IsAny<typeof pluginState> = false;
    const pluginStateModeIsAny: IsAny<typeof pluginState.mode> = false;
    const exactMode: 'object' = pluginState.mode;

    void editorIsAny;
    void pluginStateIsAny;
    void pluginStateModeIsAny;

    return {
      getMode: () => exactMode,
    };
  },
});

const ObjectStateFirstInferencePlugin = definePlatePlugin(
  'objectStateFirstInference',
  {
    initialState: {
      mode: 'objectStateFirst' as const,
    },
    api: ({ editor, store }) => {
      const editorIsAny: IsAny<typeof editor> = false;
      const pluginState = store.get();
      const pluginStateModeIsAny: IsAny<typeof pluginState.mode> = false;
      const exactMode: 'objectStateFirst' = pluginState.mode;

      void editorIsAny;
      void pluginStateModeIsAny;

      return {
        getMode: () => exactMode,
      };
    },
    read: ({ editor, store }) => {
      const editorIsAny: IsAny<typeof editor> = false;
      const pluginState = store.get();
      const pluginStateModeIsAny: IsAny<typeof pluginState.mode> = false;
      const exactMode: 'objectStateFirst' = pluginState.mode;

      void editorIsAny;
      void pluginStateModeIsAny;

      return {
        getMode: () => exactMode,
      };
    },
  }
);

const ExplicitFactoryStateInferencePlugin = definePlatePlugin(
  'explicitFactoryStateInference',
  {
    initialState: ({ editor }): { mode: 'explicitFactory' } => {
      const editorIsAny: IsAny<typeof editor> = false;
      const editorId: string = editor.id;

      void editorId;
      void editorIsAny;

      return { mode: 'explicitFactory' };
    },
  }
).extend(({ editor, store }) => {
  const editorIsAny: IsAny<typeof editor> = false;
  const pluginState = store.get();
  const pluginStateIsAny: IsAny<typeof pluginState> = false;
  const pluginStateModeIsAny: IsAny<typeof pluginState.mode> = false;
  const exactMode: 'explicitFactory' = pluginState.mode;

  void editorIsAny;
  void pluginStateIsAny;
  void pluginStateModeIsAny;

  return {
    api: () => ({
      getMode: () => exactMode,
    }),
    read: () => ({
      getMode: () => exactMode,
    }),
  };
});

const InferredFactoryStateInferencePlugin = definePlatePlugin(
  'inferredFactoryStateInference',
  {
    initialState: ({ editor }) => {
      const editorIsAny: IsAny<typeof editor> = false;
      const editorId: string = editor.id;

      void editorId;
      void editorIsAny;

      return { mode: 'inferredFactory' as const };
    },
  }
).extend(({ editor, store }) => {
  const editorIsAny: IsAny<typeof editor> = false;
  const pluginState = store.get();
  const pluginStateIsAny: IsAny<typeof pluginState> = false;
  const pluginStateModeIsAny: IsAny<typeof pluginState.mode> = false;
  const exactMode: 'inferredFactory' = pluginState.mode;

  void editorIsAny;
  void pluginStateIsAny;
  void pluginStateModeIsAny;

  return {
    api: () => ({
      getMode: () => exactMode,
    }),
    read: () => ({
      getMode: () => exactMode,
    }),
  };
});

export const SequentialPlatePlugin = definePlatePlugin('sequentialPlate', {
  api: () => ({ first: () => 1 as const }),
  initialState: { count: 1 },
  read: () => ({ first: () => 1 as const }),
  update: () => ({ first: () => 1 as const }),
})
  .extend(({ api, read, store }) => {
    api.first() satisfies 1;
    read.first() satisfies 1;
    void (store.get().count satisfies number);

    return {
      api: () => ({ second: () => 2 as const }),
      initialState: { second: true },
      read: () => ({ second: () => 2 as const }),
      selectors: {
        second: (state) => state.count + 1,
      },
      update: ({ tx }) => ({
        second: () => {
          tx.sequentialPlate.first() satisfies 1;

          return 2 as const;
        },
      }),
    };
  })
  .extend(({ api, read, store }) => {
    api.second() satisfies 2;
    read.second() satisfies 2;
    void (store.get().second satisfies boolean);

    return {
      api: () => ({ third: () => 3 as const }),
      initialState: { third: 'ready' as const },
      read: () => ({ third: () => 3 as const }),
      update: ({ tx }) => ({
        third: () => {
          tx.sequentialPlate.second() satisfies 2;

          return 3 as const;
        },
      }),
    };
  });

const sequentialPlateEditor = createEditor({
  plugins: [SequentialPlatePlugin],
});
sequentialPlateEditor.api.sequentialPlate.third() satisfies 3;
sequentialPlateEditor.read.sequentialPlate.third() satisfies 3;
sequentialPlateEditor.update.sequentialPlate.third() satisfies 3;
void (sequentialPlateEditor.plugin(SequentialPlatePlugin).store.get()
  .third satisfies 'ready');
void (sequentialPlateEditor
  .plugin(SequentialPlatePlugin)
  .store.get('second') satisfies number);
// @ts-expect-error Sequential stages keep exact API members.
sequentialPlateEditor.api.sequentialPlate.missing();

definePlatePlugin('apiBeforeFactoryState', {
  // @ts-expect-error Factory state consumers belong in a following .extend().
  api: () => ({}),
  initialState: ({ editor }) => ({
    mode: editor.id.length > 0,
  }),
});

definePlatePlugin('apiAfterFactoryState', {
  initialState: ({ editor }) => ({
    mode: editor.id.length > 0,
  }),
  // @ts-expect-error Factory state consumers belong in a following .extend().
  api: () => ({}),
});

type ObjectStateInferenceDefinition = DefinitionOf<
  typeof ObjectStateInferencePlugin
>;
type ObjectStateFirstInferenceDefinition = DefinitionOf<
  typeof ObjectStateFirstInferencePlugin
>;
type ExplicitFactoryStateInferenceDefinition = DefinitionOf<
  typeof ExplicitFactoryStateInferencePlugin
>;
type InferredFactoryStateInferenceDefinition = DefinitionOf<
  typeof InferredFactoryStateInferencePlugin
>;
declare const objectStateInferenceDefinition: ObjectStateInferenceDefinition;
declare const objectStateFirstInferenceDefinition: ObjectStateFirstInferenceDefinition;
declare const explicitFactoryStateInferenceDefinition: ExplicitFactoryStateInferenceDefinition;
declare const inferredFactoryStateInferenceDefinition: InferredFactoryStateInferenceDefinition;
const objectDefinitionModeIsAny: IsAny<
  typeof objectStateInferenceDefinition.initialState.mode
> = false;
const objectStateFirstDefinitionModeIsAny: IsAny<
  typeof objectStateFirstInferenceDefinition.initialState.mode
> = false;
const explicitFactoryDefinitionModeIsAny: IsAny<
  typeof explicitFactoryStateInferenceDefinition.initialState.mode
> = false;
const inferredFactoryDefinitionModeIsAny: IsAny<
  typeof inferredFactoryStateInferenceDefinition.initialState.mode
> = false;

void objectDefinitionModeIsAny;
void objectStateFirstDefinitionModeIsAny;
void explicitFactoryDefinitionModeIsAny;
void inferredFactoryDefinitionModeIsAny;

const PlateTargetPlugin = definePlatePlugin('plateTarget', {});
const authoredPlateTargets = [PlateTargetPlugin, 'heading'] as const;
const configuredPlateTargets = ['quote', PlateTargetPlugin] as const;
const AuthoredPlateTargetsPlugin = definePlatePlugin('authoredPlateTargets', {
  targetPlugins: authoredPlateTargets,
});
const ConfiguredPlateTargetsPlugin = AuthoredPlateTargetsPlugin.configure({
  targetPlugins: configuredPlateTargets,
});
type AuthoredPlateTargetsDefinition = DefinitionOf<
  typeof AuthoredPlateTargetsPlugin
>;
type ConfiguredPlateTargetsDefinition = DefinitionOf<
  typeof ConfiguredPlateTargetsPlugin
>;
declare const authoredPlateTargetsDefinition: AuthoredPlateTargetsDefinition;
declare const configuredPlateTargetsDefinition: ConfiguredPlateTargetsDefinition;
const exactAuthoredPlateTargets: readonly [
  typeof PlateTargetPlugin,
  'heading',
] = authoredPlateTargetsDefinition.targetPlugins;
const exactConfiguredPlateTargets: readonly [
  typeof PlateTargetPlugin,
  'heading',
] = configuredPlateTargetsDefinition.targetPlugins;
// @ts-expect-error Configuration does not rewrite the authored definition witness.
const invalidConfiguredPlateTarget: 'quote' =
  configuredPlateTargetsDefinition.targetPlugins[0];

void exactAuthoredPlateTargets;
void exactConfiguredPlateTargets;
void invalidConfiguredPlateTarget;

const toolbarInitialState: { floating: boolean } = {
  floating: true,
};

const ToolbarPlugin = definePlatePlugin('toolbar', {
  api: ({ store }) => ({
    isFloating: () => store.get().floating,
    toggleFloating: () => store.get().floating,
  }),
  initialState: toolbarInitialState,
});

const MentionPlugin = definePlatePlugin('mention', {
  api: ({ store }) => ({
    getTrigger: () => store.get().trigger,
  }),
  initialState: {
    trigger: '@' as const,
  },
});

const ExplicitPlugin = definePlatePlugin('explicitPlugin', {
  api: ({ store }) => ({
    isEnabled: () => store.get().enabled,
  }),
  initialState: {
    enabled: false,
  },
});

const DeclaredPlateTxPlugin = definePlatePlugin('declaredPlateTx', {
  update: () => ({
    run: (value: 'typed', initialState: { count?: number } = {}) => {
      const exactValue: 'typed' = value;
      const exactCount: number | undefined = initialState.count;

      return exactValue.length + (exactCount ?? 0);
    },
  }),
});

void DeclaredPlateTxPlugin;

const ReactOnPlugin = definePlatePlugin('reactOn', {
  initialState: {
    mode: 'inline' as 'inline' | 'block',
  },
  on: {
    keyDown: ({ event }) => {
      const key: string = event.key;

      void key;
    },
  },
});

const DependencyApiPlugin = definePlatePlugin('dependencyApi', {
  api: () => ({
    read: () => true as const,
  }),
});

const DependencyEditorApiPlugin = definePlatePlugin('dependencyEditorApi', {
  api: () => ({
    read: () => true as const,
  }),
});

const DependentHooksPlugin = definePlatePlugin('dependentHooks', {
  dependencies: [DependencyApiPlugin, DependencyEditorApiPlugin],
  useHooks: ({ editor }) => {
    const dependencyValue: true = editor.api.dependencyApi.read();
    const dependencyEditorValue: true = editor.api.dependencyEditorApi.read();

    void dependencyEditorValue;
    void dependencyValue;
  },
});

const PlateReadContextPlugin = definePlatePlugin('plateReadContext', {
  read: ({ state }) => ({
    childCount: () => state.children().length,
  }),
})
  .extend({
    useHooks: ({ read }) => {
      const childCount: number = read.childCount();

      void childCount;
    },
  })
  .configure({
    on: {
      focus: ({ read }) => {
        const childCount: number = read.childCount();

        void childCount;
      },
    },
  });

const plateEditor = createEditor({
  plugins: [ToolbarPlugin, MentionPlugin, ReactOnPlugin],
});
declare const reactOnKeyDownEvent: Parameters<
  NonNullable<(typeof ReactOnPlugin.on)['keyDown']>
>[0]['event'];
ReactOnPlugin.on.keyDown?.({
  ...createPluginContext(plateEditor, ReactOnPlugin),
  event: reactOnKeyDownEvent,
});

const createdPlateEditor = createEditor({
  plugins: [
    ToolbarPlugin,
    MentionPlugin,
    ExplicitPlugin,
    ReactOnPlugin,
    DependentHooksPlugin,
  ],
});
const stateInferenceEditor = createEditor({
  plugins: [
    ObjectStateInferencePlugin,
    ObjectStateFirstInferencePlugin,
    ExplicitFactoryStateInferencePlugin,
    InferredFactoryStateInferencePlugin,
  ],
});
const emptyApiEditor = createEditor({
  plugins: [definePlatePlugin('emptyApi', {})],
});

const floating: boolean = plateEditor.api.toolbar.toggleFloating();
const nestedFloating: boolean = plateEditor.api.toolbar.isFloating();
const mentionTrigger: '@' = plateEditor.api.mention.getTrigger();
const createdFloating: boolean =
  createdPlateEditor.api.toolbar.toggleFloating();
const createdMentionTrigger: '@' = createdPlateEditor.api.mention.getTrigger();
const explicitPluginPortalEnabled: boolean = createdPlateEditor
  .plugin(ExplicitPlugin)
  .api.isEnabled();
const explicitPluginRootEnabled: boolean =
  createdPlateEditor.api.explicitPlugin.isEnabled();
const dependencyApiValue: boolean = createdPlateEditor.api.dependencyApi.read();
const objectApiMode: 'object' =
  stateInferenceEditor.api.objectStateInference.getMode();
const objectReadMode: 'object' =
  stateInferenceEditor.read.objectStateInference.getMode();
const objectStateFirstApiMode: 'objectStateFirst' =
  stateInferenceEditor.api.objectStateFirstInference.getMode();
const objectStateFirstReadMode: 'objectStateFirst' =
  stateInferenceEditor.read.objectStateFirstInference.getMode();
const explicitFactoryApiMode: 'explicitFactory' =
  stateInferenceEditor.api.explicitFactoryStateInference.getMode();
const explicitFactoryReadMode: 'explicitFactory' =
  stateInferenceEditor.read.explicitFactoryStateInference.getMode();
const inferredFactoryApiMode: 'inferredFactory' =
  stateInferenceEditor.api.inferredFactoryStateInference.getMode();
const inferredFactoryReadMode: 'inferredFactory' =
  stateInferenceEditor.read.inferredFactoryStateInference.getMode();
const htmlValue = createdPlateEditor.api.html.deserialize({
  element: '<p>HTML</p>',
});
type CreatedPlateEditorApiKeys = keyof typeof createdPlateEditor.api;
const explicitPluginApiKey: Extract<
  CreatedPlateEditorApiKeys,
  'explicitPlugin'
> = 'explicitPlugin';
const toolbarFloating: boolean = createdPlateEditor
  .plugin(ToolbarPlugin)
  .store.get().floating;
const createdMentionOption: '@' = createdPlateEditor
  .plugin(MentionPlugin)
  .store.get().trigger;

void createdFloating;
void createdMentionOption;
void createdMentionTrigger;
void dependencyApiValue;
void explicitFactoryApiMode;
void explicitFactoryReadMode;
void explicitPluginApiKey;
void explicitPluginPortalEnabled;
void explicitPluginRootEnabled;
void floating;
void htmlValue;
void mentionTrigger;
void nestedFloating;
void objectApiMode;
void objectReadMode;
void objectStateFirstApiMode;
void objectStateFirstReadMode;
void PlateReadContextPlugin;
void toolbarFloating;
void inferredFactoryApiMode;
void inferredFactoryReadMode;

// @ts-expect-error invalid merged editor api
plateEditor.api.notReal();

// @ts-expect-error wrong plugin API call
createdPlateEditor.api.toolbar.isFloating(true);

// @ts-expect-error empty plugin APIs do not publish a root namespace
void emptyApiEditor.api.emptyApi;

const explicitPluginPortalApi = createdPlateEditor.plugin(ExplicitPlugin).api;
// @ts-expect-error plugin portal API is scoped, not wrapped by plugin name
explicitPluginPortalApi.explicitPlugin.isEnabled();

// @ts-expect-error literal option type must stay stable
createdPlateEditor.plugin(MentionPlugin).store.get().trigger = '#';
