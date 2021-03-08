import { Editor, Range, Transforms } from 'slate';
import { getAbove } from '../../../common/queries/getAbove';
import { getBlockAbove } from '../../../common/queries/getBlockAbove';
import { getParent } from '../../../common/queries/getParent';
import { deleteFragment } from '../../../common/transforms/deleteFragment';
import { moveChildren } from '../../../common/transforms/moveChildren';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_LIST } from '../defaults';
import { getHighestEmptyList } from '../queries/getHighestEmptyList';
import { hasListChild } from '../queries/hasListChild';
import { isAcrossListItems } from '../queries/isAcrossListItems';
import { ListOptions } from '../types';

export const deleteFragmentList = (editor: Editor, options?: ListOptions) => {
  let deleted = false;

  Editor.withoutNormalizing(editor, () => {
    const { li } = setDefaults(options, DEFAULTS_LIST);

    // Selection should be across list items
    if (!isAcrossListItems(editor, options)) return;

    /**
     * Check if the end li can be deleted (if it has no sublist).
     * Store the path ref to delete it after deleteFragment.
     */
    const end = Editor.end(editor, editor.selection as Range);
    const liEnd = getAbove(editor, { at: end, match: { type: li.type } });
    const liEndCanBeDeleted = liEnd && !hasListChild(liEnd[0], options);
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
    const liStart = getAbove(editor, { at: start, match: { type: li.type } });

    if (liEndPathRef) {
      const liEndPath = liEndPathRef.unref()!;

      const listStart = liStart && getParent(editor, liStart[1]);

      const deletePath = getHighestEmptyList(
        editor,
        liEndPath,
        listStart?.[1],
        options
      );

      if (deletePath) {
        Transforms.removeNodes(editor, { at: deletePath });
      }

      deleted = true;
    }
  });

  return deleted;
};
