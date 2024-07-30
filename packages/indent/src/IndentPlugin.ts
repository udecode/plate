import {
  ELEMENT_DEFAULT,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common/server';

import type { IndentPluginOptions } from './types';

import { onKeyDownIndent } from './onKeyDownIndent';
import { withIndent } from './withIndent';

export const KEY_INDENT = 'indent';

export const IndentPlugin = createPlugin<IndentPluginOptions>({
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
  key: KEY_INDENT,
  options: {
    offset: 24,
    unit: 'px',
  },
  withOverrides: withIndent,
}).extend((editor, { options: { offset, unit } = {} }) => ({
  inject: {
    props: {
      nodeKey: KEY_INDENT,
      styleKey: 'marginLeft',
      transformNodeValue: ({ nodeValue }) => nodeValue * offset! + unit!,
      validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
    },
  },
}));
