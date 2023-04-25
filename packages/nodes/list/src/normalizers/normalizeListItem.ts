import {
  createPathRef,
  getChildren,
  getParentNode,
  getPluginType,
  insertEmptyElement,
  isBlock,
  match,
  moveNodes,
  PlateEditor,
  removeNodes,
  setElements,
  TDescendant,
  TElement,
  TElementEntry,
  TNodeEntry,
  Value,
} from '@udecode/plate-common';
import { Path, PathRef } from 'slate';
import { ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from '../createListPlugin';
import { getListTypes } from '../queries';
import { moveListItemUp } from '../transforms';
import { ListPlugin } from '../types';

/**
 * Recursively get all the:
 * - block children
 * - inline children except those at excludeDepth
 */
export const getDeepInlineChildren = <V extends Value>(
  editor: PlateEditor<V>,
  {
    children,
  }: {
    children: TNodeEntry<TDescendant>[];
  }
) => {
  const inlineChildren: TNodeEntry<TDescendant>[] = [];

  for (const child of children) {
    if (isBlock(editor, child[0])) {
      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: getChildren(child),
        })
      );
    } else {
      inlineChildren.push(child);
    }
  }

  return inlineChildren;
};

/**
 * If the list item has no child: insert an empty list item container.
 * Else: move the children that are not valid to the list item container.
 */
export const normalizeListItem = <V extends Value>(
  editor: PlateEditor<V>,
  {
    listItem,
    validLiChildrenTypes = [],
  }: { listItem: TElementEntry } & ListPlugin
) => {
  let changed = false;

  const allValidLiChildrenTypes = [
    getPluginType(editor, ELEMENT_UL),
    getPluginType(editor, ELEMENT_OL),
    getPluginType(editor, ELEMENT_LIC),
    ...validLiChildrenTypes,
  ];

  const [, liPath] = listItem;
  const liChildren = getChildren<TElement>(listItem);

  // Get invalid (type) li children path refs to be moved
  const invalidLiChildrenPathRefs = liChildren
    .filter(([child]) => !allValidLiChildrenTypes.includes(child.type))
    .map(([, childPath]) => createPathRef(editor, childPath));

  const firstLiChild: TElementEntry | undefined = liChildren[0];
  const [firstLiChildNode, firstLiChildPath] = firstLiChild ?? [];

  // If li has no child or inline child, insert lic
  if (!firstLiChild || !isBlock(editor, firstLiChildNode)) {
    insertEmptyElement(editor, getPluginType(editor, ELEMENT_LIC), {
      at: liPath.concat([0]),
    });
    return true;
  }

  // If first li child is a block but not lic, set it to lic
  if (
    isBlock(editor, firstLiChildNode) &&
    !match(firstLiChildNode, [], {
      type: getPluginType(editor, ELEMENT_LIC),
    })
  ) {
    if (
      match(firstLiChildNode, [], {
        type: getListTypes(editor),
      })
    ) {
      // the listItem has no lic so we move the children up a level
      const parent = getParentNode(editor, listItem[1]);
      const sublist = firstLiChild;
      const children = getChildren<TElement>(firstLiChild).reverse();
      children.forEach((c) => {
        moveListItemUp(editor, {
          list: sublist,
          listItem: c,
        });
      });

      removeNodes(editor, { at: [...parent![1], 0] });

      return true;
    }

    // Allow block elements listed as valid li children types to be a first child instead of LIC
    if (validLiChildrenTypes.includes(firstLiChildNode.type)) {
      return true;
    }

    setElements(
      editor,
      {
        type: getPluginType(editor, ELEMENT_LIC),
      },
      {
        at: firstLiChildPath,
      }
    );

    changed = true;
  }

  const licChildren = getChildren(firstLiChild);

  if (licChildren.length) {
    const blockPathRefs: PathRef[] = [];
    const inlineChildren: TNodeEntry[] = [];

    // Check that lic has no block children
    for (const licChild of licChildren) {
      if (!isBlock(editor, licChild[0])) {
        break;
      }

      blockPathRefs.push(createPathRef(editor, licChild[1]));

      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: getChildren(licChild),
        })
      );
    }

    const to = Path.next(licChildren[licChildren.length - 1]?.[1]);

    // Move lic nested inline children to its children
    inlineChildren.reverse().forEach(([, path]) => {
      moveNodes(editor, {
        at: path,
        to,
      });
    });

    // Remove lic block children
    blockPathRefs.forEach((pathRef) => {
      const path = pathRef.unref();

      path &&
        removeNodes(editor, {
          at: path,
        });
    });

    if (blockPathRefs.length) {
      changed = true;
    }
  }

  if (changed) return true;

  // Ensure that any text nodes under the list are inside the list item container
  invalidLiChildrenPathRefs.reverse().forEach((ref) => {
    const path = ref.unref();

    path &&
      moveNodes(editor, {
        at: path,
        to: firstLiChildPath.concat([0]),
      });
  });

  return !!invalidLiChildrenPathRefs.length;
};
