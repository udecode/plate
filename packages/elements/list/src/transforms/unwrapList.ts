import {
  ELEMENT_DEFAULT,
  setNodes,
  someNode,
  unwrapNodes,
} from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../defaults';
import { getListTypes } from '../queries';

export const unwrapList = (editor: SPEditor, { at }: { at?: Path } = {}) => {
  do {
    setNodes(editor, {
      type: getPlatePluginType(editor, ELEMENT_DEFAULT),
    });

    unwrapNodes(editor, {
      at,
      match: { type: getPlatePluginType(editor, ELEMENT_LI) },
      split: true,
    });

    unwrapNodes(editor, {
      at,
      match: {
        type: [
          getPlatePluginType(editor, ELEMENT_UL),
          getPlatePluginType(editor, ELEMENT_OL),
        ],
      },
      split: true,
    });
  } while (someNode(editor, { match: { type: getListTypes(editor) } }));
};
