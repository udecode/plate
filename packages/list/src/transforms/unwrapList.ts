import type { Path } from 'slate';

import {
  ParagraphPlugin,
  type SlateEditor,
  getAboveNode,
  getBlockAbove,
  getCommonNode,
  isElement,
  setElements,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import {
  ListItemContentPlugin,
  ListItemPlugin,
  ListOrderedPlugin,
  ListUnorderedPlugin,
} from '../ListPlugin';
import { getListTypes } from '../queries/index';

export const unwrapList = (editor: SlateEditor, { at }: { at?: Path } = {}) => {
  const ancestorListTypeCheck = () => {
    if (getAboveNode(editor, { match: { at, type: getListTypes(editor) } })) {
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
        match: { type: editor.getType(ListItemContentPlugin) },
      });

      if (licEntry) {
        setElements(editor, {
          at,
          type: editor.getType(ParagraphPlugin),
        });
      }

      unwrapNodes(editor, {
        at,
        match: { type: editor.getType(ListItemPlugin) },
        split: true,
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: [
            editor.getType(ListUnorderedPlugin),
            editor.getType(ListOrderedPlugin),
          ],
        },
        split: true,
      });
    } while (ancestorListTypeCheck());
  });
};
