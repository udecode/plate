import type { PluginConfig } from '@platejs/core';
import { createPlateEditor, createPlatePlugin } from '@platejs/core/react';

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
  plugins: [ToolbarPlugin, MentionPlugin, ReactFactoryExtensionPlugin],
});

const floating: boolean = plateEditor.api.toggleFloating();
const nestedFloating: boolean = plateEditor.api.plugin.isFloating();
const mentionTrigger: '@' = plateEditor.api.getTrigger();
const createdFloating: boolean = createdPlateEditor.api.toggleFloating();
const createdMentionTrigger: '@' = createdPlateEditor.api.getTrigger();
const toolbarFloating: boolean =
  createdPlateEditor.getOptions(ToolbarPlugin).floating;
const createdMentionOption: '@' =
  createdPlateEditor.getOptions(MentionPlugin).trigger;

void createdFloating;
void createdMentionOption;
void createdMentionTrigger;
void floating;
void mentionTrigger;
void nestedFloating;
void toolbarFloating;

// @ts-expect-error invalid merged editor api
plateEditor.api.notReal();

// @ts-expect-error wrong nested plugin api call
createdPlateEditor.api.plugin.isFloating(true);

// @ts-expect-error literal option type must stay stable
createdPlateEditor.getOptions(MentionPlugin).trigger = '#';
