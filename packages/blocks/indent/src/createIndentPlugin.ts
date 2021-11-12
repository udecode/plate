import { ELEMENT_DEFAULT } from '@udecode/plate-common';
import { createPlugin, getPlugin, getPluginType } from '@udecode/plate-core';
import { KEY_INDENT } from './defaults';
import { getIndentOnKeyDown } from './getIndentOnKeyDown';
import { IndentPlugin } from './types';
import { withIndent } from './withIndent';

export const createIndentPlugin = createPlugin<IndentPlugin>({
  key: KEY_INDENT,
  withOverrides: withIndent(),
  onKeyDown: getIndentOnKeyDown(),
  overrideProps: {
    nodeKey: KEY_INDENT,
    styleKey: 'marginLeft',
    transformNodeValue: (e, { nodeValue }) => {
      const { offset, unit } = getPlugin<Required<IndentPlugin>>(e, KEY_INDENT);

      return nodeValue * offset + unit;
    },
  },
  withEditor: (editor) => ({
    overrideProps: {
      validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
    },
  }),
  offset: 24,
  unit: 'px',
});
