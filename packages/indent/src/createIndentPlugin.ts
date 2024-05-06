import {
  ELEMENT_DEFAULT,
  createPluginFactory,
  getPluginType,
} from '@udecode/plate-common/server';

import type { IndentPlugin } from './types';

import { onKeyDownIndent } from './onKeyDownIndent';
import { withIndent } from './withIndent';

export const KEY_INDENT = 'indent';

export const createIndentPlugin = createPluginFactory<IndentPlugin>({
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
  key: KEY_INDENT,
  options: {
    offset: 24,
    unit: 'px',
  },
  then: (editor, { options: { offset, unit } = {} }) => ({
    inject: {
      props: {
        nodeKey: KEY_INDENT,
        styleKey: 'marginLeft',
        transformNodeValue: ({ nodeValue }) => nodeValue * offset! + unit!,
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
  }),
  withOverrides: withIndent,
});
