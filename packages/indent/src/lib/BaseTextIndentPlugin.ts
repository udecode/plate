import {
  type PluginConfig,
  BaseParagraphPlugin,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { IndentConfig } from './BaseIndentPlugin';

export type TextIndentConfig = PluginConfig<
  'textIndent',
  IndentConfig['options']
>;

export const BaseTextIndentPlugin = createTSlatePlugin<TextIndentConfig>({
  key: 'textIndent',
  inject: {
    nodeProps: {
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
      transformNodeValue({ getOptions, nodeValue }) {
        const { offset, unit } = getOptions();

        return nodeValue * offset! + unit!;
      },
    },
    targetPlugins: [BaseParagraphPlugin.key],
  },
  options: {
    offset: 24,
    unit: 'px',
  },
});
