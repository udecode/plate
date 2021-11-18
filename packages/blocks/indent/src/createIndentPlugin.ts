import {
  createPluginFactory,
  ELEMENT_DEFAULT,
  getPluginType,
} from '@udecode/plate-core';
import { onKeyDownIndent } from './onKeyDownIndent';
import { IndentPlugin } from './types';
import { withIndent } from './withIndent';

export const KEY_INDENT = 'indent';

export const createIndentPlugin = createPluginFactory<IndentPlugin>({
  key: KEY_INDENT,
  withOverrides: withIndent,
  handlers: {
    onKeyDown: onKeyDownIndent,
  },
  inject: {
    props: {
      nodeKey: KEY_INDENT,
      styleKey: 'marginLeft',
    },
  },
  options: {
    offset: 24,
    unit: 'px',
  },
  then: (editor, { options: { offset, unit } = {} }) => ({
    inject: {
      props: {
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
        transformNodeValue: (e, { nodeValue }) => {
          return nodeValue * offset! + unit!;
        },
      },
    },
  }),
});
