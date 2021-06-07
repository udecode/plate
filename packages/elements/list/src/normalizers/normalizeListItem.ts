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
import { Editor, NodeEntry, Path, PathRef, Transforms } from 'slate';
import { ELEMENT_LIC, ELEMENT_OL, ELEMENT_UL } from '../defaults';
import { ListNormalizerOptions } from '../types';

/**
 * Recursively get all the:
 * - block children
 * - inline children except those at excludeDepth
 */
export const getDeepInlineChildren = (
  editor: SPEditor,
  {
    children,
  }: {
    children: NodeEntry<TDescendant>[];
  }
) => {
  const inlineChildren: NodeEntry<TDescendant>[] = [];

  for (const child of children) {
    if (Editor.isBlock(editor, child[0])) {
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
export const normalizeListItem = (
  editor: SPEditor,
  {
    listItem,
    validLiChildrenTypes = [],
  }: { listItem: NodeEntry<TElement> } & ListNormalizerOptions
) => {
  let changed = false;

  const allValidLiChildrenTypes = [
    getSlatePluginType(editor, ELEMENT_UL),
    getSlatePluginType(editor, ELEMENT_OL),
    getSlatePluginType(editor, ELEMENT_LIC),
    ...validLiChildrenTypes,
  ];

  const [, liPath] = listItem;
  const liChildren = getChildren(listItem);

  // Get invalid (type) li children path refs to be moved
  const invalidLiChildrenPathRefs = liChildren
    .filter(([child]) => !allValidLiChildrenTypes.includes(child.type))
    .map(([, childPath]) => Editor.pathRef(editor, childPath));

  const firstLiChild: NodeEntry<any> | undefined = liChildren[0];
  const [firstLiChildNode, firstLiChildPath] = firstLiChild;

  // If li has no child or inline child, insert lic
  if (!firstLiChild || !Editor.isBlock(editor, firstLiChildNode)) {
    insertEmptyElement(editor, getSlatePluginType(editor, ELEMENT_LIC), {
      at: liPath.concat([0]),
    });
    return true;
  }

  // If first li child is a block but not lic, set it to lic
  if (
    Editor.isBlock(editor, firstLiChildNode) &&
    !match(firstLiChildNode as any, {
      type: getSlatePluginType(editor, ELEMENT_LIC),
    })
  ) {
    setNodes<TElement>(editor, {
      type: getSlatePluginType(editor, ELEMENT_LIC),
    });
    changed = true;
  }

  const licChildren = getChildren(firstLiChild);

  if (licChildren.length) {
    Editor.withoutNormalizing(editor, () => {
      const blockPathRefs: PathRef[] = [];
      const inlineChildren: NodeEntry[] = [];

      // Check that lic has no block children
      for (const licChild of licChildren) {
        if (!Editor.isBlock(editor, licChild[0])) {
          break;
        }

        blockPathRefs.push(Editor.pathRef(editor, licChild[1]));

        inlineChildren.push(
          ...getDeepInlineChildren(editor, {
            children: getChildren(licChild),
          })
        );
      }

      const to = Path.next(licChildren[licChildren.length - 1]?.[1]);

      // Move lic nested inline children to its children
      inlineChildren.reverse().forEach(([, path]) => {
        Transforms.moveNodes(editor, {
          at: path,
          to,
        });
      });

      // Remove lic block children
      blockPathRefs.forEach((pathRef) => {
        const path = pathRef.unref();

        path &&
          Transforms.removeNodes(editor, {
            at: path,
          });
      });

      if (blockPathRefs.length) {
        changed = true;
      }
    });
  }

  if (changed) return true;

  // Ensure that any text nodes under the list are inside the list item container
  invalidLiChildrenPathRefs.reverse().forEach((ref) => {
    const path = ref.unref();

    path &&
      Transforms.moveNodes(editor, {
        at: path,
        to: firstLiChildPath.concat([0]),
      });
  });

  return !!invalidLiChildrenPathRefs.length;
};
