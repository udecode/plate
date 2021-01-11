import { Editor, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getAboveByType } from '../../common/queries/getAboveByType';
import { getBlockAbove } from '../../common/queries/getBlockAbove';
import { getNodesByType } from '../../common/queries/getNodesByType';
import { getParent } from '../../common/queries/getParent';
import { isBlockAboveEmpty } from '../../common/queries/isBlockAboveEmpty';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isRangeAcrossBlocks } from '../../common/queries/isRangeAcrossBlocks';
import { isSelectionAtBlockStart } from '../../common/queries/isSelectionAtBlockStart';
import { deleteFragment } from '../../common/transforms/deleteFragment';
import { moveChildren } from '../../common/transforms/moveChildren';
import { setDefaults } from '../../common/utils/setDefaults';
import { onKeyDownResetBlockType } from '../../handlers/reset-block-type/onKeyDownResetBlockType';
import { getListNormalizer } from './normalizers/getListNormalizer';
import { getListItemEntry } from './queries/getListItemEntry';
import { hasListInListItem } from './queries/hasListInListItem';
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
  const {
    insertBreak,
    deleteBackward,
    deleteFragment: _deleteFragment,
  } = editor;

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

    const isAcrossListItems = () => {
      if (!selection || isCollapsed(selection)) {
        return false;
      }

      const isAcrossBlocks = isRangeAcrossBlocks(editor, { at: selection });
      if (!isAcrossBlocks) return false;

      const liNodeEntries = [
        ...getNodesByType(editor, li.type, { at: selection }),
      ];
      return !!liNodeEntries.length;
    };

    if (isAcrossListItems()) {
      /**
       * Check if the end li can be deleted.
       * True if it has no sublist.
       * Store the path ref to delete it after deleteFragment.
       */
      const end = Editor.end(editor, editor.selection as Range);
      const liEnd = getAboveByType(editor, li.type, { at: end });
      const liEndCanBeDeleted = liEnd && !hasListInListItem(liEnd[0]);
      const liEndPathRef = liEndCanBeDeleted
        ? Editor.pathRef(editor, liEnd![1])
        : undefined;

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
      const liStart = getAboveByType(editor, li.type, { at: start });

      if (liEndPathRef) {
        const liEndPath = liEndPathRef.unref()!;

        const listStart = liStart && getParent(editor, liStart[1]);

        /**
         * Find the highest end list that can be deleted.
         * True if:
         * - the end list has less than 2 items.
         * - the start list is not equals to the end list.
         */
        const getHighestEmptyList = (liPath: Path): Path | undefined => {
          const list = getParent(editor, liPath);
          if (
            list &&
            list[0].children.length < 2 &&
            listStart &&
            !Path.equals(list[1], listStart[1])
          ) {
            const listParent = getParent(editor, list[1]);
            return (
              (listParent && getHighestEmptyList(listParent[1])) || list[1]
            );
          }
        };

        // TODO: delete empty li ancestor
        const listPathToDelete = getHighestEmptyList(liEndPath);
        if (listPathToDelete) {
          listPathToDelete &&
            Transforms.removeNodes(editor, { at: listPathToDelete });
        } else if (liEndCanBeDeleted) {
          Transforms.removeNodes(editor, { at: liEndPath });
        }
      }

      return;
    }

    _deleteFragment();
  };

  editor.normalizeNode = getListNormalizer(
    editor,
    { validLiChildrenTypes },
    options
  );

  return editor;
};
