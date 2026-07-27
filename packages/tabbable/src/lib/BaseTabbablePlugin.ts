import { createBasePlugin, type InferConfig } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import type { TabbableEntry, TabDestination } from './types';

export type FindTabDestinationOptions = {
  activeTabbableEntry: TabbableEntry | null;
  direction: 'backward' | 'forward';
  tabbableEntries: TabbableEntry[];
};

export type TabbablePluginState = {
  /**
   * When true, the plugin will add its event listener to the document instead
   * of the editor, allowing it to capture events from outside the editor.
   *
   * @default: false
   */
  globalEventListener?: boolean;
  /**
   * Add additional tabbables to the list of tabbables. Useful for adding
   * tabbables that are not contained within the editor. Ignores `isTabbable`.
   *
   * @default: () => []
   */
  insertTabbableEntries?: (event: KeyboardEvent) => TabbableEntry[];
  /**
   * Determine whether an element should be included in the tabbable list.
   *
   * @default: (entry) => editor.read.schema.isVoid(entry.slateNode)
   */
  isTabbable?: (entry: TabbableEntry) => boolean;
  /**
   * Dynamically enable or disable the plugin.
   *
   * @default: () => true
   */
  query?: (event: KeyboardEvent) => boolean;
};

export const BaseTabbablePlugin = createBasePlugin({
  key: KEYS.tabbable,
  initialState: ({ editor }): TabbablePluginState => ({
    globalEventListener: false,
    insertTabbableEntries: (_event) => [],
    isTabbable: (entry) => editor.read.schema.isVoid(entry.slateNode),
    query: (_event) => true,
  }),
  read: ({ state }) => ({
    findDestination: ({
      activeTabbableEntry,
      direction,
      tabbableEntries,
    }: FindTabDestinationOptions): TabDestination | null => {
      const comparePaths = (a: readonly number[], b: readonly number[]) => {
        const minLength = Math.min(a.length, b.length);

        for (let index = 0; index < minLength; index++) {
          if (a[index] !== b[index]) {
            return a[index] - b[index];
          }
        }

        return a.length - b.length;
      };
      const isPathBefore = (a: readonly number[], b: readonly number[]) =>
        comparePaths(a, b) < 0;

      if (activeTabbableEntry) {
        const activeIndex = tabbableEntries.indexOf(activeTabbableEntry);
        const nextEntry =
          tabbableEntries[activeIndex + (direction === 'forward' ? 1 : -1)];

        if (
          nextEntry &&
          comparePaths(activeTabbableEntry.path, nextEntry.path) === 0
        ) {
          return { domNode: nextEntry.domNode, type: 'dom-node' };
        }
        if (direction === 'forward') {
          const point = state.points.after(activeTabbableEntry.path);

          return point ? { path: point.path, type: 'path' } : null;
        }

        const point = state.points.get(activeTabbableEntry.path);

        return point ? { path: point.path, type: 'path' } : null;
      }

      const selectionPath = state.selection()?.anchor.path ?? [];
      const nextEntry =
        direction === 'forward'
          ? tabbableEntries.find(
              (entry) => !isPathBefore(entry.path, selectionPath)
            )
          : [...tabbableEntries]
              .reverse()
              .find((entry) => isPathBefore(entry.path, selectionPath));

      return nextEntry
        ? { domNode: nextEntry.domNode, type: 'dom-node' }
        : null;
    },
  }),
});

export type TabblableConfig = InferConfig<typeof BaseTabbablePlugin>;
