import {
  ELEMENT_DEFAULT,
  getAboveNode,
  getPluginType,
  PlateEditor,
  setElements,
  unwrapNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '../createListPlugin';
import { getListTypes } from '../queries';

export const unwrapList = <V extends Value>(
  editor: PlateEditor<V>,
  { at }: { at?: Path } = {}
) => {
  withoutNormalizing(editor, () => {
    do {
      setElements(editor, {
        type: getPluginType(editor, ELEMENT_DEFAULT),
      });

      unwrapNodes(editor, {
        at,
        match: { type: getPluginType(editor, ELEMENT_LI) },
        split: true,
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: [
            getPluginType(editor, ELEMENT_UL),
            getPluginType(editor, ELEMENT_OL),
          ],
        },
        split: true,
      });
    } while (
      getAboveNode(editor, { match: { type: getListTypes(editor), at } })
    );
  });
};
