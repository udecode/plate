import {
  type Ancestor,
  type AncestorEntry,
  type Descendant,
  type DescendantEntry,
  type ElementEntry,
  type OverrideEditor,
  type Path,
  type TElement,
  type TText,
  ElementApi,
  NodeApi,
  PathApi,
} from '@udecode/plate';

import {
  type ListConfig,
  BaseListItemContentPlugin,
  BaseListItemPlugin,
} from './BaseListPlugin';
import { isListRoot } from './queries';

export const withInsertFragmentList: OverrideEditor<ListConfig> = ({
  editor,
  tf: { insertFragment },
}) => {
  const listItemType = editor.getType(BaseListItemPlugin);
  const listItemContentType = editor.getType(BaseListItemContentPlugin);

  const getFirstAncestorOfType = (
    root: Descendant,
    entry: DescendantEntry,
    type: string
  ): AncestorEntry => {
    let ancestor: Path = PathApi.parent(entry[1]);

    while (NodeApi.get<TElement>(root, ancestor)!.type !== type) {
      ancestor = PathApi.parent(ancestor);
    }

    return [NodeApi.get<Ancestor>(root, ancestor)!, ancestor];
  };

  const findListItemsWithContent = (first: Descendant): Descendant[] => {
    let prev = null;
    let node = first;

    while (
      isListRoot(editor, node) ||
      (node.type === listItemType &&
        (node.children as TElement[])[0].type !== listItemContentType)
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
  const trimList = (listRoot: Descendant): TElement[] => {
    if (!isListRoot(editor, listRoot)) {
      return [listRoot as TElement];
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

  const wrapNodeIntoListItem = (node: Descendant): TElement => {
    return node.type === listItemType
      ? (node as TElement)
      : ({
          children: [node],
          type: listItemType,
        } as TElement);
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
    liEntry: ElementEntry,
    licEntry: ElementEntry
  ) => {
    const [, liPath] = liEntry;
    const [licNode, licPath] = licEntry;
    const isEmptyNode = !NodeApi.string(licNode);
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
        const li = NodeApi.get(editor, liPath);
        const [, ...currentSublists] = li!.children as TElement[];
        const [newLic, ...newSublists] = first.children as TElement[];
        editor.tf.insertNodes(newLic, {
          at: PathApi.next(licPath),
          select: true,
        });
        editor.tf.removeNodes({
          at: licPath,
        });

        if (newSublists?.length) {
          if (currentSublists?.length) {
            // TODO: any better way to compile the path where the LIs of the newly inserted element will be inserted?
            const path = [...liPath, 1, 0];
            editor.tf.insertNodes(newSublists[0].children as TElement[], {
              at: path,
              select: true,
            });
          } else {
            editor.tf.insertNodes(newSublists, {
              at: PathApi.next(licPath),
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

    return { listItemNodes, textNode };
  };

  return {
    transforms: {
      insertFragment(fragment) {
        let liEntry = editor.api.node<TElement>({
          match: { type: listItemType },
          mode: 'lowest',
        });

        // not inserting into a list item, delegate to other plugins
        if (!liEntry) {
          return insertFragment(
            isListRoot(editor, fragment[0])
              ? [{ text: '' }, ...fragment]
              : fragment
          );
        }

        // delete selection (if necessary) so that it can check if needs to insert into an empty block
        insertFragment([{ text: '' }] as any);

        // refetch to find the currently selected LI after the deletion above is performed
        liEntry = editor.api.node<TElement>({
          match: { type: listItemType },
          mode: 'lowest',
        });

        // Check again if liEntry is undefined after the deletion above.
        // This prevents unexpected behavior when pasting while a list is highlighted
        if (!liEntry) {
          return insertFragment(
            isListRoot(editor, fragment[0])
              ? [{ text: '' }, ...fragment]
              : fragment
          );
        }

        const licEntry = editor.api.node<TElement>({
          match: { type: listItemContentType },
          mode: 'lowest',
        });

        if (!licEntry) {
          return insertFragment(
            isListRoot(editor, fragment[0])
              ? [{ text: '' }, ...fragment]
              : fragment
          );
        }

        const { listItemNodes, textNode } = getTextAndListItemNodes(
          fragment,
          liEntry!,
          licEntry
        );

        insertFragment<TText>([textNode]); // insert text if needed

        const [, liPath] = liEntry!;

        return editor.tf.insertNodes(listItemNodes, {
          at: PathApi.next(liPath),
          select: true,
        });
      },
    },
  };
};
