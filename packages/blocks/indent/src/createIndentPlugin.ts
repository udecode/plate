import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPlugin, getPluginType } from '@udecode/plate-core';
import { getIndentOnKeyDown } from './getIndentOnKeyDown';
import { IndentPlugin } from './types';
import { withIndent } from './withIndent';

export const KEY_INDENT = 'indent';

export const createIndentPlugin = createPlugin<IndentPlugin>({
  key: KEY_INDENT,
  withOverrides: withIndent(),
  onKeyDown: getIndentOnKeyDown(),
  overrideProps: {
    nodeKey: KEY_INDENT,
    styleKey: 'marginLeft',
  },
  offset: 24,
  unit: 'px',
  then: (editor, { offset, unit }) => ({
    overrideProps: {
      validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      transformNodeValue: (e, { nodeValue }) => {
        return nodeValue * offset! + unit!;
      },
    },
  }),
});
