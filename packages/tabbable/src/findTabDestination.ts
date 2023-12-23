import {
  getPoint,
  getPointAfter,
  PlateEditor,
  Value,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { TabbableEntry, TabDestination } from './types';

export interface FindTabDestinationOptions {
  tabbableEntries: TabbableEntry[];
  activeTabbableEntry: TabbableEntry | null;
  direction: 'forward' | 'backward';
}

export const findTabDestination = <V extends Value = Value>(
  editor: PlateEditor<V>,
  { tabbableEntries, activeTabbableEntry, direction }: FindTabDestinationOptions
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
     * - We're inside a void node and there is an additional tabbable inside
     *   the same void node.
     * - We're inside a popover containing multiple tabbable elements all
     *   anchored to the same slate node, and there is an additional tabbable
     *   inside the same popover.
     *
     * Examples of when this is false:
     * - We're inside a void node and the next tabbable is outside the void
     *   node.
     * - We're in the last tabbable element of a popover.
     * - There is no next tabbable element.
     */
    if (
      nextTabbableEntry &&
      Path.equals(activeTabbableEntry.path, nextTabbableEntry.path)
    ) {
      return {
        type: 'dom-node',
        domNode: nextTabbableEntry.domNode,
      };
    }

    /**
     * Otherwise, return the focus to the editor. If we're moving forward,
     * focus the first point after the active tabbable's path. If we're moving
     * backward, focus the point of the active tabbable's path.
     * TODO: Let a tabbable entry specify custom before and after points.
     */

    if (direction === 'forward') {
      const pointAfter = getPointAfter(editor, activeTabbableEntry.path);
      if (!pointAfter) return null;
      return {
        type: 'path',
        path: pointAfter.path,
      };
    }

    return {
      type: 'path',
      path: getPoint(editor, activeTabbableEntry.path).path,
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
      type: 'dom-node',
      domNode: nextTabbableEntry.domNode,
    };
  }

  // Otherwise, use the default behaviour
  return null;
};
