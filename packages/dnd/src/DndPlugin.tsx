import React from 'react';

import { type PluginConfig, addSelectedRow } from '@udecode/plate-common';
import { createTPlatePlugin } from '@udecode/plate-common/react';

import { DndScroller, type ScrollerProps } from './components/Scroller';

export type DndConfig = PluginConfig<
  'dnd',
  {
    draggingId?: null | string;
    enableScroller?: boolean;
    isDragging?: boolean;
    scrollerProps?: Partial<ScrollerProps>;
  }
>;

export const DndPlugin = createTPlatePlugin<DndConfig>({
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.setOption(plugin, 'isDragging', false);
    },
    onDragStart: ({ editor, event, plugin }) => {
      const id = (event.target as HTMLDivElement).dataset.key ?? null;

      editor.setOption(plugin, 'draggingId', id);
      editor.setOption(plugin, 'isDragging', true);
    },
    onDrop: ({ editor, options }) => {
      const id = options.draggingId;

      setTimeout(() => {
        id && addSelectedRow(editor, id);
      }, 0);

      return editor.isDragging as boolean;
    },
  },
  key: 'dnd',
  options: {
    draggingId: null,
    isDragging: false,
  },
}).extend(({ options }) => ({
  renderAfterEditable: options.enableScroller
    ? () => <DndScroller {...options?.scrollerProps} />
    : undefined,
}));
