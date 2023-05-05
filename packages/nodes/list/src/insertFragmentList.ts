import {
  findNode,
  getCommonNode,
  getNode,
  getNodes,
  getNodeString,
  getNodeTexts,
  getPlugin,
  insertElements,
  isElement,
  PlateEditor,
  removeNodes,
  TAncestor,
  TAncestorEntry,
  TDescendant,
  TDescendantEntry,
  TElement,
  TElementEntry,
  TText,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-common';
import { Path } from 'slate';
import { ELEMENT_LI } from './createListPlugin';
import { getListItemContentType, getListItemType, isListRoot } from './queries';

export const insertFragmentList = <V extends Value>(editor: PlateEditor<V>) => {
  const { insertFragment } = editor;

  const listItemPlugin = getPlugin<{}, V>(editor, ELEMENT_LI);
  const listItemType = getListItemType(editor);
  const listItemContentType = getListItemContentType(editor);

  const getFirstAncestorOfType = (
    root: TDescendant,
    entry: TDescendantEntry,
    { type }: WithPlatePlugin
  ): TAncestorEntry => {
    let ancestor: Path = Path.parent(entry[1]);
    while (getNode<TElement>(root, ancestor)!.type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [getNode<TAncestor>(root, ancestor)!, ancestor];
  };

  const findListItemsWithContent = (first: TDescendant): TDescendant[] => {
    let prev = null;
    let node = first;
    while (
      isListRoot(editor, node) ||
      (node.type === listItemType &&
        (node.children as TElement[])[0].type !== listItemContentType)
    ) {
      prev = node;
      [node] = node.children as TDescendant[];
    }

    return prev ? (prev.children as TDescendant[]) : [node];
  };

  /**
   * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
   *
   * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
   */
  const trimList = (listRoot: TDescendant): TElement[] => {
    if (!isListRoot(editor, listRoot)) {
      return [listRoot as TElement];
    }

    const _texts = getNodeTexts(listRoot);
    const textEntries = Array.from(_texts);

    const commonAncestorEntry = textEntries.reduce(
      (commonAncestor, textEntry) =>
        Path.isAncestor(commonAncestor[1], textEntry[1])
          ? commonAncestor
          : (getCommonNode(listRoot, textEntry[1], commonAncestor[1]) as any),
      // any list item would do, we grab the first one
      getFirstAncestorOfType(listRoot, textEntries[0], listItemPlugin as any)
    );

    const [first, ...rest] = isListRoot(
      editor,
      commonAncestorEntry[0] as TDescendant
    )
      ? (commonAncestorEntry[0] as any).children
      : [commonAncestorEntry[0]];
    return [...findListItemsWithContent(first), ...rest];
  };

  const wrapNodeIntoListItem = (node: TDescendant): TElement => {
    return node.type === listItemType
      ? (node as TElement)
      : ({
          type: listItemType,
          children: [node],
        } as TElement);
  };

  /**
   * Checks if the fragment only consists of a single LIC in which case it is considered the user's intention was to copy a text, not a list
   */
  const isSingleLic = (fragment: TDescendant[]) => {
    const isFragmentOnlyListRoot =
      fragment.length === 1 && isListRoot(editor, fragment[0]);

    return (
      isFragmentOnlyListRoot &&
      [...getNodes({ children: fragment } as any)]
        .filter((entry): entry is TElementEntry => isElement(entry[0]))
        .filter(([node]) => node.type === listItemContentType).length === 1
    );
  };

  const getTextAndListItemNodes = (
    fragment: TDescendant[],
    liEntry: TElementEntry,
    licEntry: TElementEntry
  ) => {
    const [, liPath] = liEntry;
    const [licNode, licPath] = licEntry;
    const isEmptyNode = !getNodeString(licNode);
    const [first, ...rest] = fragment
      .flatMap(trimList)
      .map(wrapNodeIntoListItem);
    let textNode: TText;
    let listItemNodes: TElement[];
    if (isListRoot(editor, fragment[0])) {
      if (isSingleLic(fragment)) {
        textNode = first as any;
        listItemNodes = rest as TElement[];
      } else if (isEmptyNode) {
        // FIXME: is there a more direct way to set this?
        const li = getNode(editor, liPath);
        const [, ...currentSublists] = li!.children as TElement[];
        const [newLic, ...newSublists] = first.children as TElement[];
        insertElements(editor, newLic, {
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
            insertElements(editor, newSublists[0].children as TElement[], {
              at: path,
              select: true,
            });
          } else {
            insertElements(editor, newSublists, {
              at: Path.next(licPath),
              select: true,
            });
          }
        }

        textNode = { text: '' };
        listItemNodes = rest as TElement[];
      } else {
        textNode = { text: '' };
        listItemNodes = [first as TElement, ...(rest as TElement[])];
      }
    } else {
      textNode = first as any;
      listItemNodes = rest as TElement[];
    }

    return { textNode, listItemNodes };
  };

  return (fragment: TDescendant[]) => {
    let liEntry = findNode<TElement>(editor, {
      match: { type: listItemType },
      mode: 'lowest',
    });
    // not inserting into a list item, delegate to other plugins
    if (!liEntry) {
      return insertFragment(
        isListRoot(editor, fragment[0]) ? [{ text: '' }, ...fragment] : fragment
      );
    }

    // delete selection (if necessary) so that it can check if needs to insert into an empty block
    insertFragment([{ text: '' }] as any);

    // refetch to find the currently selected LI after the deletion above is performed
    liEntry = findNode<TElement>(editor, {
      match: { type: listItemType },
      mode: 'lowest',
    });

    const licEntry = findNode<TElement>(editor, {
      match: { type: listItemContentType },
      mode: 'lowest',
    });
    if (!licEntry) {
      return insertFragment(
        isListRoot(editor, fragment[0]) ? [{ text: '' }, ...fragment] : fragment
      );
    }

    const { textNode, listItemNodes } = getTextAndListItemNodes(
      fragment,
      liEntry!,
      licEntry
    );

    insertFragment<TText>([textNode]); // insert text if needed

    const [, liPath] = liEntry!;

    return insertElements(editor, listItemNodes, {
      at: Path.next(liPath),
      select: true,
    });
  };
};
