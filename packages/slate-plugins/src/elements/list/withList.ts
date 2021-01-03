import { Editor, Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { isBlockAboveEmpty } from '../../common/queries/isBlockAboveEmpty';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isSelectionAtBlockStart } from '../../common/queries/isSelectionAtBlockStart';
import { setDefaults } from '../../common/utils/setDefaults';
import { onKeyDownResetBlockType } from '../../handlers/reset-block-type/onKeyDownResetBlockType';
import { getListNormalizer } from './normalizers/getListNormalizer';
import { getListItemEntry } from './queries/getListItemEntry';
import { hasListInListItem } from './queries/hasListInListItem';
import { deleteListFragment } from './transforms/deleteListFragment';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';
import { removeFirstListItem } from './transforms/removeFirstListItem';
import { removeRootListItem } from './transforms/removeRootListItem';
import { unwrapList } from './transforms/unwrapList';
import { DEFAULTS_LIST } from './defaults';
import { WithListOptions } from './types';

export const withList = ({
  validLiChildrenTypes,
  ...options
}: WithListOptions = {}) => <T extends ReactEditor>(editor: T) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);
  const { insertBreak, deleteBackward, deleteFragment } = editor;

  const resetBlockTypesListRule = {
    types: [li.type],
    defaultType: p.type,
    onReset: (_editor: Editor) => unwrapList(_editor, options),
  };

  editor.insertBreak = () => {
    if (!editor.selection) return;

    const res = getListItemEntry(editor, {}, options);
    let moved: boolean | undefined;

    // If selection is in a li
    if (res) {
      const { list, listItem } = res;
      const [listItemNode, listItemPath] = listItem;

      const cursor = editor.selection.focus;

      if (hasListInListItem(listItemNode)) {
        /**
         * If selection is at the end of li,
         * insert below li where children will be moved.
         */
        if (Editor.isEnd(editor, cursor, listItemPath)) {
          return Transforms.insertNodes(
            editor,
            {
              type: li.type,
              children: [{ type: p.type, children: [{ text: '' }] }],
            },
            { at: Path.next(listItemPath), select: true }
          );
        }

        /**
         * If selection is at start of li,
         * insert above li.
         */
        if (Editor.isStart(editor, cursor, listItemPath)) {
          return Transforms.insertNodes(
            editor,
            {
              type: li.type,
              children: [{ type: p.type, children: [{ text: '' }] }],
            },
            { at: listItemPath }
          );
        }
      }

      /**
       * If selected li is empty, move it up.
       */
      if (isBlockAboveEmpty(editor)) {
        moved = moveListItemUp(
          editor,
          {
            list,
            listItem,
          },
          options
        );

        if (moved) return;
      }
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
     * If selection is in li > p, insert li.
     */
    if (!moved) {
      const inserted = insertListItem(editor, options);
      if (inserted) return;
    }

    insertBreak();
  };

  editor.deleteBackward = (unit) => {
    const res = getListItemEntry(editor, {}, options);

    let moved: boolean | undefined;

    if (res) {
      const { list, listItem } = res;
      const [listItemNode] = listItem;

      if (isSelectionAtBlockStart(editor)) {
        Editor.withoutNormalizing(editor, () => {
          moved = removeFirstListItem(editor, { list, listItem }, options);
          if (moved) return;

          moved = removeRootListItem(editor, { list, listItem }, options);
          if (moved) return;

          moved = moveListItemUp(editor, { list, listItem }, options);
        });
        if (moved) return;
      }

      if (hasListInListItem(listItemNode) && isCollapsed(editor.selection)) {
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
      let deleted;
      Editor.withoutNormalizing(editor, () => {
        deleted = deleteListFragment(editor, selection, options);
      });
      if (deleted !== undefined) return;
    }

    deleteFragment();
  };

  editor.normalizeNode = getListNormalizer(
    editor,
    { validLiChildrenTypes },
    options
  );

  return editor;
};
