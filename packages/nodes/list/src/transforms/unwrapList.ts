import {
  ELEMENT_DEFAULT,
  getAboveNode,
  getCommonNode,
  getNodeEntry,
  getParentNode,
  getPluginType,
  isElement,
  PlateEditor,
  setElements,
  unwrapNodes,
  Value,
  withoutNormalizing,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { getListTypes } from '../queries';

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
      const location = at ?? editor.selection;
      if (!location) return;

      // Convert parent LIC node to ELEMENT_DEFAULT
      const textNode = getNodeEntry(editor, location);
      const licNode = getParentNode(editor, textNode[1]);
      if (!licNode) {
        return;
      }
      setElements(
        editor,
        {
          type: getPluginType(editor, ELEMENT_DEFAULT),
        },
        { at: licNode[1] }
      );

      // Unwrap the LI node
      const liNode = getParentNode(editor, licNode[1]);
      if (!liNode) {
        return;
      }
      unwrapNodes(editor, {
        at: liNode[1],
        split: true,
      });

      // Unwrap the ol/ul node
      const ulolNode = getParentNode(editor, liNode[1]);
      if (!ulolNode) {
        return;
      }
      unwrapNodes(editor, {
        at: ulolNode[1],
        split: true,
      });
    } while (ancestorListTypeCheck());
  });
};
