import { Editor, Path, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { isBlockAboveEmpty } from '../../common/queries/isBlockAboveEmpty';
import { isSelectionAtBlockStart } from '../../common/queries/isSelectionAtBlockStart';
import { setDefaults } from '../../common/utils/setDefaults';
import { onKeyDownResetBlockType } from '../../handlers/reset-block-type/onKeyDownResetBlockType';
import { isSelectionInListItem } from './queries/isSelectionInListItem';
import { insertListItem } from './transforms/insertListItem';
import { moveListItemUp } from './transforms/moveListItemUp';
import { unwrapList } from './transforms/unwrapList';
import { DEFAULTS_LIST } from './defaults';
import { ListOptions } from './types';

export const withList = (options?: ListOptions) => <T extends ReactEditor>(
  editor: T
) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);
  const { insertBreak, deleteBackward } = editor;

  const resetBlockTypesListRule = {
    types: [li.type],
    defaultType: p.type,
    onReset: (_editor: Editor) => unwrapList(_editor, options),
  };

  editor.insertBreak = () => {
    const res = isSelectionInListItem(editor, options);
    let moved: boolean | undefined;

    if (res) {
      const { listItemNode, listItemPath } = res
      if (listItemNode.children.length > 1) {
        return Transforms.insertNodes(editor, {
          type: DEFAULTS_LIST.li.type,
          children: [{ type: DEFAULTS_LIST.p.type, children: [{ text: '' }]}]
        }, { at: Path.next(listItemPath), select: true });
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
      const { listNode, listPath, listItemPath } = res;

      moved = moveListItemUp(editor, listNode, listPath, listItemPath, options);
      if (moved) return;
    }

    if (res) {
      const { listItemNode } = res;
      if (listItemNode.children.length > 1 && Range.isCollapsed(editor.selection as Range)) {
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

  return editor;
};
