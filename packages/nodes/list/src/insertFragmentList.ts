import {
  AncestorOf,
  DescendantOf,
  EDescendant,
  EText,
  findNode,
  getCommonNode,
  getNodeNode,
  getNodeNodes,
  getNodeString,
  getNodeTexts,
  getPlugin,
  insertFragment,
  insertNodes,
  isElement,
  PlateEditor,
  PlatePlugin,
  removeNodes,
  TAncestorEntry,
  TDescendant,
  TElement,
  TNode,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { Node, Path } from 'slate';
import { ELEMENT_LI } from './createListPlugin';
import { getListItemContentType, getListItemType, isListRoot } from './queries';

export const insertFragmentList = <V extends Value>(editor: PlateEditor<V>) => {
  const { insertFragment: _insertFragment } = editor;

  const listItemPlugin = getPlugin(editor, ELEMENT_LI);
  const listItemType = getListItemType(editor);
  const listItemContentType = getListItemContentType(editor);

  const getFirstAncestorOfType = <N extends TDescendant>(
    root: TNode,
    entry: TNodeEntry<N>,
    { type }: PlatePlugin<V>
  ): TAncestorEntry<N> => {
    let ancestor: Path = Path.parent(entry[1]);
    while ((getNodeNode(root, ancestor) as TDescendant).type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [getNodeNode(root, ancestor) as AncestorOf<N>, ancestor];
  };

  const findListItemsWithContent = <N extends TDescendant>(first: N) => {
    let prev = null;
    let node: N | DescendantOf<N> = first;
    while (
      isListRoot(editor, node) ||
      (node.type === listItemType &&
        (node.children as DescendantOf<N>[])[0].type !== listItemContentType)
    ) {
      prev = node;
      [node] = node.children as DescendantOf<N>[];
    }

    return (prev ? prev.children : [node]) as DescendantOf<N>[];
  };

  /**
   * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
   *
   * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
   */
  const trimList = <N extends TDescendant>(listRoot: N): N[] => {
    if (!isListRoot(editor, listRoot)) {
      return [listRoot];
    }

    const _texts = getNodeTexts(listRoot);
    const textEntries = Array.from(_texts);

    const commonAncestorEntry = textEntries.reduce(
      (commonAncestor, textEntry) =>
        Path.isAncestor(commonAncestor[1], textEntry[1])
          ? commonAncestor
          : (getCommonNode(listRoot, textEntry[1], commonAncestor[1]) as any),
      // any list item would do, we grab the first one
      getFirstAncestorOfType(listRoot, textEntries[0], listItemPlugin)
    );

    const [first, ...rest] = isListRoot(
      editor,
      commonAncestorEntry[0] as TDescendant
    )
      ? (commonAncestorEntry[0] as any).children
      : [commonAncestorEntry[0]];
    return [...findListItemsWithContent(first), ...rest];
  };

  const wrapNodeIntoListItem = <N extends TDescendant>(node: N) => {
    return node.type === listItemType
      ? node
      : ({
          type: listItemType,
          children: [node],
        } as N);
  };

  /**
   * Checks if the fragment only consists of a single LIC in which case it is considered the user's intention was to copy a text, not a list
   */
  const isSingleLic = (fragment: TDescendant[]) => {
    const isFragmentOnlyListRoot =
      fragment.length === 1 && isListRoot(editor, fragment[0]);

    return (
      isFragmentOnlyListRoot &&
      [...getNodeNodes({ children: fragment })]
        .filter((entry): entry is TNodeEntry<TElement> => isElement(entry[0]))
        .filter(([node]) => node.type === listItemContentType).length === 1
    );
  };

  const getTextAndListItemNodes = <D extends TDescendant, N extends TNode>(
    fragment: D[],
    liEntry: TNodeEntry<N>,
    licEntry: TNodeEntry<N>
  ) => {
    const [, liPath] = liEntry;
    const [licNode, licPath] = licEntry;
    const isEmptyNode = !getNodeString(licNode);
    const [first, ...rest] = fragment
      .flatMap(trimList)
      .map(wrapNodeIntoListItem);
    let textNode;
    let listItemNodes;
    if (isListRoot(editor, fragment[0])) {
      if (isSingleLic(fragment)) {
        textNode = first;
        listItemNodes = rest;
      } else if (isEmptyNode) {
        // FIXME: is there a more direct way to set this?
        const li = getNodeNode(editor, liPath);
        const [, ...currentSublists] = li!.children as DescendantOf<D>[];
        const [newLic, ...newSublists] = first.children as DescendantOf<D>[];
        insertNodes(editor, newLic as EDescendant<V>, {
          at: Path.next(licPath),
          select: true,
        });
        removeNodes(editor, {
          at: licPath,
        });
        if (newSublists?.length) {
          if (currentSublists?.length) {
            // TODO: any better way to compile the path where the LIs of the newly inserted element will be inserted?
            const path = [...liPath, 1, 0];
            insertNodes(editor, newSublists[0].children as EDescendant<V>[], {
              at: path,
              select: true,
            });
          } else {
            insertNodes(editor, newSublists as EDescendant<V>[], {
              at: Path.next(licPath),
              select: true,
            });
          }
        }

        textNode = { text: '' };
        listItemNodes = rest;
      } else {
        textNode = { text: '' };
        listItemNodes = [first, ...rest];
      }
    } else {
      textNode = first;
      listItemNodes = rest;
    }

    return { textNode, listItemNodes };
  };

  return (fragment: EDescendant<V>[]) => {
    let liEntry = findNode(editor, {
      match: { type: listItemType },
      mode: 'lowest',
    });
    // not inserting into a list item, delegate to other plugins
    if (!liEntry) {
      return _insertFragment(
        isListRoot(editor, fragment[0])
          ? [{ text: '' } as EText<V>, ...fragment]
          : fragment
      );
    }

    // delete selection (if necessary) so that it can check if needs to insert into an empty block
    insertFragment(editor, [{ text: '' } as EText<V>]);

    // refetch to find the currently selected LI after the deletion above is performed
    liEntry = findNode(editor, {
      match: { type: listItemType },
      mode: 'lowest',
    });

    const licEntry = findNode(editor, {
      match: { type: listItemContentType },
      mode: 'lowest',
    });
    if (!licEntry) {
      return _insertFragment(
        isListRoot(editor, fragment[0])
          ? [{ text: '' } as EText<V>, ...fragment]
          : fragment
      );
    }

    const { textNode, listItemNodes } = getTextAndListItemNodes(
      fragment,
      liEntry!,
      licEntry
    );

    insertFragment(editor, [textNode as EText<V>]); // insert text if needed

    const [, liPath] = liEntry!;

    return insertNodes(editor, listItemNodes as EDescendant<V>[], {
      at: Path.next(liPath),
      select: true,
    });
  };
};
