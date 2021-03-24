import { unwrapNodes } from '@udecode/slate-plugins-common';
import { getPluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const unwrapList = (editor: SPEditor) => {
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
