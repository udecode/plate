import type { DefinitionOf } from '../../core';
import { DndScrollerAfterEditable } from './DndScroller';
import { useDndPlugin } from './internal/DndStore';
import { DndStorePlugin } from './internal/DndStorePlugin';

export type { DndPluginState } from './internal/DndStorePlugin';

export const DndPlugin = DndStorePlugin.extend({
  render: {
    afterEditable: DndScrollerAfterEditable,
  },
  useHooks: useDndPlugin,
});

export type DndDefinition = DefinitionOf<typeof DndPlugin>;
