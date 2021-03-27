import {
  ELEMENT_DEFAULT,
  getChildren,
  insertEmptyElement,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TDescendant,
  TElement,
} from '@udecode/slate-plugins-core';
import { Editor, NodeEntry, Path, Transforms } from 'slate';
import { ELEMENT_OL, ELEMENT_UL } from '../defaults';
import { ListNormalizerOptions } from '../types';

/**
 * If the list item has no child: insert an empty paragraph.
 * Else: move the children that are not valid to the paragraph.
 */
export const normalizeListItem = (
  editor: SPEditor,
  {
    nodeEntry,
    validLiChildrenTypes = [],
  }: { nodeEntry: NodeEntry<TElement> } & ListNormalizerOptions
) => {
  const allValidLiChildrenTypes = [
    getSlatePluginType(editor, ELEMENT_UL),
    getSlatePluginType(editor, ELEMENT_OL),
    getSlatePluginType(editor, ELEMENT_DEFAULT),
    ...validLiChildrenTypes,
  ];

  const [listItemNode, listItemPath] = nodeEntry;
  const firstChildPath: Path = listItemPath.concat([0]);
  const firstChild: TDescendant = listItemNode.children?.[0];

  if (!firstChild) {
    insertEmptyElement(editor, getSlatePluginType(editor, ELEMENT_DEFAULT), {
      at: firstChildPath,
    });
    return true;
  }

  const children = getChildren(nodeEntry);

  const inlinePathRefs = children
    .filter(([child]) => !allValidLiChildrenTypes.includes(child.type))
    .map(([, childPath]) => Editor.pathRef(editor, childPath));

  // Ensure that all lists have a <p> tag as a first element
  if (firstChild.type !== getSlatePluginType(editor, ELEMENT_DEFAULT)) {
    insertEmptyElement(editor, getSlatePluginType(editor, ELEMENT_DEFAULT), {
      at: firstChildPath,
    });
  }

  // Ensure that any text nodes under the list are inside the <p>
  for (const ref of inlinePathRefs.reverse()) {
    const path = ref.unref();

    if (path) {
      Transforms.moveNodes(editor, {
        at: path,
        to: firstChildPath.concat([0]),
      });
    }
  }

  return inlinePathRefs.length > 0;
};
