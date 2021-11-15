import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPluginFactory, getPluginType } from '@udecode/plate-core';
import { getIndentOnKeyDown } from './getIndentOnKeyDown';
import { IndentPlugin } from './types';
import { withIndent } from './withIndent';

export const KEY_INDENT = 'indent';

export const createIndentPlugin = createPluginFactory<IndentPlugin>({
  key: KEY_INDENT,
  withOverrides: withIndent(),
  handlers: {
    onKeyDown: getIndentOnKeyDown(),
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
