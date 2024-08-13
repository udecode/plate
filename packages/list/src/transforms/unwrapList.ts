import type { Path } from 'slate';

import {
  ParagraphPlugin,
  type PlateEditor,
  getAboveNode,
  getBlockAbove,
  getCommonNode,
  getPluginType,
  isElement,
  setElements,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import {
  ListItemPlugin,
  ListItemContentPlugin,
  ListOrderedPlugin,
  ListUnorderedPlugin,
} from '../ListPlugin';
import { getListTypes } from '../queries/index';

export const unwrapList = (editor: PlateEditor, { at }: { at?: Path } = {}) => {
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
        match: { type: getPluginType(editor, ListItemContentPlugin.key) },
      });

      if (licEntry) {
        setElements(editor, {
          at,
          type: getPluginType(editor, ParagraphPlugin.key),
        });
      }

      unwrapNodes(editor, {
        at,
        match: { type: getPluginType(editor, ListItemPlugin.key) },
        split: true,
      });

      unwrapNodes(editor, {
        at,
        match: {
          type: [
            getPluginType(editor, ListUnorderedPlugin.key),
            getPluginType(editor, ListOrderedPlugin.key),
          ],
        },
        split: true,
      });
    } while (ancestorListTypeCheck());
  });
};
