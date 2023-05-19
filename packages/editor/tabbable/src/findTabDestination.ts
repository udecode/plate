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
  if (activeTabbableEntry) {
    // Find the next tabbable entry after the active one
    const activeTabbableEntryIndex =
      tabbableEntries.indexOf(activeTabbableEntry);
    const nextTabbableEntryIndex =
      activeTabbableEntryIndex + (direction === 'forward' ? 1 : -1);
    const nextTabbableEntry = tabbableEntries[nextTabbableEntryIndex];

    // If the next tabbable entry is in the same void, focus it
    if (
      nextTabbableEntry &&
      Path.equals(activeTabbableEntry.path, nextTabbableEntry.path)
    ) {
      return {
        type: 'dom-node',
        domNode: nextTabbableEntry.domNode,
      };
    }

    // Otherwise, focus the first path after the void
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
