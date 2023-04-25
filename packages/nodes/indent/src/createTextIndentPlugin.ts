import {
  createPluginFactory,
  ELEMENT_DEFAULT,
  getPluginType,
} from '@udecode/plate-common';
import { IndentPlugin } from './types';

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
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
        transformNodeValue({ nodeValue }) {
          return nodeValue * offset! + unit!;
        },
      },
    },
  }),
});
