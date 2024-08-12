import { ELEMENT_DEFAULT, createPlugin } from '@udecode/plate-common';

import type { IndentPluginOptions } from './types';

export const KEY_TEXT_INDENT = 'textIndent';

export const TextIndentPlugin = createPlugin<'textIndent', IndentPluginOptions>(
  {
    key: KEY_TEXT_INDENT,
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
        nodeKey: KEY_TEXT_INDENT,
        styleKey: 'textIndent',
        transformNodeValue({ nodeValue }) {
          return nodeValue * offset! + unit!;
        },
        validPlugins: [ELEMENT_DEFAULT],
      },
    },
  })
);
