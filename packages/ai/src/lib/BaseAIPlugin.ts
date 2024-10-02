import type { TriggerComboboxPluginOptions } from '@udecode/plate-combobox';

import {
  type PluginConfig,
  type SlateEditor,
  type TNodeEntry,
  createTSlatePlugin,
} from '@udecode/plate-common';

import { withTriggerAIMenu } from './withTriggerAIMenu';

export type BaseAIOptions = {
  onOpenAI?: (editor: SlateEditor, nodeEntry: TNodeEntry) => void;
} & TriggerComboboxPluginOptions;

export type BaseAIPluginConfig = PluginConfig<'ai', BaseAIOptions>;

export const BaseAIPlugin = createTSlatePlugin({
  key: 'ai',
  extendEditor: withTriggerAIMenu,
  options: {
    scrollContainerSelector: '#scroll_container',
    trigger: ' ',
    triggerPreviousCharPattern: /^\s?$/,
  },
});
