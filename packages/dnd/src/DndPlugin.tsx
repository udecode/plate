import React from 'react';

import { type PluginConfig, addSelectedRow } from '@udecode/plate-common';
import { createTPlatePlugin } from '@udecode/plate-common/react';

import { DndScroller, type ScrollerProps } from './components/Scroller';
import { dndStore } from './dndStore';

export type DndConfig = PluginConfig<
  'dnd',
  {
    enableScroller?: boolean;
    scrollerProps?: Partial<ScrollerProps>;
  }
>;

export const DndPlugin = createTPlatePlugin<DndConfig>({
  handlers: {
    onDragEnd: () => {
      return dndStore.set.isDragging(false);
    },
    onDragStart: ({ event }) => {
      const id = (event.target as HTMLDivElement).dataset.key ?? null;
      dndStore.set.DraggingId(id);

      return dndStore.set.isDragging(true);
    },
    onDrop: ({ editor }) => {
      const id = dndStore.get.DraggingId();

      setTimeout(() => {
        id && addSelectedRow(editor, id);
      }, 0);

      return editor.isDragging as boolean;
    },
  },
  key: 'dnd',
}).extend(({ options }) => ({
  renderAfterEditable: options.enableScroller
    ? () => <DndScroller {...options?.scrollerProps} />
    : undefined,
}));
