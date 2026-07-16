import type { Editor, Element, NodeEntry } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import { isDefined } from '@udecode/utils';

import { getListChildren } from './getListChildren';

/**
 * Expands a list of blocks to include list item children. For each list item in
 * the input, adds all its children (items with bigger indent). Non-list blocks
 * are kept as-is. Requires id to be set on the blocks.
 *
 * @returns Array of block entries with list items expanded to include their
 *   children
 */
export const expandListItemsWithChildren = <N extends Element = Element>(
  editor: Editor,
  entries: NodeEntry<N>[]
): NodeEntry<N>[] => {
  const expandedEntries: NodeEntry<N>[] = [];
  const processedIds = new Set<string>();

  entries.forEach((entry) => {
    const [node] = entry;
    const id = typeof node.id === 'string' ? node.id : undefined;

    // Skip if already processed
    if (id && processedIds.has(id)) return;

    expandedEntries.push(entry);
    if (id) processedIds.add(id);

    // Check if it's a list item
    const isListItem =
      isDefined(node[KEYS.listType]) && isDefined(node[KEYS.indent]);

    if (isListItem) {
      // Get all children (items with bigger indent)
      const children = getListChildren<N>(editor, entry);

      // Add children that aren't already in the selection
      children.forEach((childEntry) => {
        const childId =
          typeof childEntry[0].id === 'string' ? childEntry[0].id : undefined;

        if (!childId || !processedIds.has(childId)) {
          expandedEntries.push(childEntry);
          if (childId) processedIds.add(childId);
        }
      });
    }
  });

  return expandedEntries;
};
