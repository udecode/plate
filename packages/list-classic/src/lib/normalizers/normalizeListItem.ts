import type { BaseEditor } from '@platejs/core';
import {
  type Descendant,
  type ElementEntry,
  type NodeEntry,
  type PathRef,
  ElementApi,
  NodeApi,
  PathApi,
} from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig, ListTransaction } from '../BaseListPlugin';

import { getListTypes } from '../queries/index';
import { moveListItemUp } from '../transforms/index';

/**
 * Recursively get all the:
 *
 * - Block children
 * - Inline children except those at excludeDepth
 */
export const getDeepInlineChildren = (
  editor: BaseEditor,
  {
    children,
  }: {
    children: NodeEntry<Descendant>[];
  }
) => {
  const inlineChildren: NodeEntry<Descendant>[] = [];

  for (const child of children) {
    if (editor.read.nodes.isBlock(child[0])) {
      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: Array.from(NodeApi.children(editor, child[1])),
        })
      );
    } else {
      inlineChildren.push(child);
    }
  }

  return inlineChildren;
};

/**
 * If the list item has no child: insert an empty list item container. Else:
 * move the children that are not valid to the list item container.
 */
export const normalizeListItem = (
  editor: BaseEditor,
  tx: ListTransaction,
  {
    listItem,
    validLiChildrenTypes = [],
  }: { listItem: ElementEntry } & ListConfig['options']
) => {
  let changed = false;

  const allValidLiChildrenTypes = new Set([
    editor.getType(KEYS.lic),
    editor.getType(KEYS.olClassic),
    editor.getType(KEYS.taskList),
    editor.getType(KEYS.ulClassic),
    ...validLiChildrenTypes,
  ]);

  const [, liPath] = listItem;
  const liChildren = Array.from(NodeApi.children(editor, listItem[1]));

  // Get invalid (type) li children path refs to be moved
  const invalidLiChildrenPathRefs = liChildren
    .filter(
      ([child]) =>
        !ElementApi.isElement(child) || !allValidLiChildrenTypes.has(child.type)
    )
    .map(([, childPath]) => tx.refs.path(childPath));

  const firstLiChild = liChildren[0];
  const [firstLiChildNode, firstLiChildPath] = firstLiChild ?? [];

  // If li has no child or inline child, insert lic
  if (!firstLiChild || !editor.read.nodes.isBlock(firstLiChildNode)) {
    tx.nodes.insert(
      { children: [{ text: '' }], type: editor.getType(KEYS.lic) },
      {
        at: liPath.concat([0]),
      }
    );

    return true;
  }
  // If first li child is a block but not lic, set it to lic
  if (
    ElementApi.isElement(firstLiChildNode) &&
    editor.read.nodes.isBlock(firstLiChildNode) &&
    firstLiChildNode.type !== editor.getType(KEYS.lic)
  ) {
    if (getListTypes(editor).includes(firstLiChildNode.type)) {
      // the listItem has no lic so we move the children up a level
      const parent = editor.read.nodes.parent(listItem[1]);
      const sublist: ElementEntry = [firstLiChildNode, firstLiChildPath];
      const children = Array.from(NodeApi.children(editor, firstLiChild[1]))
        .filter((entry): entry is ElementEntry =>
          ElementApi.isElement(entry[0])
        )
        .reverse();
      children.forEach((c) => {
        moveListItemUp(editor, tx, {
          list: sublist,
          listItem: c,
        });
      });

      if (!parent) return false;

      tx.nodes.remove({ at: [...parent[1], 0] });

      return true;
    }
    // Allow block elements listed as valid li children types to be a first child instead of LIC
    if (validLiChildrenTypes.includes(firstLiChildNode.type)) {
      return true;
    }

    tx.nodes.set(
      {
        type: editor.getType(KEYS.lic),
      },
      {
        at: firstLiChildPath,
      }
    );

    changed = true;
  }

  const licChildren = Array.from(NodeApi.children(editor, firstLiChild[1]));

  if (licChildren.length > 0) {
    const blockPathRefs: PathRef[] = [];
    const inlineChildren: NodeEntry[] = [];

    // Check that lic has no block children
    for (const licChild of licChildren) {
      if (!editor.read.nodes.isBlock(licChild[0])) {
        break;
      }

      blockPathRefs.push(tx.refs.path(licChild[1]));

      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: Array.from(NodeApi.children(editor, licChild[1])),
        })
      );
    }

    const to = PathApi.next(licChildren.at(-1)![1]);

    // Move lic nested inline children to its children
    inlineChildren.reverse().forEach(([, path]) => {
      tx.nodes.move({
        at: path,
        to,
      });
    });

    // Remove lic block children
    blockPathRefs.forEach((pathRef) => {
      const path = pathRef.unref();

      if (path) {
        tx.nodes.remove({
          at: path,
        });
      }
    });

    if (blockPathRefs.length > 0) {
      changed = true;
    }
  }
  if (changed) return true;

  // Ensure that any text nodes under the list are inside the list item container
  invalidLiChildrenPathRefs.reverse().forEach((ref) => {
    const path = ref.unref();

    if (path) {
      tx.nodes.move({
        at: path,
        to: firstLiChildPath.concat([0]),
      });
    }
  });

  return invalidLiChildrenPathRefs.length > 0;
};
