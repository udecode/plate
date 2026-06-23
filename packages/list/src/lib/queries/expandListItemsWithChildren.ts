import type { Element, NodeEntry } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

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
export const expandListItemsWithChildren = <N extends Element = Element>(
  editor: BasePlateEditor,
  entries: NodeEntry<N>[]
): NodeEntry<N>[] => {
  const expandedEntries: NodeEntry<N>[] = [];
  const processedIds = new Set<string>();

  entries.forEach((entry) => {
    const [node] = entry;

    // Skip if already processed
    const nodeProps = node as Record<string, unknown>;

    if (processedIds.has(nodeProps.id as string)) return;

    expandedEntries.push(entry as NodeEntry<N>);
    processedIds.add(nodeProps.id as string);

    // Check if it's a list item
    const isListItem =
      isDefined((node as any)[KEYS.listType]) &&
      isDefined((node as any)[KEYS.indent]);

    if (isListItem) {
      // Get all children (items with bigger indent)
      const children = getListChildren<N>(editor, entry);

      // Add children that aren't already in the selection
      children.forEach((childEntry) => {
        const childProps = childEntry[0] as Record<string, unknown>;

        if (!processedIds.has(childProps.id as string)) {
          expandedEntries.push(childEntry);
          processedIds.add(childProps.id as string);
        }
      });
    }
  });

  return expandedEntries;
};
