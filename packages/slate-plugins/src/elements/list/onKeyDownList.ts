import isHotkey from 'is-hotkey';
import {
  Ancestor,
  Editor,
  Element,
  NodeEntry,
  Path,
  Range,
  Transforms,
} from 'slate';
import {
  isBlockAboveEmpty,
  isFirstChild,
  isNodeTypeIn,
  isRangeAtRoot,
  isSelectionAtBlockStart,
} from '../../common/queries';
import { setDefaults } from '../../common/utils/setDefaults';
import { onKeyDownResetBlockType } from '../../handlers/reset-block-type/onKeyDownResetBlockType';
import { unwrapList } from './transforms/unwrapList';
import { DEFAULTS_LIST } from './defaults';
import { isList } from './queries';
import { ListHotkey, ListOnKeyDownOptions, ListOptions } from './types';

/**
 * Move a list item next to its parent.
 * The parent should be a list item.
 */
const moveUp = (
  editor: Editor,
  listNode: Ancestor,
  listPath: number[],
  listItemPath: number[],
  options?: ListOptions
) => {
  const { li } = setDefaults(options, DEFAULTS_LIST);

  const [listParentNode, listParentPath] = Editor.parent(editor, listPath);
  if (listParentNode.type !== li.type) return;

  const newListItemPath = Path.next(listParentPath);

  // Move item one level up
  Transforms.moveNodes(editor, {
    at: listItemPath,
    to: newListItemPath,
  });

  /**
   * Move the next siblings to a new list
   */
  const listItemIdx = listItemPath[listItemPath.length - 1];
  const siblingPath = [...listItemPath];
  const newListPath = newListItemPath.concat(1);
  let siblingFound = false;
  let newSiblingIdx = 0;
  listNode.children.forEach((n, idx) => {
    if (listItemIdx < idx) {
      if (!siblingFound) {
        siblingFound = true;

        Transforms.insertNodes(
          editor,
          {
            type: listNode.type,
            children: [],
          },
          { at: newListPath }
        );
      }

      siblingPath[siblingPath.length - 1] = listItemIdx;
      const newSiblingsPath = newListPath.concat(newSiblingIdx);
      newSiblingIdx++;
      Transforms.moveNodes(editor, {
        at: siblingPath,
        to: newSiblingsPath,
      });
    }
  });

  // Remove sublist if it was the first list item
  if (!listItemIdx) {
    Transforms.removeNodes(editor, {
      at: listPath,
    });
  }

  return true;
};

const moveDown = (
  editor: Editor,
  listNode: Ancestor,
  listItemPath: number[],
  options?: ListOptions
) => {
  // Previous sibling is the new parent
  const previousSiblingItem = Editor.node(
    editor,
    Path.previous(listItemPath)
  ) as NodeEntry<Ancestor>;

  if (previousSiblingItem) {
    const [previousNode, previousPath] = previousSiblingItem;

    const sublist = previousNode.children.find(isList(options)) as
      | Element
      | undefined;
    const newPath = previousPath.concat(
      sublist ? [1, sublist.children.length] : [1]
    );

    if (!sublist) {
      // Create new sublist
      Transforms.wrapNodes(
        editor,
        { type: listNode.type, children: [] },
        { at: listItemPath }
      );
    }

    // Move the current item to the sublist
    Transforms.moveNodes(editor, {
      at: listItemPath,
      to: newPath,
    });
  }
};

export const onKeyDownList = (options?: ListOnKeyDownOptions) => (
  e: KeyboardEvent,
  editor: Editor
) => {
  const { p, li } = setDefaults(options, DEFAULTS_LIST);

  let moved: boolean | undefined = false;

  if (Object.values(ListHotkey).includes(e.key)) {
    if (
      editor.selection &&
      isNodeTypeIn(editor, li.type) &&
      !isRangeAtRoot(editor.selection)
    ) {
      if (e.key === ListHotkey.TAB) {
        e.preventDefault();
      }

      // If selection is in li > p
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection
      );
      if (paragraphNode.type !== p.type) return;
      const [listItemNode, listItemPath] = Editor.parent(editor, paragraphPath);
      if (listItemNode.type !== li.type) return;
      const [listNode, listPath] = Editor.parent(editor, listItemPath);

      // move up
      const shiftTab = e.shiftKey && e.key === ListHotkey.TAB;

      const enterOnEmptyBlock =
        e.key === ListHotkey.ENTER && isBlockAboveEmpty(editor);
      const deleteAtBlockStart =
        e.key === ListHotkey.DELETE_BACKWARD && isSelectionAtBlockStart(editor);

      if (shiftTab || enterOnEmptyBlock || deleteAtBlockStart) {
        moved = moveUp(editor, listNode, listPath, listItemPath, options);
        if (moved) e.preventDefault();
      }

      // move down
      const tab = !e.shiftKey && e.key === ListHotkey.TAB;
      if (tab && !isFirstChild(listItemPath)) {
        moveDown(editor, listNode, listItemPath, options);
      }
    }
  }

  const resetBlockTypesListRule = {
    types: [li.type],
    defaultType: p.type,
    onReset: unwrapList,
  };

  onKeyDownResetBlockType({
    rules: [
      {
        ...resetBlockTypesListRule,
        hotkey: 'Enter',
        predicate: () => !moved && isBlockAboveEmpty(editor),
      },
      {
        ...resetBlockTypesListRule,
        hotkey: 'Backspace',
        predicate: () => !moved && isSelectionAtBlockStart(editor),
      },
    ],
  })(e, editor);

  /**
   * Add a new list item if selection is in a LIST_ITEM > p.type.
   */
  if (!moved && isHotkey('Enter', e)) {
    if (editor.selection && !isRangeAtRoot(editor.selection)) {
      const [paragraphNode, paragraphPath] = Editor.parent(
        editor,
        editor.selection
      );
      if (paragraphNode.type === p.type) {
        const [listItemNode, listItemPath] = Editor.parent(
          editor,
          paragraphPath
        );

        if (listItemNode.type === li.type) {
          if (!Range.isCollapsed(editor.selection)) {
            Transforms.delete(editor);
          }

          const isStart = Editor.isStart(
            editor,
            editor.selection.anchor,
            paragraphPath
          );
          const isEnd = Editor.isEnd(
            editor,
            editor.selection.anchor,
            paragraphPath
          );

          const nextParagraphPath = Path.next(paragraphPath);
          const nextListItemPath = Path.next(listItemPath);

          /**
           * If start, insert a list item before
           */
          if (isStart) {
            Transforms.insertNodes(
              editor,
              {
                type: li.type,
                children: [{ type: p.type, children: [{ text: '' }] }],
              },
              { at: listItemPath }
            );
            return e.preventDefault();
          }

          /**
           * If not end, split nodes, wrap a list item on the new paragraph and move it to the next list item
           */
          if (!isEnd) {
            Transforms.splitNodes(editor, { at: editor.selection });
            Transforms.wrapNodes(
              editor,
              {
                type: li.type,
                children: [],
              },
              { at: nextParagraphPath }
            );
            Transforms.moveNodes(editor, {
              at: nextParagraphPath,
              to: nextListItemPath,
            });
          } else {
            /**
             * If end, insert a list item after and select it
             */
            Transforms.insertNodes(
              editor,
              {
                type: li.type,
                children: [{ type: p.type, children: [{ text: '' }] }],
              },
              { at: nextListItemPath }
            );
            Transforms.select(editor, nextListItemPath);
          }

          /**
           * If there is a list in the list item, move it to the next list item
           */
          if (listItemNode.children.length > 1) {
            Transforms.moveNodes(editor, {
              at: nextParagraphPath,
              to: nextListItemPath.concat(1),
            });
          }

          return e.preventDefault();
        }
      }
    }
  }
};
