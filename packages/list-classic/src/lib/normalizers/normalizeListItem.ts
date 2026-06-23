import type { BasePlateEditor } from '@platejs/core';
import type {
  Descendant,
  Element,
  ElementEntry,
  NodeEntry,
  Path,
  PathRef,
} from '@platejs/plite';
import { ElementApi, PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type { ListConfig } from '../BaseListPlugin';

import { getListTypes } from '../queries/index';
import { moveListItemUp } from '../transforms/index';

const getChildEntries = (node: Element, path: Path): NodeEntry<Descendant>[] =>
  node.children.map((child, index) => [child, path.concat(index)]);

/**
 * Recursively get all the:
 *
 * - Block children
 * - Inline children except those at excludeDepth
 */
export const getDeepInlineChildren = (
  editor: BasePlateEditor,
  {
    children,
  }: {
    children: NodeEntry<Descendant>[];
  }
) => {
  const inlineChildren: NodeEntry<Descendant>[] = [];

  for (const child of children) {
    if (ElementApi.isElement(child[0]) && editor.api.isBlock(child[0])) {
      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: getChildEntries(child[0], child[1]),
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
  editor: BasePlateEditor,
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
  const liChildren = getChildEntries(listItem[0], listItem[1]);

  // Get invalid (type) li children path refs to be moved
  const invalidLiChildrenPathRefs = liChildren
    .filter(
      ([child]) =>
        !ElementApi.isElement(child) || !allValidLiChildrenTypes.has(child.type)
    )
    .map(([, childPath]) => editor.api.pathRef(childPath));

  const firstLiChild = liChildren[0];

  // If li has no child or inline child, insert lic
  if (!firstLiChild || !editor.api.isBlock(firstLiChild[0])) {
    editor.update((tx) => {
      tx.nodes.insert(
        editor.api.create.block({
          type: editor.getType(KEYS.lic),
        }),
        {
          at: liPath.concat([0]),
        }
      );
    });

    return true;
  }

  const [firstLiChildNode, firstLiChildPath] = firstLiChild;

  // If first li child is a block but not lic, set it to lic
  if (
    ElementApi.isElement(firstLiChildNode) &&
    editor.api.isBlock(firstLiChildNode) &&
    firstLiChildNode.type !== editor.getType(KEYS.lic)
  ) {
    if (getListTypes(editor).includes(firstLiChildNode.type)) {
      // the listItem has no lic so we move the children up a level
      const parent = editor.api.parent(listItem[1]);
      const sublist: ElementEntry = [firstLiChildNode, firstLiChildPath];
      const children = getChildEntries(firstLiChildNode, firstLiChildPath)
        .filter((entry): entry is ElementEntry =>
          ElementApi.isElement(entry[0])
        )
        .reverse();

      children.forEach((c) => {
        moveListItemUp(editor, {
          list: sublist,
          listItem: c,
        });
      });

      editor.update((tx) => {
        tx.nodes.remove({ at: [...parent![1], 0] });
      });

      return true;
    }
    // Allow block elements listed as valid li children types to be a first child instead of LIC
    if (validLiChildrenTypes.includes(firstLiChildNode.type)) {
      return true;
    }

    editor.update((tx) => {
      tx.nodes.set(
        {
          type: editor.getType(KEYS.lic),
        },
        {
          at: firstLiChildPath,
        }
      );
    });

    changed = true;
  }

  const licChildren = ElementApi.isElement(firstLiChildNode)
    ? getChildEntries(firstLiChildNode, firstLiChildPath)
    : [];

  if (licChildren.length > 0) {
    const blockPathRefs: PathRef[] = [];
    const inlineChildren: NodeEntry<Descendant>[] = [];

    // Check that lic has no block children
    for (const licChild of licChildren) {
      if (
        !ElementApi.isElement(licChild[0]) ||
        !editor.api.isBlock(licChild[0])
      ) {
        break;
      }

      blockPathRefs.push(editor.api.pathRef(licChild[1]));

      inlineChildren.push(
        ...getDeepInlineChildren(editor, {
          children: ElementApi.isElement(licChild[0])
            ? getChildEntries(licChild[0], licChild[1])
            : [],
        })
      );
    }

    const to = PathApi.next(licChildren.at(-1)![1]);

    // Move lic nested inline children to its children
    inlineChildren.reverse().forEach(([, path]) => {
      editor.update((tx) => {
        tx.nodes.move({
          at: path,
          to,
        });
      });
    });

    // Remove lic block children
    blockPathRefs.forEach((pathRef) => {
      const path = pathRef.unref();

      if (path) {
        editor.update((tx) => {
          tx.nodes.remove({
            at: path,
          });
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
      editor.update((tx) => {
        tx.nodes.move({
          at: path,
          to: firstLiChildPath.concat([0]),
        });
      });
    }
  });

  return invalidLiChildrenPathRefs.length > 0;
};
