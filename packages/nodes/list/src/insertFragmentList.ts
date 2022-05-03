import {
  findNode,
  getPlugin,
  isElement,
  PlateEditor,
  PlatePlugin,
  TDescendant,
  TElement,
  TNodeEntry,
  Value,
} from '@udecode/plate-core';
import { Element, Node, Path, Transforms } from 'slate';
import { ELEMENT_LI } from './createListPlugin';
import { getListItemContentType, getListItemType, isListRoot } from './queries';

export const insertFragmentList = <V extends Value>(editor: PlateEditor<V>) => {
  const { insertFragment } = editor;

  const listItemPlugin = getPlugin(editor, ELEMENT_LI);
  const listItemType = getListItemType(editor);
  const listItemContentType = getListItemContentType(editor);

  const getFirstAncestorOfType = (
    root: TDescendant,
    entry: TNodeEntry,
    { type }: PlatePlugin
  ): TNodeEntry<TDescendant> => {
    let ancestor: Path = Path.parent(entry[1]);
    while ((Node.get(root, ancestor) as TDescendant).type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [Node.get(root, ancestor) as TDescendant, ancestor];
  };

  const findListItemsWithContent = <T extends TDescendant>(first: T): T[] => {
    let prev = null;
    let node = first;
    while (
      isListRoot(editor, node) ||
      (node.type === listItemType &&
        node.children[0].type !== listItemContentType)
    ) {
      prev = node;
      [node] = node.children;
    }

    return prev ? prev.children : [node];
  };

  /**
   * Removes the "empty" leading lis. Empty in this context means lis only with other lis as children.
   *
   * @returns If argument is not a list root, returns it, otherwise returns ul[] or li[].
   */
  const trimList = <T extends TDescendant>(listRoot: T): T[] => {
    if (!isListRoot(editor, listRoot)) {
      return [listRoot];
    }

    const _texts = Node.texts(listRoot);
    const textEntries = Array.from(_texts);

    const commonAncestorEntry = textEntries.reduce<TNodeEntry>(
      (commonAncestor, textEntry) =>
        Path.isAncestor(commonAncestor[1], textEntry[1])
          ? commonAncestor
          : (Node.common(listRoot, textEntry[1], commonAncestor[1]) as any),
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

  const wrapNodeIntoListItem = (node: TDescendant): TDescendant => {
    return node.type === listItemType
      ? node
      : {
          type: listItemType,
          children: [node],
        };
  };

  /**
   * Checks if the fragment only consists of a single LIC in which case it is considered the user's intention was to copy a text, not a list
   */
  const isSingleLic = (fragment: TDescendant[]) => {
    const isFragmentOnlyListRoot =
      fragment.length === 1 && isListRoot(editor, fragment[0]);

    return (
      isFragmentOnlyListRoot &&
      [...Node.nodes({ children: fragment })]
        .filter((entry): entry is TNodeEntry<TElement> => isElement(entry[0]))
        .filter(([node]) => node.type === listItemContentType).length === 1
    );
  };

  const getTextAndListItemNodes = (
    fragment: TDescendant[],
    liEntry: TNodeEntry,
    licEntry: TNodeEntry
  ) => {
    const [, liPath] = liEntry;
    const [licNode, licPath] = licEntry;
    const isEmptyNode = !Node.string(licNode);
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
        const li = Node.get(editor, liPath) as Element;
        const [, ...currentSublists] = li.children;
        const [newLic, ...newSublists] = first.children;
        Transforms.insertNodes(editor, newLic, {
          at: Path.next(licPath),
          select: true,
        });
        Transforms.removeNodes(editor, {
          at: licPath,
        });
        if (newSublists?.length) {
          if (currentSublists?.length) {
            // TODO: any better way to compile the path where the LIs of the newly inserted element will be inserted?
            const path = [...liPath, 1, 0];
            Transforms.insertNodes(editor, newSublists[0].children, {
              at: path,
              select: true,
            });
          } else {
            Transforms.insertNodes(editor, newSublists, {
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

  return (_fragment: Node[]) => {
    const fragment = _fragment as TDescendant[];

    let liEntry = findNode(editor, {
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
    Transforms.insertFragment(editor, [{ text: '' }]);

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
      return insertFragment(
        isListRoot(editor, fragment[0]) ? [{ text: '' }, ...fragment] : fragment
      );
    }

    const { textNode, listItemNodes } = getTextAndListItemNodes(
      fragment,
      liEntry!,
      licEntry
    );

    Transforms.insertFragment(editor, [textNode]); // insert text if needed

    const [, liPath] = liEntry!;

    return Transforms.insertNodes(editor, listItemNodes, {
      at: Path.next(liPath),
      select: true,
    });
  };
};
