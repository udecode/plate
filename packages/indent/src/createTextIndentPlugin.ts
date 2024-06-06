import {
  ELEMENT_DEFAULT,
  createPluginFactory,
  getPluginType,
} from '@udecode/plate-common/server';

import type { IndentPlugin } from './types';

export const KEY_TEXT_INDENT = 'textIndent';

export const createTextIndentPlugin = createPluginFactory<IndentPlugin>({
  key: KEY_TEXT_INDENT,
  options: {
    offset: 24,
    unit: 'px',
  },
  then: (editor, { options: { offset, unit } = {} }) => ({
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
  }),
});
