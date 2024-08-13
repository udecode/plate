import { ParagraphPlugin, createPlugin } from '@udecode/plate-common';

import type { IndentPluginOptions } from './types';

export const TextIndentPlugin = createPlugin<'textIndent', IndentPluginOptions>(
  {
    key: 'textIndent',
    options: {
      offset: 24,
      unit: 'px',
    },
  }
).extend(
  ({
    plugin: {
      options: { offset, unit },
    },
  }) => ({
    inject: {
      props: {
        nodeKey: 'textIndent',
        styleKey: 'textIndent',
        transformNodeValue({ nodeValue }) {
          return nodeValue * offset! + unit!;
        },
        validPlugins: [ParagraphPlugin.key],
      },
    },
  })
);
