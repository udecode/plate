import {
  type PlateEditor,
  getPoint,
  getPointAfter,
} from '@udecode/plate-common/server';
import { Path } from 'slate';

import type { TabDestination, TabbableEntry } from './types';

export interface FindTabDestinationOptions {
  activeTabbableEntry: TabbableEntry | null;
  direction: 'backward' | 'forward';
  tabbableEntries: TabbableEntry[];
}

export const findTabDestination = (
  editor: PlateEditor,
  { activeTabbableEntry, direction, tabbableEntries }: FindTabDestinationOptions
): TabDestination | null => {
  // Case 1: A tabbable entry was active before tab was pressed
  if (activeTabbableEntry) {
    // Find the next tabbable entry after the active one
    const activeTabbableEntryIndex =
      tabbableEntries.indexOf(activeTabbableEntry);
    const nextTabbableEntryIndex =
      activeTabbableEntryIndex + (direction === 'forward' ? 1 : -1);
    const nextTabbableEntry = tabbableEntries[nextTabbableEntryIndex];

    /**
     * If the next tabbable entry originated from the same path as the active
     * tabbable entry, focus it.
     *
     * Examples of when this is true:
     *
     * - We're inside a void node and there is an additional tabbable inside the
     *   same void node.
     * - We're inside a popover containing multiple tabbable elements all anchored
     *   to the same slate node, and there is an additional tabbable inside the
     *   same popover.
     *
     * Examples of when this is false:
     *
     * - We're inside a void node and the next tabbable is outside the void node.
     * - We're in the last tabbable element of a popover.
     * - There is no next tabbable element.
     */
    if (
      nextTabbableEntry &&
      Path.equals(activeTabbableEntry.path, nextTabbableEntry.path)
    ) {
      return {
        domNode: nextTabbableEntry.domNode,
        type: 'dom-node',
      };
    }
    /**
     * Otherwise, return the focus to the editor. If we're moving forward, focus
     * the first point after the active tabbable's path. If we're moving
     * backward, focus the point of the active tabbable's path. TODO: Let a
     * tabbable entry specify custom before and after points.
     */
    if (direction === 'forward') {
      const pointAfter = getPointAfter(editor, activeTabbableEntry.path);

      if (!pointAfter) return null;

      return {
        path: pointAfter.path,
        type: 'path',
      };
    }

    return {
      path: getPoint(editor, activeTabbableEntry.path).path,
      type: 'path',
    };
  }

  // Case 2: No tabbable entry was active before tab was pressed

  const selectionPath = editor.selection?.anchor?.path || [];

  // Find the first tabbable entry after the selection
  const nextTabbableEntry =
    direction === 'forward'
      ? tabbableEntries.find(
          (entry) => !Path.isBefore(entry.path, selectionPath)
        )
      : [...tabbableEntries]
          .reverse()
          .find((entry) => Path.isBefore(entry.path, selectionPath));

  // If it exists, focus it
  if (nextTabbableEntry) {
    return {
      domNode: nextTabbableEntry.domNode,
      type: 'dom-node',
    };
  }

  // Otherwise, use the default behaviour
  return null;
};
