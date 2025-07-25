import type { Editor, ElementEntryOf, ElementOf, NodeEntry } from 'platejs';

import { isDefined, KEYS } from 'platejs';

import { getListChildren } from './getListChildren';

/**
 * Expands a list of blocks to include list item children. For each list item in
 * the input, adds all its children (items with bigger indent). Non-list blocks
 * are kept as-is. Requires id to be set on the blocks.
 *
 * @returns Array of block entries with list items expanded to include their
 *   children
 */
export const expandListItemsWithChildren = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  entries: ElementEntryOf<E>[]
): NodeEntry<N>[] => {
  const expandedEntries: NodeEntry<N>[] = [];
  const processedIds = new Set<string>();

  entries.forEach((entry) => {
    const [node] = entry;

    // Skip if already processed
    if (processedIds.has(node.id as string)) return;

    expandedEntries.push(entry as NodeEntry<N>);
    processedIds.add(node.id as string);

    // Check if it's a list item
    const isListItem =
      isDefined((node as any)[KEYS.listType]) &&
      isDefined((node as any)[KEYS.indent]);

    if (isListItem) {
      // Get all children (items with bigger indent)
      const children = getListChildren<N, E>(editor, entry);

      // Add children that aren't already in the selection
      children.forEach((childEntry) => {
        if (!processedIds.has(childEntry[0].id as string)) {
          expandedEntries.push(childEntry);
          processedIds.add(childEntry[0].id as string);
        }
      });
    }
  });

  return expandedEntries;
};
