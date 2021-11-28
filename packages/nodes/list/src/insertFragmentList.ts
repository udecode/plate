import {
  findNode,
  getPlugin,
  isCollapsed,
  PlateEditor,
  PlatePlugin,
  TDescendant,
} from '@udecode/plate-core';
import { Element, Node, NodeEntry, Path, Transforms } from 'slate';
import {
  getListItemContentType,
  getListItemType,
  getListTypes,
} from './queries/getListTypes';
import { ELEMENT_LI } from './createListPlugin';

export const insertFragmentList = (editor: PlateEditor) => {
  const { insertFragment } = editor;

  const listItemPlugin = getPlugin(editor, ELEMENT_LI);
  const listItemType = getListItemType(editor);
  const listItemContentType = getListItemContentType(editor);

  const isListRoot = (node: TDescendant): boolean =>
    getListTypes(editor).includes(node.type);

  const isList = (node: TDescendant): boolean =>
    [...getListTypes(editor), listItemType].includes(node.type);

  const getFirstAncestorOfType = (
    root: TDescendant,
    entry: NodeEntry,
    { type }: PlatePlugin
  ): NodeEntry<TDescendant> => {
    let ancestor: Path = Path.parent(entry[1]);
    while ((Node.get(root, ancestor) as TDescendant).type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [Node.get(root, ancestor), ancestor];
  };

  const findListItemsWithContent = <T extends TDescendant>(first: T): T[] => {
    let prev = null;
    let node = first;
    while (
      isListRoot(node) ||
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
    if (!isListRoot(listRoot)) {
      return [listRoot];
    }

    const textEntries = Array.from(Node.texts(listRoot));

    const commonAncestorEntry = textEntries.reduce<NodeEntry<TDescendant>>(
      (commonAncestor, textEntry) =>
        Path.isAncestor(commonAncestor[1], textEntry[1])
          ? commonAncestor
          : Node.common(listRoot, textEntry[1], commonAncestor[1]),
      // any list item would do, we grab the first one
      getFirstAncestorOfType(listRoot, textEntries[0], listItemPlugin)
    );

    const [first, ...rest] = isListRoot(commonAncestorEntry[0])
      ? commonAncestorEntry[0].children
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
    if (fragment.length !== 1 || !isListRoot(fragment[0])) return false;

    const root = fragment[0];
    // start at root path
    const queue: Path[] = [[]];
    let foundLic = false;
    while (queue.length) {
      const path = queue.shift()!;
      const node = Node.get(root, path);
      if (!Element.isElement(node)) {
        return false;
      }

      if (isList(node)) {
        const children = Array.from(Node.children(root, path)).map(
          ([, p]) => p
        );
        queue.push(...children);
      } else if ((node as TDescendant).type !== listItemContentType) {
        return false;
      } else if (!foundLic) {
        foundLic = true;
      } else {
        return false;
      }
    }

    return true;
  };

  const convertFragmentToList = (fragment: TDescendant[]) => {
    const trimmedFragment = fragment.flatMap((node) => trimList(node));

    if (trimmedFragment.every((node) => node.type === ELEMENT_LI)) {
      return trimmedFragment;
    }

    return trimmedFragment.map((node) => ({
      type: ELEMENT_LI,
      children: node.children ?? [node],
    }));
  };

  return (fragment: TDescendant[]) => {
    const liEntry = findNode(editor, {
      match: { type: listItemType },
      mode: 'lowest',
    });
    // not inserting into a list item, delegate to other plugins
    if (!liEntry) {
      return insertFragment(
        isListRoot(fragment[0]) ? [{ text: '' }, ...fragment] : fragment
      );
    }

    // delete selection (if necessary) so that it can check if needs to insert into an empty block
    Transforms.insertFragment(editor, [{ text: '' }]);

    const licEntry = findNode(editor, {
      match: { type: listItemContentType },
      mode: 'lowest',
    });
    if (!licEntry) {
      return insertFragment(
        isListRoot(fragment[0]) ? [{ text: '' }, ...fragment] : fragment
      );
    }

    const [, liPath] = liEntry!;
    const [licNode] = licEntry!;
    const isEmptyNode = isCollapsed(editor.selection) && !Node.string(licNode);
    const [first, ...rest] = fragment
      .flatMap(trimList)
      .map(wrapNodeIntoListItem);

    let nodes;
    let firstText;
    if (isListRoot(fragment[0])) {
      if (isSingleLic(fragment)) {
        firstText = first;
        nodes = rest;
      } else if (isEmptyNode) {
        // FIXME: is there a more direct way to set this?
        const li = Node.get(editor, liPath) as Element;
        const [, ...currentSublists] = li.children;
        const [newLic, ...newSublists] = first.children;
        // // it will set the LIC to the value of the item to be inserted,
        // // will keep the existing sublists (if any)
        // // and will insert the new sublists
        if (newSublists?.length && isListRoot(newSublists[0])) {
          if (currentSublists?.length && isListRoot(currentSublists[0])) {
            (currentSublists[0] as Element).children = [
              ...(currentSublists[0] as Element).children,
              ...(newSublists[0] as Element).children,
            ];

            li.children = [newLic, ...currentSublists];
          } else {
            li.children = [newLic, ...newSublists];
          }
        } else {
          li.children = [newLic, ...currentSublists];
        }

        firstText = { text: '' };
        nodes = rest;
      } else {
        firstText = { text: '' };
        nodes = [first, ...rest];
      }
    } else {
      firstText = first;
      nodes = rest;
    }
    Transforms.insertFragment(editor, [firstText]); // insert text if needed

    return Transforms.insertNodes(editor, nodes, {
      at: Path.next(liPath),
      select: true,
    });
  };
};
