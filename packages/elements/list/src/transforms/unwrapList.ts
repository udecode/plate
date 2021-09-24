import {
  ELEMENT_DEFAULT,
  getAbove,
  setNodes,
  unwrapNodes,
} from '@udecode/plate-common';
import { getPlatePluginType, SPEditor } from '@udecode/plate-core';
import { Editor, Path } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../defaults';
import { getListTypes } from '../queries';

export const unwrapList = (editor: SPEditor, { at }: { at?: Path } = {}) => {
  Editor.withoutNormalizing(editor, () => {
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
    } while (getAbove(editor, { match: { type: getListTypes(editor), at } }));
  });
};
