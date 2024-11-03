import React from 'react';

import type { PluginConfig } from '@udecode/plate-common';

import { createTPlatePlugin } from '@udecode/plate-common/react';

import { type ScrollerProps, DndScroller } from './components/Scroller';

export type DndConfig = PluginConfig<
  'dnd',
  {
    draggingId?: string | null;
    enableFile?: boolean;
    enableScroller?: boolean;
    isDragging?: boolean;
    scrollerProps?: Partial<ScrollerProps>;
  }
>;

export const DndPlugin = createTPlatePlugin<DndConfig>({
  key: 'dnd',
  options: {
    draggingId: null,
    enableFile: false,
    isDragging: false,
  },
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.setOption(plugin, 'isDragging', false);
    },
    onDragStart: ({ editor, event, plugin }) => {
      const id = (event.target as HTMLDivElement).dataset.key ?? null;

      editor.setOption(plugin, 'draggingId', id);
      editor.setOption(plugin, 'isDragging', true);
    },
    onDrop: ({ editor, getOptions }) => {
      const id = getOptions().draggingId;

      setTimeout(() => {
        id &&
          editor
            .getApi({ key: 'blockSelection' })
            .blockSelection?.addSelectedRow?.(id);
      }, 0);

      return getOptions().isDragging;
    },
  },
}).extend(({ getOptions }) => ({
  render: {
    afterEditable: getOptions().enableScroller
      ? () => <DndScroller {...getOptions()?.scrollerProps} />
      : undefined,
  },
}));
