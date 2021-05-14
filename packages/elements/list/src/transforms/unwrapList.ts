import { setNodes, unwrapNodes } from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../defaults';

export const unwrapList = (editor: SPEditor) => {
  unwrapNodes(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_LI) },
  });
  unwrapNodes(editor, {
    match: {
      type: [
        getSlatePluginType(editor, ELEMENT_UL),
        getSlatePluginType(editor, ELEMENT_OL),
      ],
    },
    split: true,
  });
  setNodes(editor, {
    type: getSlatePluginType(editor, ELEMENT_PARAGRAPH),
  });
};
