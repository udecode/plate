import type { DefinitionOf } from '@platejs/core';

import { DndScrollerAfterEditable } from './DndScroller';
import { DndStorePlugin } from './internal/DndStorePlugin';
import { useDndPlugin } from './useDndNode';

export type { DndPluginState } from './internal/DndStorePlugin';

export const DndPlugin = DndStorePlugin.extend({
  render: {
    afterEditable: DndScrollerAfterEditable,
  },
  useHooks: useDndPlugin,
});

export type DndDefinition = DefinitionOf<typeof DndPlugin>;
