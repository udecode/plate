import type { Range } from 'slate';

import {
  type ExtendEditor,
  type SlateEditor,
  createPathRef,
  deleteMerge,
  getAboveNode,
  getEndPoint,
  getParentNode,
  getStartPoint,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { BaseListItemPlugin, type ListConfig } from './BaseListPlugin';
import { getHighestEmptyList } from './queries/getHighestEmptyList';
import { hasListChild } from './queries/hasListChild';
import { isAcrossListItems } from './queries/isAcrossListItems';

const getLiStart = (editor: SlateEditor) => {
  const start = getStartPoint(editor, editor.selection as Range);

  return getAboveNode(editor, {
    at: start,
    match: { type: editor.getType(BaseListItemPlugin) },
  });
};

export const withDeleteFragmentList: ExtendEditor<ListConfig> = ({
  editor,
}) => {
  const { deleteFragment } = editor;

  editor.deleteFragment = (direction) => {
    const deleteFragmentList = () => {
      let deleted = false;

      withoutNormalizing(editor, () => {
        // Selection should be across list items
        if (!isAcrossListItems(editor)) return;

        /**
         * Check if the end li can be deleted (if it has no sublist). Store the
         * path ref to delete it after deleteMerge.
         */
        const end = getEndPoint(editor, editor.selection as Range);
        const liEnd = getAboveNode(editor, {
          at: end,
          match: { type: editor.getType(BaseListItemPlugin) },
        });
        const liEndCanBeDeleted = liEnd && !hasListChild(editor, liEnd[0]);
        const liEndPathRef = liEndCanBeDeleted
          ? createPathRef(editor, liEnd![1])
          : undefined;

        // use deleteFragment when selection wrapped around list
        if (!getLiStart(editor) || !liEnd) {
          deleted = false;

          return;
        }

        /** Delete fragment and move end block children to start block */
        deleteMerge(editor);

        const liStart = getLiStart(editor);

        if (liEndPathRef) {
          const liEndPath = liEndPathRef.unref()!;

          const listStart = liStart && getParentNode(editor, liStart[1]);

          const deletePath = getHighestEmptyList(editor, {
            diffListPath: listStart?.[1],
            liPath: liEndPath,
          });

          if (deletePath) {
            removeNodes(editor, { at: deletePath });
          }

          deleted = true;
        }
      });

      return deleted;
    };

    if (deleteFragmentList()) return;

    deleteFragment(direction);
  };

  return editor;
};
