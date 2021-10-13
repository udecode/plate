import { findNode } from '@udecode/plate-common';
import {
  getPlatePluginOptions,
  PlatePluginOptions,
  SPEditor,
  TDescendant,
} from '@udecode/plate-core';
import { Node, NodeEntry, Path, Text, Transforms } from 'slate';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from './defaults';

export const getListInsertFragment = (editor: SPEditor) => {
  const { insertFragment } = editor;

  const li = getPlatePluginOptions(editor, ELEMENT_LI);
  const ul = getPlatePluginOptions(editor, ELEMENT_UL);
  const ol = getPlatePluginOptions(editor, ELEMENT_OL);

  const isListRoot = (node: TDescendant): boolean =>
    [ul.type, ol.type].includes(node.type);

  const getFirstAncestorOfType = (
    root: TDescendant,
    entry: NodeEntry,
    { type }: PlatePluginOptions
  ): NodeEntry<TDescendant> => {
    let ancestor: Path = Path.parent(entry[1]);
    while ((Node.get(root, ancestor) as TDescendant).type !== type) {
      ancestor = Path.parent(ancestor);
    }

    return [Node.get(root, ancestor), ancestor];
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
      getFirstAncestorOfType(listRoot, textEntries[0], li)
    );

    return isListRoot(commonAncestorEntry[0])
      ? commonAncestorEntry[0].children
      : [commonAncestorEntry[0]];
  };

  return (fragment: TDescendant[]) => {
    const liEntry = findNode(editor, {
      match: { type: li.type },
      mode: 'lowest',
    });

    if (liEntry && !Text.isTextList(fragment)) {
      const [, liPath] = liEntry;

      // FIXME: fork insertFragment for edge cases
      return Transforms.insertNodes(
        editor,
        fragment.flatMap((node) => trimList(node)),
        { at: Path.next(liPath), select: true }
      );
    }

    const filtered: TDescendant[] = isListRoot(fragment[0])
      ? [{ text: '' }, ...fragment]
      : fragment;

    return insertFragment(filtered);
  };
};
