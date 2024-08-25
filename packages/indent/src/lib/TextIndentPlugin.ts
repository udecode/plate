import {
  ParagraphPlugin,
  type PluginConfig,
  createTSlatePlugin,
} from '@udecode/plate-common';

import type { IndentConfig } from './IndentPlugin';

export type TextIndentConfig = PluginConfig<
  'textIndent',
  IndentConfig['options']
>;

export const TextIndentPlugin = createTSlatePlugin<TextIndentConfig>({
  inject: {
    nodeProps: {
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
      transformNodeValue({ getOptions, nodeValue }) {
        const { offset, unit } = getOptions();

        return nodeValue * offset! + unit!;
      },
    },
    targetPlugins: [ParagraphPlugin.key],
  },
  key: 'textIndent',
  options: {
    offset: 24,
    unit: 'px',
  },
});
