import {
  ELEMENT_DEFAULT,
  getAboveNode,
  getBlockAbove,
  getCommonNode,
  getPluginType,
  isElement,
  PlateEditor,
  setElements,
  unwrapNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import {
  ELEMENT_LI,
  ELEMENT_LIC,
  ELEMENT_OL,
  ELEMENT_UL,
} from '../createListPlugin';
import { getListTypes } from '../queries/index';

export const unwrapList = <V extends Value>(
  editor: PlateEditor<V>,
  { at }: { at?: Path } = {}
) => {
  const ancestorListTypeCheck = () => {
    if (getAboveNode(editor, { match: { type: getListTypes(editor), at } })) {
      return true;
    }

    // The selection's common node might be a list type
    if (!at && editor.selection) {
      const commonNode = getCommonNode(
        editor,
        editor.selection.anchor.path,
        editor.selection.focus.path
      );
      if (
        isElement(commonNode[0]) &&
        getListTypes(editor).includes(commonNode[0].type)
      ) {
        return true;
      }
    }

    return false;
  };

  withoutNormalizing(editor, () => {
    do {
      const licEntry = getBlockAbove(editor, {
        at,
        match: { type: getPluginType(editor, ELEMENT_LIC) },
      });
      if (licEntry) {
        setElements(editor, {
          at,
          type: getPluginType(editor, ELEMENT_DEFAULT),
        });
      }

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
    } while (ancestorListTypeCheck());
  });
};
