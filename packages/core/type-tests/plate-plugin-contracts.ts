import type { PluginConfig } from '@platejs/core';
import {
  createPlateEditor,
  createPlatePlugin,
  type ExtendedPlatePlugin,
} from '@platejs/core/react';

type ExtendDeclarationBoundaryConfig =
  PluginConfig<'extendDeclarationBoundary'>;

export const ExtendDeclarationBoundaryPlugin =
  createPlatePlugin<ExtendDeclarationBoundaryConfig>({
    key: 'extendDeclarationBoundary',
  }).extend({ editOnly: true });

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
  options: {
    floating: true,
  },
}).extendEditorApi(({ getOptions }) => ({
  plugin: {
    isFloating: () => getOptions().floating,
  },
  toggleFloating: () => getOptions().floating,
}));

const MentionPlugin = createPlatePlugin({
  key: 'mention',
  options: {
    trigger: '@' as const,
  },
}).extendEditorApi(({ getOptions }) => ({
  getTrigger: () => getOptions().trigger,
}));

type ExplicitPluginConfig = PluginConfig<
  'explicitPlugin',
  {
    enabled: boolean;
  },
  {
    explicitPlugin: {
      isEnabled: () => boolean;
    };
  }
>;

const ExplicitPlugin = createPlatePlugin<ExplicitPluginConfig>({
  key: 'explicitPlugin',
  options: {
    enabled: false,
  },
}).extendApi<ExplicitPluginConfig['api']['explicitPlugin']>(
  ({ getOptions }) => ({
    isEnabled: () => getOptions().enabled,
  })
);

const ReactFactoryExtensionPlugin = createPlatePlugin({
  key: 'reactFactoryExtension',
  options: {
    mode: 'inline' as 'inline' | 'block',
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
  ],
});

const floating: boolean = plateEditor.api.toggleFloating();
const nestedFloating: boolean = plateEditor.api.plugin.isFloating();
const mentionTrigger: '@' = plateEditor.api.getTrigger();
const createdFloating: boolean = createdPlateEditor.api.toggleFloating();
const createdMentionTrigger: '@' = createdPlateEditor.api.getTrigger();
const explicitPluginEnabled: boolean =
  createdPlateEditor.api.explicitPlugin.isEnabled();
const explicitPluginPortalEnabled: boolean = createdPlateEditor
  .plugin(ExplicitPlugin)
  .api.isEnabled();
const explicitPluginPortalRootEnabled: boolean =
  createdPlateEditor.api.explicitPlugin.isEnabled();
const toolbarFloating: boolean = createdPlateEditor
  .plugin(ToolbarPlugin)
  .getOptions().floating;
const createdMentionOption: '@' = createdPlateEditor
  .plugin(MentionPlugin)
  .getOptions().trigger;

void createdFloating;
void createdMentionOption;
void createdMentionTrigger;
void explicitPluginEnabled;
void explicitPluginPortalEnabled;
void explicitPluginPortalRootEnabled;
void floating;
void mentionTrigger;
void nestedFloating;
void toolbarFloating;

// @ts-expect-error invalid merged editor api
plateEditor.api.notReal();

// @ts-expect-error wrong nested plugin api call
createdPlateEditor.api.plugin.isFloating(true);

const explicitPluginPortalApi = createdPlateEditor.plugin(ExplicitPlugin).api;
// @ts-expect-error plugin portal API is scoped, not wrapped by plugin key
explicitPluginPortalApi.explicitPlugin.isEnabled();

// @ts-expect-error literal option type must stay stable
createdPlateEditor.plugin(MentionPlugin).getOptions().trigger = '#';
