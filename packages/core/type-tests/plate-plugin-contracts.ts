import { createEditor } from '@platejs/slate';

import type { PluginConfig } from '@platejs/core';
import {
  createPlateEditor,
  createPlatePlugin,
  createTPlatePlugin,
  withPlate,
} from '@platejs/core/react';

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

const ToolbarPlugin = createTPlatePlugin<ToolbarConfig>({
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

const plateEditor = withPlate(createEditor(), {
  plugins: [ToolbarPlugin, MentionPlugin],
});

const createdPlateEditor = createPlateEditor({
  plugins: [ToolbarPlugin, MentionPlugin],
});

const floating: boolean = plateEditor.api.toggleFloating();
const nestedFloating: boolean = plateEditor
  .getApi(ToolbarPlugin)
  .plugin.isFloating();
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
createdPlateEditor.getApi(ToolbarPlugin).plugin.isFloating(true);

// @ts-expect-error literal option type must stay stable
createdPlateEditor.getOptions(MentionPlugin).trigger = '#';
