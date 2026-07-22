import type { BaseEditor, PlateEditorExtension } from '@platejs/core';
import {
  type Ancestor,
  ContentSlice,
  type Descendant,
  editorCommands,
  type Element,
  type ElementEntry,
  type NodeEntry,
  type Path,
  ElementApi,
  NodeApi,
  PathApi,
  PointApi,
  RangeApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListPluginOptions } from './BaseListPlugin';

import { getPropsIfTaskListLiNode, isListRoot } from './queries';

export const withInsertFragmentList = ({
  editor,
  plugin,
}: {
  editor: BaseEditor;
  plugin: { options: ListPluginOptions };
}): PlateEditorExtension => {
  const listItemType = editor.getType(KEYS.li);
  const listItemContentType = editor.getType(KEYS.lic);
  const validListItemContentTypes = new Set([
    listItemContentType,
    ...(plugin.options.validLiChildren ?? []).map(({ key }) =>
      editor.getType(key)
    ),
  ]);

  const prepareListRoot = (node: Element): Element => ({
    ...node,
    children: node.children.map((child) =>
      ElementApi.isElement(child) && child.type === listItemType
        ? prepareListItem(child)
        : child
    ),
  });

  const prepareListItem = (node: Element): Element => ({
    ...node,
    children: node.children.map((child) => {
      if (NodeApi.isText(child)) {
        return { children: [child], type: listItemContentType };
      }
      if (isListRoot(editor, child)) return prepareListRoot(child);
      if (validListItemContentTypes.has(child.type)) return child;

      return { children: child.children, type: listItemContentType };
    }),
  });

  const preparePastedNode = (node: Descendant): Descendant => {
    if (!ElementApi.isElement(node)) return node;
    if (node.type === listItemType) return prepareListItem(node);
    if (isListRoot(editor, node)) return prepareListRoot(node);

    return node;
  };

  const getFirstAncestorOfType = (
    root: Descendant,
    entry: NodeEntry<Descendant>,
    type: string
  ): NodeEntry<Ancestor> => {
    let ancestor: Path = PathApi.parent(entry[1]);

    while (true) {
      const node = NodeApi.get(root, ancestor);

      if (ElementApi.isElement(node) && node.type === type) break;
      ancestor = PathApi.parent(ancestor);
    }

    return [NodeApi.get(root, ancestor) as Ancestor, ancestor];
  };

  const findListItemsWithContent = (first: Descendant): Descendant[] => {
    let prev: Descendant | null = null;
    let node = first;

    while (
      isListRoot(editor, node) ||
      (ElementApi.isElement(node) &&
        node.type === listItemType &&
        (node.children as Element[])[0].type !== listItemContentType)
    ) {
      prev = node;
      [node] = node.children as Descendant[];
    }

    return prev ? (prev.children as Descendant[]) : [node];
  };

  /**
   * Removes the "empty" leading lis. Empty in this context means lis only with
   * other lis as children.
   *
   * @returns If argument is not a list root, returns it, otherwise returns ul[]
   *   or li[].
   */
  const trimList = (listRoot: Descendant): Element[] => {
    if (!isListRoot(editor, listRoot)) {
      return [listRoot as Element];
    }

    const _texts = NodeApi.texts(listRoot);
    const textEntries = Array.from(_texts);

    const commonAncestorEntry = textEntries.reduce(
      (commonAncestor, textEntry) =>
        PathApi.isAncestor(commonAncestor[1], textEntry[1])
          ? commonAncestor
          : (NodeApi.common(listRoot, textEntry[1], commonAncestor[1]) as any),
      // any list item would do, we grab the first one
      getFirstAncestorOfType(listRoot, textEntries[0], listItemType)
    );

    const [first, ...rest] = isListRoot(
      editor,
      commonAncestorEntry[0] as Descendant
    )
      ? (commonAncestorEntry[0] as any).children
      : [commonAncestorEntry[0]];

    return [...findListItemsWithContent(first), ...rest];
  };

  const wrapNodeIntoListItem = (
    node: Descendant,
    props?: Record<string, any>
  ): Element => {
    if (ElementApi.isElement(node) && node.type === listItemType) {
      return prepareListItem(node);
    }

    const child =
      NodeApi.isText(node) ||
      (ElementApi.isElement(node) &&
        !isListRoot(editor, node) &&
        !validListItemContentTypes.has(node.type))
        ? {
            children: NodeApi.isText(node) ? [node] : node.children,
            type: listItemContentType,
          }
        : node;

    return {
      children: [child],
      ...props,
      type: listItemType,
    } as Element;
  };

  const sliceElementAtPoint = (
    element: Element,
    relativePath: Path,
    offset: number,
    side: 'after' | 'before'
  ): Element => {
    const sliceNode = (node: Descendant, path: Path): Descendant => {
      if (NodeApi.isText(node)) {
        return {
          ...node,
          text:
            side === 'before'
              ? node.text.slice(0, offset)
              : node.text.slice(offset),
        };
      }

      const [index, ...rest] = path;

      if (index === undefined) return structuredClone(node);

      const edgeChild = sliceNode(node.children[index] as Descendant, rest);
      const children =
        side === 'before'
          ? [...node.children.slice(0, index), edgeChild]
          : [edgeChild, ...node.children.slice(index + 1)];

      return { ...node, children } as Element;
    };

    return sliceNode(element, relativePath) as Element;
  };

  /**
   * Checks if the fragment only consists of a single LIC in which case it is
   * considered the user's intention was to copy a text, not a list
   */
  const isSingleLic = (fragment: Descendant[]) => {
    const isFragmentOnlyListRoot =
      fragment.length === 1 && isListRoot(editor, fragment[0]);

    return (
      isFragmentOnlyListRoot &&
      [...NodeApi.nodes({ children: fragment } as any)]
        .filter((entry): entry is ElementEntry =>
          ElementApi.isElement(entry[0])
        )
        .filter(([node]) => node.type === listItemContentType).length === 1
    );
  };

  const getTextAndListItemNodes = (
    fragment: Descendant[],
    liEntry: NodeEntry<Element>,
    isEmptyNode: boolean
  ) => {
    const [first, ...rest] = fragment.flatMap(trimList).map((v) =>
      wrapNodeIntoListItem(
        v,
        getPropsIfTaskListLiNode(editor, {
          inherit: true,
          liNode: liEntry[0],
        })
      )
    );
    let sublists: Element[] = [];
    let textNodes: Descendant[];
    let listItemNodes: Element[];

    if (isListRoot(editor, fragment[0])) {
      if (isSingleLic(fragment)) {
        textNodes = (first.children[0] as Element).children as Descendant[];
        listItemNodes = rest as Element[];
      } else if (isEmptyNode) {
        const [newLic, ...newSublists] = first.children as Element[];
        sublists = newSublists;
        textNodes = newLic.children as Descendant[];
        listItemNodes = rest as Element[];
      } else {
        textNodes = [{ text: '' }];
        listItemNodes = [first as Element, ...(rest as Element[])];
      }
    } else {
      textNodes = (first.children[0] as Element).children as Descendant[];
      listItemNodes = rest as Element[];
    }

    return { listItemNodes, sublists, textNodes };
  };

  return {
    commands: ({ around }) => [
      around(editorCommands.replaceSlice, ({ input, state, next }) => {
        const { slice } = input;
        const fragment = [...slice.content].map(preparePastedNode);
        const selection = state.selection();
        const insertionPoint = selection
          ? RangeApi.edges(selection)[0]
          : undefined;
        const liEntry = state.nodes.above<Element>({
          at: insertionPoint,
          match: { type: listItemType },
          mode: 'lowest',
        });

        // not inserting into a list item, delegate to other plugins
        if (!liEntry) return next();

        if (
          selection &&
          RangeApi.isExpanded(selection) &&
          isListRoot(editor, fragment[0])
        ) {
          const [start, end] = RangeApi.edges(selection);
          const startLi = state.nodes.above<Element>({
            at: start,
            match: { type: listItemType },
            mode: 'lowest',
          });
          const endLi = state.nodes.above<Element>({
            at: end,
            match: { type: listItemType },
            mode: 'lowest',
          });
          const startList = startLi
            ? state.nodes.parent<Element>(startLi[1])
            : undefined;

          if (
            startLi &&
            endLi &&
            startList &&
            startLi[1].at(-1) !== endLi[1].at(-1) &&
            PathApi.equals(startList[1], PathApi.parent(endLi[1]))
          ) {
            const prefix = sliceElementAtPoint(
              startLi[0],
              start.path.slice(startLi[1].length),
              start.offset,
              'before'
            );
            const suffix = sliceElementAtPoint(
              endLi[0],
              end.path.slice(endLi[1].length),
              end.offset,
              'after'
            );
            const pastedItems = fragment.flatMap(trimList);
            const replacements = [
              ...(NodeApi.string(prefix) ? [prefix] : []),
              ...pastedItems,
              ...(NodeApi.string(suffix) ? [suffix] : []),
            ];
            const pastedEndIndex =
              startLi[1].at(-1)! +
              (NodeApi.string(prefix) ? 1 : 0) +
              pastedItems.length -
              1;
            const [lastText, lastPath] = NodeApi.last(pastedItems.at(-1)!, []);
            const point = {
              offset: NodeApi.string(lastText).length,
              path: [...startList[1], pastedEndIndex, ...lastPath],
            };

            return state.transaction((tx) => {
              tx.nodes.replaceChildren(replacements, {
                at: startList[1],
                count: endLi[1].at(-1)! - startLi[1].at(-1)! + 1,
                index: startLi[1].at(-1)!,
                newSelection: { kind: 'text', anchor: point, focus: point },
              });
            });
          }
        }

        const licEntry = state.nodes.above<Element>({
          at: insertionPoint,
          match: { type: listItemContentType },
          mode: 'lowest',
        });

        if (!licEntry) return next();

        const licStart = state.points.start(licEntry[1]);
        const licEnd = state.points.end(licEntry[1]);
        const [selectionStart, selectionEnd] = selection
          ? RangeApi.edges(selection)
          : [];
        const isEmptyNode =
          !NodeApi.string(licEntry[0]) ||
          (!!licStart &&
            !!licEnd &&
            !!selectionStart &&
            !!selectionEnd &&
            PointApi.compare(selectionStart, licStart) <= 0 &&
            PointApi.compare(selectionEnd, licEnd) >= 0);
        const { listItemNodes, sublists, textNodes } = getTextAndListItemNodes(
          fragment,
          liEntry!,
          isEmptyNode
        );
        const continuation = {
          ...input,
          slice: ContentSlice.withContent(slice, textNodes, {
            open: 'closed',
          }),
        };
        const delegated =
          selection &&
          RangeApi.isExpanded(selection) &&
          !isListRoot(editor, fragment[0])
            ? next.after(
                state.transaction((tx) => {
                  tx.fragment.delete();
                }),
                continuation
              )
            : next(continuation);

        if (delegated === false) return false;

        return state.transaction.extend(delegated, (tx) => {
          const nextLiEntry = tx.nodes.get<Element>(liEntry[1]);

          if (!nextLiEntry) return;

          const [, liPath] = nextLiEntry;

          if (sublists.length > 0) {
            const li = tx.nodes.get<Element>(liPath)?.[0];
            const currentSublist = li?.children[1];

            if (ElementApi.isElement(currentSublist)) {
              tx.nodes.insert(sublists[0].children as Element[], {
                at: [...liPath, 1, 0],
                select: true,
              });
            } else {
              tx.nodes.insert(sublists, {
                at: [...liPath, 1],
                select: true,
              });
            }
          }

          tx.nodes.insert(listItemNodes, {
            at: PathApi.next(liPath),
            select: true,
          });
        });
      }),
    ],
  };
};
