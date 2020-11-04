import { Editor, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { isBlockAboveEmpty } from '../../common/queries/isBlockAboveEmpty';
import { isSelectionAtBlockStart } from '../../common/queries/isSelectionAtBlockStart';
import { moveChildren } from '../../common/transforms/moveChildren';
import { setDefaults } from '../../common/utils/setDefaults';
import { onKeyDownResetBlockType } from '../../handlers/reset-block-type/onKeyDownResetBlockType';
import { isSelectionInListItem } from './queries/isSelectionInListItem';
import { deleteListFragment } from './transforms/deleteListFragment';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';
import { unwrapList } from './transforms/unwrapList';
import { DEFAULTS_LIST } from './defaults';
import { ListOptions } from './types';

export const withList = (options?: ListOptions) => <T extends ReactEditor>(
  editor: T
) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);
  const { insertBreak, deleteBackward, deleteFragment } = editor;

  const resetBlockTypesListRule = {
    types: [li.type],
    defaultType: p.type,
    onReset: (_editor: Editor) => unwrapList(_editor, options),
  };

  editor.insertBreak = () => {
    const res = isSelectionInListItem(editor, options);
    let moved: boolean | undefined;

    if (res) {
      const { listItemNode, listItemPath } = res;
      if (listItemNode.children.length > 1) {
        return Transforms.insertNodes(
          editor,
          {
            type: li.type,
            children: [{ type: p.type, children: [{ text: '' }] }],
          },
          { at: Path.next(listItemPath), select: true }
        );
      }
    }
    if (res && isBlockAboveEmpty(editor)) {
      const { listNode, listPath, listItemPath } = res;
      moved = moveListItemUp(editor, listNode, listPath, listItemPath, options);

      if (moved) return;
    }

    const didReset = onKeyDownResetBlockType({
      rules: [
        {
          ...resetBlockTypesListRule,
          predicate: () => !moved && isBlockAboveEmpty(editor),
        },
      ],
    })(null, editor);
    if (didReset) return;

    /**
     * Add a new list item if selection is in a LIST_ITEM > p.type.
     */
    if (!moved) {
      const inserted = insertListItem(editor, options);
      if (inserted) return;
    }

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    const res = isSelectionInListItem(editor, options);

    let moved: boolean | undefined;

    if (res && isSelectionAtBlockStart(editor)) {
      const { listNode, listPath, listItemNode, listItemPath } = res;

      if (listItemNode.children.length > 1) {
        const [listParentNode] = Editor.parent(editor, listPath);

        if (
          // check if this is a first, top-level node
          listParentNode.type !== li.type &&
          listItemPath[listItemPath.length - 1] === 0
        ) {
          if (listNode.children.length <= 1) {
            // move all children to the container
            moveChildren(
              editor,
              [listItemNode, listItemPath],
              Path.next(listPath)
            );
            Transforms.removeNodes(editor, { at: listPath });
            return;
          }
        }
      }

      moved = moveListItemUp(editor, listNode, listPath, listItemPath, options);
      if (moved) return;
    }

    if (res) {
      const { listItemNode } = res;
      if (
        listItemNode.children.length > 1 &&
        Range.isCollapsed(editor.selection as Range)
      ) {
        return deleteBackward(unit);
      }
    }

    const didReset = onKeyDownResetBlockType({
      rules: [
        {
          ...resetBlockTypesListRule,
          predicate: () => !moved && isSelectionAtBlockStart(editor),
        },
      ],
    })(null, editor);
    if (didReset) return;

    deleteBackward(unit);
  };

  editor.deleteFragment = () => {
    const { selection } = editor;
    if (selection) {
      if (deleteListFragment(editor, selection, options)) return;
    }
    deleteFragment();
  };

  return editor;
};
