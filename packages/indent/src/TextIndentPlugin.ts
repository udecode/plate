import {
  ELEMENT_DEFAULT,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common/server';

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
    editor,
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
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
  })
);
