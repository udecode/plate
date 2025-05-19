import {
  type EditorTransforms,
  type ElementEntry,
  type OverrideEditor,
  type SlateEditor,
  type TElement,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import type { ListConfig } from './BaseListPlugin';

import {
  BaseListItemContentPlugin,
  BaseListItemPlugin,
} from './BaseListPlugin';
import {
  getListItemEntry,
  getListRoot,
  hasListChild,
  isAcrossListItems,
} from './queries/index';
import {
  moveListItemsToList,
  moveListItemUp,
  removeFirstListItem,
  removeListItem,
} from './transforms/index';

const selectionIsNotInAListHandler = (editor: SlateEditor): boolean => {
  const pointAfterSelection = editor.api.after(editor.selection!.focus);

  if (pointAfterSelection) {
    // there is a block after it
    const nextSiblingListRes = getListItemEntry(editor, {
      at: pointAfterSelection,
    });

    if (nextSiblingListRes) {
      // the next block is a list
      const { listItem } = nextSiblingListRes;
      const parentBlockEntity = editor.api.block({
        at: editor.selection!.anchor,
      });

      if (!editor.api.string(parentBlockEntity![1])) {
        // the selected block is empty
        editor.tf.removeNodes();

        return true;
      }
      if (hasListChild(editor, listItem[0])) {
        // the next block has children, so we have to move the first item up
        const sublistRes = getListItemEntry(editor, {
          at: [...listItem[1], 1, 0, 0],
        });

        moveListItemUp(editor, sublistRes!);
      }
    }
  }

  return false;
};

const selectionIsInAListHandler = (
  editor: SlateEditor,
  res: { list: ElementEntry; listItem: ElementEntry },
  defaultDelete: EditorTransforms['deleteBackward'],
  unit: 'block' | 'character' | 'line' | 'word' = 'character'
): boolean => {
  const { listItem } = res;

  // if it has no children
  if (!hasListChild(editor, listItem[0])) {
    const liType = editor.getType(BaseListItemPlugin);
    const _nodes = editor.api.nodes({
      at: listItem[1],
      mode: 'lowest',
      match: (node, path) => {
        if (path.length === 0) {
          return false;
        }

        const isNodeLi = (node as TElement).type === liType;
        const isSiblingOfNodeLi =
          NodeApi.get<TElement>(editor, PathApi.next(path))?.type === liType;

        return isNodeLi && isSiblingOfNodeLi;
      },
    });
    const liWithSiblings = Array.from(_nodes, (entry) => entry[1])[0];

    if (!liWithSiblings) {
      // there are no more list item in the list
      const pointAfterListItem = editor.api.after(listItem[1]);

      if (pointAfterListItem) {
        // there is a block after it
        const nextSiblingListRes = getListItemEntry(editor, {
          at: pointAfterListItem,
        });

        if (nextSiblingListRes) {
          // it is a list so we merge the lists
          const listRoot = getListRoot(editor, listItem[1]);

          moveListItemsToList(editor, {
            deleteFromList: true,
            fromList: nextSiblingListRes.list,
            toList: listRoot,
          });

          return true;
        }
      }

      return false;
    }

    const siblingListItem = editor.api.node<TElement>(
      PathApi.next(liWithSiblings)
    );

    if (!siblingListItem) return false;

    const siblingList = editor.api.parent<TElement>(siblingListItem[1]);

    if (
      siblingList &&
      removeListItem(editor, {
        list: siblingList,
        listItem: siblingListItem,
        reverse: false,
      })
    ) {
      return true;
    }

    const pointAfterListItem = editor.api.after(editor.selection!.focus);

    if (
      !pointAfterListItem ||
      !isAcrossListItems(editor, {
        anchor: editor.selection!.anchor,
        focus: pointAfterListItem,
      })
    ) {
      return false;
    }

    // get closest lic ancestor of next selectable
    const licType = editor.getType(BaseListItemContentPlugin);
    const _licNodes = editor.api.nodes<TElement>({
      at: pointAfterListItem.path,
      mode: 'lowest',
      match: (node) => node.type === licType,
    });
    const nextSelectableLic = [..._licNodes][0];

    // let slate handle single child cases
    if (nextSelectableLic[0].children.length < 2) return false;

    // manually run default delete
    defaultDelete(unit);

    const leftoverListItem = editor.api.node<TElement>(
      PathApi.parent(nextSelectableLic[1])
    )!;

    if (leftoverListItem && leftoverListItem[0].children.length === 0) {
      // remove the leftover empty list item
      editor.tf.removeNodes({ at: leftoverListItem[1] });
    }

    return true;
  }

  // if it has children
  const nestedList = editor.api.node<TElement>(
    PathApi.next([...listItem[1], 0])
  );

  if (!nestedList) return false;

  const nestedListItem = Array.from(
    NodeApi.children<TElement>(editor, nestedList[1])
  )[0];

  if (
    removeFirstListItem(editor, {
      list: nestedList,
      listItem: nestedListItem,
    })
  ) {
    return true;
  }
  if (
    removeListItem(editor, {
      list: nestedList,
      listItem: nestedListItem,
    })
  ) {
    return true;
  }

  return false;
};

export const withDeleteForwardList: OverrideEditor<ListConfig> = ({
  editor,
  tf: { deleteForward },
}) => ({
  transforms: {
    deleteForward(unit) {
      const deleteForwardList = () => {
        let skipDefaultDelete = false;

        if (!editor?.selection) {
          return skipDefaultDelete;
        }
        if (!editor.api.isAt({ end: true })) {
          return skipDefaultDelete;
        }

        editor.tf.withoutNormalizing(() => {
          const res = getListItemEntry(editor, {});

          if (!res) {
            skipDefaultDelete = selectionIsNotInAListHandler(editor);

            return;
          }

          skipDefaultDelete = selectionIsInAListHandler(
            editor,
            res,
            deleteForward,
            unit
          );
        });

        return skipDefaultDelete;
      };

      if (deleteForwardList()) return;

      deleteForward(unit);
    },
  },
});
