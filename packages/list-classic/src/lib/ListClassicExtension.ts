import type { SlateEditor } from '@platejs/core';
import type {
  Ancestor,
  AncestorEntry,
  Descendant,
  DescendantEntry,
  EditorCoreStateView,
  EditorExtensionInput,
  EditorTransformNext,
  EditorUpdateTransaction,
  Element,
  ElementEntry,
  NodeEntry,
  Path,
  Range,
  Text,
  TextUnit,
} from '@platejs/slate';

import { runWithoutNormalizing } from './internal/runWithoutNormalizing';
import {
  defineEditorExtension,
  ElementApi,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
  TextApi,
} from '@platejs/slate';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from './BaseListPlugin';

import { normalizeListItem } from './normalizers/normalizeListItem';
import { normalizeNestedList } from './normalizers/normalizeNestedList';
import {
  getHighestEmptyList,
  getListItemEntry,
  getListRoot,
  getListTypes,
  getPreviousSiblingPath,
  getPropsIfTaskListLiNode,
  hasListChild,
  isAcrossListItems,
  isListNested,
  isListRoot,
} from './queries';
import {
  insertListItem,
  moveListItemsToList,
  moveListItemUp,
  removeFirstListItem,
  removeListItem,
  unwrapList,
} from './transforms';

type ListClassicExtensionOptions = {
  editor: SlateEditor;
  getOptions: () => ListConfig['options'];
};

type InsertFragmentNext = EditorTransformNext<{
  fragment: Descendant[];
  options?: Parameters<EditorUpdateTransaction['fragment']['insert']>[1];
}>;

const getElementChildren = (node: Element, path: Path): ElementEntry[] =>
  node.children.flatMap((child, index) =>
    ElementApi.isElement(child) ? [[child, path.concat(index)]] : []
  );

const getElementAtPath = (
  editor: SlateEditor,
  path: Path
): Element | undefined =>
  (
    'read' in editor && typeof editor.read === 'function'
      ? editor.read((state: EditorCoreStateView) => state.nodes.hasPath(path))
      : (
          editor.api as {
            hasPath?: (path: Path) => boolean;
          }
        ).hasPath?.(path)
  )
    ? editor.api.node<Element>(path)?.[0]
    : undefined;

const getLiStart = (editor: SlateEditor) => {
  const start = editor.api.start(editor.selection as Range);

  return editor.api.above({
    at: start,
    match: (node) => node.type === editor.getType(KEYS.li),
  });
};

const createFragmentRoot = (fragment: Descendant[]): Element => ({
  children: fragment,
  type: '__fragment__',
});

const toTextNode = (node: Descendant): Text => {
  if (TextApi.isText(node)) return node;

  const texts = Array.from(NodeApi.texts(node));

  if (texts.length === 1) return texts[0][0];

  return { text: NodeApi.string(node) };
};

const getFirstAncestorOfType = (
  root: Descendant,
  entry: DescendantEntry,
  type: string
): AncestorEntry => {
  let ancestor: Path = PathApi.parent(entry[1]);
  const getElement = (path: Path) => {
    const node = NodeApi.get(root, path);

    return ElementApi.isElement(node) ? node : undefined;
  };

  while (getElement(ancestor)?.type !== type) {
    ancestor = PathApi.parent(ancestor);
  }

  return [getElement(ancestor) as Ancestor, ancestor];
};

const findListItemsWithContent = (
  editor: SlateEditor,
  first: Descendant
): Descendant[] => {
  const listItemType = editor.getType(KEYS.li);
  const listItemContentType = editor.getType(KEYS.lic);
  let prev: Descendant | null = null;
  let node = first;

  while (
    isListRoot(editor, node) ||
    (node.type === listItemType &&
      (node.children as Element[])[0].type !== listItemContentType)
  ) {
    prev = node;
    [node] = node.children as Descendant[];
  }

  return prev ? (prev.children as Descendant[]) : [node];
};

const trimList = (editor: SlateEditor, listRoot: Descendant): Element[] => {
  const listItemType = editor.getType(KEYS.li);

  if (!isListRoot(editor, listRoot)) {
    return [listRoot as Element];
  }

  const textEntries = Array.from(NodeApi.texts(listRoot));

  const commonAncestorEntry = textEntries.reduce(
    (commonAncestor, textEntry): AncestorEntry => {
      if (PathApi.isAncestor(commonAncestor[1], textEntry[1])) {
        return commonAncestor;
      }

      const commonEntry = NodeApi.common(
        listRoot,
        textEntry[1],
        commonAncestor[1]
      );

      return ElementApi.isElement(commonEntry[0])
        ? (commonEntry as AncestorEntry)
        : commonAncestor;
    },
    getFirstAncestorOfType(listRoot, textEntries[0], listItemType)
  );

  const commonAncestor = commonAncestorEntry[0] as Descendant;
  const [first, ...rest] = isListRoot(editor, commonAncestor)
    ? (commonAncestor as Element).children
    : [commonAncestor];

  return [...findListItemsWithContent(editor, first), ...rest] as Element[];
};

const wrapNodeIntoListItem = (
  editor: SlateEditor,
  node: Descendant,
  props?: Record<string, unknown>
): Element =>
  node.type === editor.getType(KEYS.li)
    ? (node as Element)
    : ({
        children: [node],
        ...props,
        type: editor.getType(KEYS.li),
      } as Element);

const isSingleLic = (editor: SlateEditor, fragment: Descendant[]) => {
  const isFragmentOnlyListRoot =
    fragment.length === 1 && isListRoot(editor, fragment[0]);
  const fragmentRoot = createFragmentRoot(fragment);

  return (
    isFragmentOnlyListRoot &&
    [...NodeApi.nodes(fragmentRoot)]
      .filter((entry): entry is ElementEntry => ElementApi.isElement(entry[0]))
      .filter(([node]) => node.type === editor.getType(KEYS.lic)).length === 1
  );
};

const getTextAndListItemNodes = (
  editor: SlateEditor,
  tx: EditorUpdateTransaction,
  fragment: Descendant[],
  liEntry: ElementEntry,
  licEntry: ElementEntry
) => {
  const [, liPath] = liEntry;
  const [licNode, licPath] = licEntry;
  const isEmptyNode = !NodeApi.string(licNode);
  const [first, ...rest] = fragment
    .flatMap((node) => trimList(editor, node))
    .map((node) =>
      wrapNodeIntoListItem(
        editor,
        node,
        getPropsIfTaskListLiNode(editor, {
          inherit: true,
          liNode: liEntry[0],
        })
      )
    );
  let textNode: Text;
  let listItemNodes: Element[];

  if (isListRoot(editor, fragment[0])) {
    if (isSingleLic(editor, fragment)) {
      textNode = toTextNode(first);
      listItemNodes = rest as Element[];
    } else if (isEmptyNode) {
      const li = editor.api.node<Element>(liPath)?.[0];

      if (!li) {
        return { listItemNodes: rest as Element[], textNode: { text: '' } };
      }

      const [, ...currentSublists] = li.children as Element[];
      const [newLic, ...newSublists] = first.children as Element[];
      tx.nodes.insert(newLic, {
        at: PathApi.next(licPath),
        select: true,
      });
      tx.nodes.remove({
        at: licPath,
      });

      if (newSublists?.length) {
        if (currentSublists?.length) {
          tx.nodes.insert(newSublists[0].children as Element[], {
            at: [...liPath, 1, 0],
            select: true,
          });
        } else {
          tx.nodes.insert(newSublists, {
            at: PathApi.next(licPath),
            select: true,
          });
        }
      }

      textNode = { text: '' };
      listItemNodes = rest as Element[];
    } else {
      textNode = { text: '' };
      listItemNodes = [first as Element, ...(rest as Element[])];
    }
  } else {
    textNode = toTextNode(first);
    listItemNodes = rest as Element[];
  }

  return { listItemNodes, textNode };
};

const resetClassicListItem = (editor: SlateEditor, at: Path) => {
  unwrapList(editor, { at: at.concat(0) });

  return true;
};

const handleSelectionOutsideListDeleteForward = (
  editor: SlateEditor,
  tx: EditorUpdateTransaction
): boolean => {
  const pointAfterSelection = editor.api.after(editor.selection!.focus);

  if (!pointAfterSelection) return false;

  const nextSiblingListRes = getListItemEntry(editor, {
    at: pointAfterSelection,
  });

  if (!nextSiblingListRes) return false;

  const { listItem } = nextSiblingListRes;
  const parentBlockEntity = editor.api.block({
    at: editor.selection!.anchor,
  });

  if (!editor.api.string(parentBlockEntity![1])) {
    tx.nodes.remove();

    return true;
  }
  if (hasListChild(editor, listItem[0])) {
    const sublistRes = getListItemEntry(editor, {
      at: [...listItem[1], 1, 0, 0],
    });

    moveListItemUp(editor, sublistRes!);
  }

  return false;
};

const handleSelectionInListDeleteForward = (
  editor: SlateEditor,
  tx: EditorUpdateTransaction,
  res: { list: ElementEntry; listItem: ElementEntry },
  next: EditorTransformNext<{ unit: TextUnit }>,
  unit: TextUnit
): boolean => {
  const { listItem } = res;

  if (!hasListChild(editor, listItem[0])) {
    const liType = editor.getType(KEYS.li);
    const liWithSiblings = Array.from(
      editor.api.nodes({
        at: listItem[1],
        mode: 'lowest',
        match: (node, path) => {
          if (path.length === 0) return false;

          return (
            (node as Element).type === liType &&
            getElementAtPath(editor, PathApi.next(path))?.type === liType
          );
        },
      }),
      (entry) => entry[1]
    )[0];

    if (!liWithSiblings) {
      const pointAfterListItem = editor.api.after(listItem[1]);

      if (pointAfterListItem) {
        const nextSiblingListRes = getListItemEntry(editor, {
          at: pointAfterListItem,
        });

        if (nextSiblingListRes) {
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

    const siblingListItem = editor.api.node<Element>(
      PathApi.next(liWithSiblings)
    );

    if (!siblingListItem) return false;

    const siblingList = editor.api.parent<Element>(siblingListItem[1]);

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

    const nextSelectableLic = [
      ...editor.api.nodes<Element>({
        at: pointAfterListItem.path,
        mode: 'lowest',
        match: (node) => node.type === editor.getType(KEYS.lic),
      }),
    ][0];

    if (nextSelectableLic[0].children.length < 2) return false;

    next({ unit });

    const leftoverListItem = editor.api.node<Element>(
      PathApi.parent(nextSelectableLic[1])
    )!;

    if (leftoverListItem && leftoverListItem[0].children.length === 0) {
      tx.nodes.remove({ at: leftoverListItem[1] });
    }

    return true;
  }

  const nestedList = editor.api.node<Element>(
    PathApi.next([...listItem[1], 0])
  );

  if (!nestedList) return false;

  const [nestedListNode, nestedListPath] = nestedList;
  const firstNestedListChild = nestedListNode.children[0];

  if (!ElementApi.isElement(firstNestedListChild)) return false;

  const nestedListItem: ElementEntry = [
    firstNestedListChild,
    nestedListPath.concat([0]),
  ];

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

export const createListClassicExtension = ({
  editor,
  getOptions,
}: ListClassicExtensionOptions): EditorExtensionInput =>
  defineEditorExtension({
    name: 'plate:list-classic',
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;
        const liType = editor.getType(KEYS.li);
        const licType = editor.getType(KEYS.lic);
        const defaultType = editor.getType(KEYS.p);

        if (!ElementApi.isElement(node)) {
          next();
          return;
        }

        if (isListRoot(editor, node)) {
          const nestedListChild = getElementChildren(node, path).find(
            ([child, childPath]) =>
              getListTypes(editor).includes(child.type) &&
              normalizeNestedList(editor, {
                nestedListItem: [child, childPath],
                tx,
              })
          );

          if (nestedListChild) {
            return;
          }

          const nonLiChild = getElementChildren(node, path).find(
            ([child]) => child.type !== liType
          );

          if (nonLiChild) {
            tx.nodes.wrap(
              { children: [], type: liType },
              { at: nonLiChild[1] }
            );
            return;
          }

          if (node.type === editor.getType(KEYS.taskList)) {
            const nonTaskListItems = getElementChildren(node, path).filter(
              ([child]) => child.type === liType && !('checked' in child)
            );

            if (nonTaskListItems.length > 0) {
              nonTaskListItems.forEach(([, itemPath]) => {
                tx.nodes.set({ checked: false }, { at: itemPath });
              });
              return;
            }
          } else {
            const taskListItems = getElementChildren(node, path).filter(
              ([child]) => child.type === liType && 'checked' in child
            );

            if (taskListItems.length > 0) {
              taskListItems.forEach(([, itemPath]) => {
                tx.nodes.unset('checked', { at: itemPath });
              });
              return;
            }
          }
        }

        if (getListTypes(editor).includes(node.type)) {
          if (
            node.children.length === 0 ||
            !node.children.some((item) => item.type === liType)
          ) {
            tx.nodes.remove({ at: path });
            return;
          }

          const nextPath = PathApi.next(path);
          const nextNode = getElementAtPath(editor, nextPath);

          if (nextNode?.type === node.type) {
            moveListItemsToList(editor, {
              deleteFromList: true,
              fromList: [nextNode, nextPath],
              toList: [node, path],
            });
            return;
          }

          const prevPath = getPreviousSiblingPath(path);
          const prevNode = prevPath
            ? editor.api.node<Element>(prevPath)?.[0]
            : undefined;

          if (prevPath && prevNode?.type === node.type) {
            moveListItemsToList(editor, {
              deleteFromList: true,
              fromList: [node, path],
              toList: [prevNode, prevPath],
            });
            return;
          }
          if (
            normalizeNestedList(editor, { nestedListItem: [node, path], tx })
          ) {
            return;
          }
        }

        if (
          node.type === liType &&
          normalizeListItem(editor, {
            listItem: [node, path],
            validLiChildrenTypes: getOptions().validLiChildrenTypes,
          })
        ) {
          return;
        }

        if (
          node.type === licType &&
          licType !== defaultType &&
          editor.api.parent(path)?.[0].type !== liType
        ) {
          tx.nodes.set({ type: defaultType }, { at: path });
          return;
        }

        next();
      },
    },
    transforms: {
      deleteBackward({ next, tx, unit }) {
        const res = getListItemEntry(editor, {});
        let moved: boolean | undefined = false;

        if (res) {
          const { list, listItem } = res;
          const listItemStart = editor.selection
            ? editor.api.start(listItem[1])
            : undefined;
          const isAtListItemStart =
            !!editor.selection &&
            !!listItemStart &&
            RangeApi.isCollapsed(editor.selection) &&
            PointApi.equals(editor.selection.focus, listItemStart);

          if (isAtListItemStart) {
            runWithoutNormalizing(tx, () => {
              moved = removeFirstListItem(editor, { list, listItem });

              if (moved) return;

              moved = removeListItem(editor, { list, listItem });

              if (moved) return;
              if (
                !PathApi.hasPrevious(listItem[1]) &&
                !isListNested(editor, list[1])
              ) {
                moved = resetClassicListItem(editor, listItem[1]);
                return;
              }

              const pointBeforeListItem = editor.api.before(
                editor.selection!.focus
              );

              let currentLic: NodeEntry<Element> | undefined;
              let hasMultipleChildren = false;

              if (
                pointBeforeListItem &&
                isAcrossListItems(editor, {
                  anchor: editor.selection!.anchor,
                  focus: pointBeforeListItem,
                })
              ) {
                currentLic = [
                  ...editor.api.nodes<Element>({
                    at: listItem[1],
                    mode: 'lowest',
                    match: (node) => node.type === editor.getType(KEYS.lic),
                  }),
                ][0];
                hasMultipleChildren = currentLic[0].children.length > 1;
              }

              tx.text.delete({
                reverse: true,
                unit,
              });
              moved = true;

              if (!currentLic || !hasMultipleChildren) return;

              const leftoverListItem = editor.api.node<Element>(
                PathApi.parent(currentLic[1])
              )!;

              if (
                leftoverListItem &&
                leftoverListItem[0].children.length === 0
              ) {
                tx.nodes.remove({ at: leftoverListItem[1] });
              }
            });
          }
        }

        if (moved) return true;

        return next({ unit });
      },
      deleteForward({ next, tx, unit }) {
        let handled = false;

        if (!editor.selection || !editor.api.isAt({ end: true })) {
          return next({ unit });
        }

        runWithoutNormalizing(tx, () => {
          const res = getListItemEntry(editor, {});

          handled = res
            ? handleSelectionInListDeleteForward(editor, tx, res, next, unit)
            : handleSelectionOutsideListDeleteForward(editor, tx);
        });

        if (handled) return true;

        return next({ unit });
      },
      deleteFragment({ next, tx, options }) {
        let deleted = false;

        runWithoutNormalizing(tx, () => {
          if (!isAcrossListItems(editor)) return;

          const end = editor.api.end(editor.selection as Range);
          const liEnd = editor.api.above<Element>({
            at: end,
            match: (node) => node.type === editor.getType(KEYS.li),
          });
          const liEndCanBeDeleted = liEnd && !hasListChild(editor, liEnd[0]);
          const liEndPathRef = liEndCanBeDeleted
            ? editor.api.pathRef(liEnd![1])
            : undefined;

          if (!getLiStart(editor) || !liEnd) {
            deleted = false;
            return;
          }

          const liStartBeforeDelete = getLiStart(editor);
          let nestedEndTail = '';

          if (
            end &&
            liStartBeforeDelete &&
            PathApi.isAncestor(liStartBeforeDelete[1], liEnd[1])
          ) {
            const liEndEnd = editor.api.end(liEnd[1]);

            if (liEndEnd) {
              nestedEndTail = editor.api.string({
                anchor: end,
                focus: liEndEnd,
              } as Range);
            }
          }

          next({ options });

          const liStart = getLiStart(editor);

          if (nestedEndTail && liStart) {
            const licPath = liStart[1].concat(0);

            tx.text.insert(nestedEndTail, {
              at: editor.api.end(licPath),
            });
          }

          if (liEndPathRef) {
            const liEndPath = liEndPathRef.unref()!;
            const listStart = liStart && editor.api.parent(liStart[1]);

            const deletePath = getHighestEmptyList(editor, {
              diffListPath: listStart?.[1],
              liPath: liEndPath,
            });

            if (deletePath) {
              tx.nodes.remove({ at: deletePath });
            }

            deleted = true;
          }
        });

        if (deleted) return true;

        return next({ options });
      },
      insertBreak({ next }) {
        if (!editor.selection) return next();

        const res = getListItemEntry(editor, {});
        let moved: boolean | undefined;

        if (res) {
          const { list, listItem } = res;

          if (editor.api.isEmpty(editor.selection, { block: true })) {
            moved = moveListItemUp(editor, {
              list,
              listItem,
            });

            if (moved) return true;
          }
        }

        const block = editor.api.block({
          match: (node) => node.type === editor.getType(KEYS.li),
        });

        if (
          block &&
          editor.api.isEmpty(editor.selection, { block: true }) &&
          resetClassicListItem(editor, block[1])
        )
          return true;

        if (!moved && insertListItem(editor, getOptions())) return true;

        return next();
      },
      insertFragment({ fragment, next, options, tx }) {
        let liEntry = editor.api.node<Element>({
          match: (node) => node.type === editor.getType(KEYS.li),
          mode: 'lowest',
        });

        const delegate = (nextFragment: Descendant[] = fragment) =>
          next({
            fragment:
              isListRoot(editor, nextFragment[0]) && nextFragment === fragment
                ? [{ text: '' }, ...nextFragment]
                : nextFragment,
            options,
          } as Parameters<InsertFragmentNext>[0]);

        if (!liEntry) return delegate();

        if (!editor.api.isCollapsed()) {
          tx.fragment.delete();
        }

        liEntry = editor.api.node<Element>({
          match: (node) => node.type === editor.getType(KEYS.li),
          mode: 'lowest',
        });

        if (!liEntry) return delegate();

        const licEntry = editor.api.node<Element>({
          match: (node) => node.type === editor.getType(KEYS.lic),
          mode: 'lowest',
        });

        if (!licEntry) return delegate();

        const { listItemNodes, textNode } = getTextAndListItemNodes(
          editor,
          tx,
          fragment,
          liEntry,
          licEntry
        );

        next({ fragment: [textNode], options });
        tx.normalize({ force: true });

        tx.nodes.insert(listItemNodes, {
          at: PathApi.next(liEntry[1]),
          select: true,
        });

        return true;
      },
    },
  });
