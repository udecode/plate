import { unwrapNodes } from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const unwrapList = (editor: Editor) => {
  unwrapNodes(editor, { match: { type: getPluginType(editor, ELEMENT_LI) } });
  unwrapNodes(editor, {
    match: {
      type: [
        getPluginType(editor, ELEMENT_UL),
        getPluginType(editor, ELEMENT_OL),
      ],
    },
    split: true,
  });
};
