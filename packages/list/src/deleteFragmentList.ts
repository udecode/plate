import type { Range } from 'slate';

import {
  type PlateEditor,
  createPathRef,
  deleteMerge,
  getAboveNode,
  getEndPoint,
  getParentNode,
  getPluginType,
  getStartPoint,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import { ELEMENT_LI } from './ListPlugin';
import { getHighestEmptyList } from './queries/getHighestEmptyList';
import { hasListChild } from './queries/hasListChild';
import { isAcrossListItems } from './queries/isAcrossListItems';

const getLiStart = (editor: PlateEditor) => {
  const start = getStartPoint(editor, editor.selection as Range);

  return getAboveNode(editor, {
    at: start,
    match: { type: getPluginType(editor, ELEMENT_LI) },
  });
};

export const deleteFragmentList = (editor: PlateEditor) => {
  let deleted = false;

  withoutNormalizing(editor, () => {
    // Selection should be across list items
    if (!isAcrossListItems(editor)) return;

    /**
     * Check if the end li can be deleted (if it has no sublist). Store the path
     * ref to delete it after deleteMerge.
     */
    const end = getEndPoint(editor, editor.selection as Range);
    const liEnd = getAboveNode(editor, {
      at: end,
      match: { type: getPluginType(editor, ELEMENT_LI) },
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
