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
  key: 'textIndent',
  options: {
    offset: 24,
    unit: 'px',
  },
}).extend(({ options: { offset, unit } }) => ({
  inject: {
    props: {
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
      transformNodeValue({ nodeValue }) {
        return nodeValue * offset! + unit!;
      },
    },
    targetPlugins: [ParagraphPlugin.key],
  },
}));
