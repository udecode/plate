import {
  deleteFragment,
  getAbove,
  getBlockAbove,
  getParent,
  moveChildren,
} from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { Editor, Range, Transforms } from 'slate';
import { ELEMENT_LI } from '../defaults';
import { getHighestEmptyList } from '../queries/getHighestEmptyList';
import { hasListChild } from '../queries/hasListChild';
import { isAcrossListItems } from '../queries/isAcrossListItems';

export const deleteFragmentList = (editor: SPEditor) => {
  let deleted = false;

  Editor.withoutNormalizing(editor, () => {
    // Selection should be across list items
    if (!isAcrossListItems(editor)) return;

    /**
     * Check if the end li can be deleted (if it has no sublist).
     * Store the path ref to delete it after deleteFragment.
     */
    const end = Editor.end(editor, editor.selection as Range);
    const liEnd = getAbove(editor, {
      at: end,
      match: { type: getSlatePluginType(editor, ELEMENT_LI) },
    });
    const liEndCanBeDeleted = liEnd && !hasListChild(editor, liEnd[0]);
    const liEndPathRef = liEndCanBeDeleted
      ? Editor.pathRef(editor, liEnd![1])
      : undefined;

    /**
     * Delete fragment and move end block children to start block
     */
    deleteFragment(editor, {
      moveNode: (_editor, { at }) => {
        if (!editor.selection) return;

        const [, path] = Editor.node(editor, at);

        const blockAbove = getBlockAbove(editor, {
          at: Range.start(editor.selection),
        });
        if (!blockAbove) return;
        const [blockAboveNode, blockAbovePath] = blockAbove;

        moveChildren(editor, {
          at: path,
          to: blockAbovePath.concat(blockAboveNode.children.length),
        });
      },
      removeEmptyAncestor: () => {},
    });

    const start = Editor.start(editor, editor.selection as Range);
    const liStart = getAbove(editor, {
      at: start,
      match: { type: getSlatePluginType(editor, ELEMENT_LI) },
    });

    if (liEndPathRef) {
      const liEndPath = liEndPathRef.unref()!;

      const listStart = liStart && getParent(editor, liStart[1]);

      const deletePath = getHighestEmptyList(editor, {
        liPath: liEndPath,
        diffListPath: listStart?.[1],
      });

      if (deletePath) {
        Transforms.removeNodes(editor, { at: deletePath });
      }

      deleted = true;
    }
  });

  return deleted;
};
