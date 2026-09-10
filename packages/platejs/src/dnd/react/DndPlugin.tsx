import type { DefinitionOf } from '../../core';
import { DndScrollerAfterEditable } from './DndScroller';
import { DndStorePlugin } from './internal/DndStorePlugin';

export type { DndPluginState } from './internal/DndStorePlugin';

export const DndPlugin = DndStorePlugin.extend({
  slots: {
    afterEditable: DndScrollerAfterEditable,
  },
});

export type DndDefinition = DefinitionOf<typeof DndPlugin>;
