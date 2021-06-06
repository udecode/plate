import {
  getChildren,
  insertEmptyElement,
  match,
  setNodes,
} from '@udecode/slate-plugins-common';
import {
  getSlatePluginType,
  SPEditor,
  TDescendant,
  TElement,
} from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from '@udecode/slate-plugins-paragraph/src';
import { Editor, NodeEntry, Path, Transforms } from 'slate';
import { ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from '../defaults';
import { ListNormalizerOptions } from '../types';

/**
 * If the list item has no child: insert an empty list item container.
 * Else: move the children that are not valid to the list item container.
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
    getSlatePluginType(editor, ELEMENT_LIC),
    ...validLiChildrenTypes,
  ];

  const [listItemNode, listItemPath] = nodeEntry;
  const firstChildPath: Path = listItemPath.concat([0]);
  const firstChild: TDescendant = listItemNode.children?.[0];

  if (!firstChild) {
    insertEmptyElement(editor, getSlatePluginType(editor, ELEMENT_LIC), {
      at: firstChildPath,
    });
    return true;
  }

  const children = getChildren(nodeEntry);

  const inlinePathRefs = children
    .filter(([child]) => !allValidLiChildrenTypes.includes(child.type))
    .map(([, childPath]) => Editor.pathRef(editor, childPath));

  // Ensure that all lists have a list item container as a first element
  // Convert pre-1.0 slate's default use of paragraph to lic
  if (firstChild.type === getSlatePluginType(editor, ELEMENT_PARAGRAPH)) {
    return setNodes<TElement>(editor, {
      type: getSlatePluginType(editor, ELEMENT_LIC),
    });
  }

  if (firstChild.type !== getSlatePluginType(editor, ELEMENT_LIC)) {
    insertEmptyElement(editor, getSlatePluginType(editor, ELEMENT_LIC), {
      at: firstChildPath,
    });
  }

  // fix accidental legacy normalization of lic > p > children => lic > children
  if (match(firstChild, { type: getSlatePluginType(editor, ELEMENT_LIC) })) {
    const listContainerChildPath: Path = firstChildPath.concat([0]);
    const listContainerChild: TDescendant = firstChild.children?.[0];
    if (
      listContainerChild.type === getSlatePluginType(editor, ELEMENT_PARAGRAPH)
    ) {
      const paragraphChildPath: Path = listContainerChildPath.concat([0]);
      Editor.withoutNormalizing(editor, () => {
        Transforms.liftNodes(editor, { at: paragraphChildPath });
        // FIXME: I think the at for the following is wrong
        Transforms.removeNodes(editor, { at: listContainerChildPath });
      });
    }
  }

  // Ensure that any text nodes under the list are inside the list item container
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
