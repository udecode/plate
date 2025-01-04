import type { Path } from 'slate';

import {
  type SlateEditor,
  BaseParagraphPlugin,
  getCommonNode,
  isElement,
} from '@udecode/plate-common';

import {
  BaseBulletedListPlugin,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
  BaseNumberedListPlugin,
} from '../BaseListPlugin';
import { getListTypes } from '../queries/index';

export const unwrapList = (editor: SlateEditor, { at }: { at?: Path } = {}) => {
  const ancestorListTypeCheck = () => {
    if (editor.api.above({ at, match: { type: getListTypes(editor) } })) {
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

  editor.tf.withoutNormalizing(() => {
    do {
      const licEntry = editor.api.block({
        at,
        match: { type: editor.getType(BaseListItemContentPlugin) },
      });

      if (licEntry) {
        editor.tf.setNodes({
          at,
          type: editor.getType(BaseParagraphPlugin),
        });
      }

      editor.tf.unwrapNodes({
        at,
        match: { type: editor.getType(BaseListItemPlugin) },
        split: true,
      });

      editor.tf.unwrapNodes({
        at,
        match: {
          type: [
            editor.getType(BaseBulletedListPlugin),
            editor.getType(BaseNumberedListPlugin),
          ],
        },
        split: true,
      });
    } while (ancestorListTypeCheck());
  });
};
