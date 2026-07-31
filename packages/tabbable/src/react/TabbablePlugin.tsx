import type { DefinitionOf } from '@platejs/core';
import { createPlatePlugin } from '@platejs/core/react';
import { PathApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import type {
  FindTabDestinationOptions,
  TabDestination,
  TabbablePluginState,
} from '../lib/TabbablePluginTypes';
import { TabbableEffects } from './TabbableEffects';

export const TabbablePlugin = createPlatePlugin({
  name: KEYS.tabbable,
  initialState: ({ editor }): TabbablePluginState => ({
    globalEventListener: false,
    insertTabbableEntries: (_event) => [],
    isTabbable: (entry) => editor.read.schema.isVoid(entry.slateNode),
    query: (_event) => true,
  }),
  render: { afterEditable: TabbableEffects },
}).extend({
  read: ({ state }) => ({
    findDestination: ({
      activeTabbableEntry,
      direction,
      tabbableEntries,
    }: FindTabDestinationOptions): TabDestination | null => {
      if (activeTabbableEntry) {
        const activeIndex = tabbableEntries.indexOf(activeTabbableEntry);
        const nextEntry =
          tabbableEntries[activeIndex + (direction === 'forward' ? 1 : -1)];

        if (
          nextEntry &&
          PathApi.equals(activeTabbableEntry.path, nextEntry.path)
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
              (entry) =>
                (PathApi.compare(entry.path, selectionPath) ||
                  entry.path.length - selectionPath.length) >= 0
            )
          : [...tabbableEntries]
              .reverse()
              .find(
                (entry) =>
                  (PathApi.compare(entry.path, selectionPath) ||
                    entry.path.length - selectionPath.length) < 0
              );

      return nextEntry
        ? { domNode: nextEntry.domNode, type: 'dom-node' }
        : null;
    },
  }),
});

export type TabbableDefinition = DefinitionOf<typeof TabbablePlugin>;
