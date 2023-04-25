import React from 'react';
import { createPluginFactory } from '@udecode/plate-common';
import { DndScroller, ScrollerProps } from './components/Scroller';
import { dndStore } from './dndStore';

export interface DndPlugin {
  enableScroller?: boolean;
  scrollerProps?: Partial<ScrollerProps>;
}

export const KEY_DND = 'dnd';

export const createDndPlugin = createPluginFactory<DndPlugin>({
  key: KEY_DND,
  handlers: {
    onDragStart: () => () => dndStore.set.isDragging(true),
    onDragEnd: () => () => dndStore.set.isDragging(false),
    onDrop: (editor) => () => editor.isDragging as boolean,
  },
  then: (editor, { options }) => ({
    renderAfterEditable: options.enableScroller
      ? () => <DndScroller {...options?.scrollerProps} />
      : undefined,
  }),
});
