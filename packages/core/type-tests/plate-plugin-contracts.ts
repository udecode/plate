import type { PluginConfig } from '@platejs/core';
import {
  createPlateEditor,
  createPlatePlugin,
  type ExtendedPlatePlugin,
} from '@platejs/core/react';
import { ContentSlice } from '@platejs/plite';

const ConfiguredPlateCodecContractPlugin = createPlatePlugin({
  key: 'configuredPlateCodecContract',
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'application/x-plate-codec-contract': {
        decode: () => ContentSlice.closed([{ text: 'value' }]),
        scope: 'document',
      },
    }),
}).configure({});

// @ts-expect-error Consumer configuration is terminal for React codec authoring.
ConfiguredPlateCodecContractPlugin.extend(({ defineCodecs }) => ({
  codecs: defineCodecs({}),
}));

type ExtendDeclarationBoundaryConfig =
  PluginConfig<'extendDeclarationBoundary'>;

export const ExtendDeclarationBoundaryPlugin =
  createPlatePlugin<ExtendDeclarationBoundaryConfig>({
    key: 'extendDeclarationBoundary',
    editOnly: true,
  });

const exactExtendDeclarationBoundary: ExtendedPlatePlugin<
  ExtendDeclarationBoundaryConfig,
  {},
  {},
  {}
> = ExtendDeclarationBoundaryPlugin;

void exactExtendDeclarationBoundary;

type ToolbarConfig = PluginConfig<
  'toolbar',
  {
    floating: boolean;
  },
  {
    plugin: {
      isFloating: () => boolean;
    };
    toggleFloating: () => boolean;
  }
>;

const ToolbarPlugin = createPlatePlugin<ToolbarConfig>({
  key: 'toolbar',
  initialState: {
    floating: true,
  },
}).extend(({ store }) => ({
  extension: {
    api: {
      plugin: {
        isFloating: () => store.get().floating,
      },
      toggleFloating: () => store.get().floating,
    },
  },
}));

const MentionPlugin = createPlatePlugin({
  key: 'mention',
  initialState: {
    trigger: '@' as const,
  },
}).extend(({ store }) => ({
  extension: {
    api: {
      getTrigger: () => store.get().trigger,
    },
  },
}));

type ExplicitPluginConfig = PluginConfig<
  'explicitPlugin',
  {
    enabled: boolean;
  },
  {},
  {},
  {},
  {},
  readonly [],
  never,
  {
    isEnabled: () => boolean;
  }
>;

const ExplicitPlugin = createPlatePlugin<ExplicitPluginConfig>({
  key: 'explicitPlugin',
  initialState: {
    enabled: false,
  },
}).extend<{ api: ExplicitPluginConfig['pluginApi'] }>(({ store }) => ({
  api: {
    isEnabled: () => store.get().enabled,
  },
}));

type DeclaredPlateTx = {
  run: (value: 'typed', initialState?: { count?: number }) => number;
};

const DeclaredPlateTxPlugin = createPlatePlugin<
  PluginConfig<'declaredPlateTx', {}, {}, { declaredPlateTx: DeclaredPlateTx }>
>({
  key: 'declaredPlateTx',
  update: () => ({
    run: (value, initialState = {}) => {
      const exactValue: 'typed' = value;
      const exactCount: number | undefined = initialState.count;

      return exactValue.length + (exactCount ?? 0);
    },
  }),
});

void DeclaredPlateTxPlugin;

const ReactFactoryExtensionPlugin = createPlatePlugin({
  key: 'reactFactoryExtension',
  initialState: {
    mode: 'inline' as 'inline' | 'block',
  },
});

const DependencyApiPlugin = createPlatePlugin({
  key: 'dependencyApi',
  api: {
    read: () => true,
  },
});

const DependencyEditorApiPlugin = createPlatePlugin({
  key: 'dependencyEditorApi',
  extension: {
    api: {
      dependencyEditorApi: {
        read: () => true,
      },
    },
  },
});

const DependentHooksPlugin = createPlatePlugin({
  dependencies: [DependencyApiPlugin, DependencyEditorApiPlugin],
  key: 'dependentHooks',
  useHooks: ({ editor }) => {
    const dependencyValue: boolean = editor.api.dependencyApi.read();
    const dependencyEditorValue: boolean =
      editor.api.dependencyEditorApi.read();

    void dependencyEditorValue;
    void dependencyValue;
  },
});

const PlateReadContextPlugin = createPlatePlugin({
  key: 'plateReadContext',
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
    handlers: {
      onFocus: ({ read }) => {
        const childCount: number = read.childCount();

        void childCount;
      },
    },
  });

const plateEditor = createPlateEditor({
  plugins: [ToolbarPlugin, MentionPlugin, ReactFactoryExtensionPlugin],
});

const createdPlateEditor = createPlateEditor({
  plugins: [
    ToolbarPlugin,
    MentionPlugin,
    ExplicitPlugin,
    ReactFactoryExtensionPlugin,
    DependentHooksPlugin,
  ],
});
const emptyApiEditor = createPlateEditor({
  plugins: [createPlatePlugin({ key: 'emptyApi' })],
});

const floating: boolean = plateEditor.api.toggleFloating();
const nestedFloating: boolean = plateEditor.api.plugin.isFloating();
const mentionTrigger: '@' = plateEditor.api.getTrigger();
const createdFloating: boolean = createdPlateEditor.api.toggleFloating();
const createdMentionTrigger: '@' = createdPlateEditor.api.getTrigger();
const explicitPluginPortalEnabled: boolean = createdPlateEditor
  .plugin(ExplicitPlugin)
  .api.isEnabled();
const explicitPluginRootEnabled: boolean =
  createdPlateEditor.api.explicitPlugin.isEnabled();
const dependencyApiValue: boolean = createdPlateEditor.api.dependencyApi.read();
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
void explicitPluginApiKey;
void explicitPluginPortalEnabled;
void explicitPluginRootEnabled;
void floating;
void htmlValue;
void mentionTrigger;
void nestedFloating;
void PlateReadContextPlugin;
void toolbarFloating;

// @ts-expect-error invalid merged editor api
plateEditor.api.notReal();

// @ts-expect-error wrong nested plugin api call
createdPlateEditor.api.plugin.isFloating(true);

// @ts-expect-error empty plugin APIs do not publish a root namespace
void emptyApiEditor.api.emptyApi;

const explicitPluginPortalApi = createdPlateEditor.plugin(ExplicitPlugin).api;
// @ts-expect-error plugin portal API is scoped, not wrapped by plugin key
explicitPluginPortalApi.explicitPlugin.isEnabled();

// @ts-expect-error literal option type must stay stable
createdPlateEditor.plugin(MentionPlugin).store.get().trigger = '#';
