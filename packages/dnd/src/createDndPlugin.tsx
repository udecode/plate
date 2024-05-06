import React from 'react';

import { createPluginFactory } from '@udecode/plate-common/server';

import { DndScroller, type ScrollerProps } from './components/Scroller';
import { dndStore } from './dndStore';

export interface DndPlugin {
  enableScroller?: boolean;
  scrollerProps?: Partial<ScrollerProps>;
}

export const KEY_DND = 'dnd';

export const createDndPlugin = createPluginFactory<DndPlugin>({
  handlers: {
    onDragEnd: () => () => dndStore.set.isDragging(false),
    onDragStart: () => () => dndStore.set.isDragging(true),
    onDrop: (editor) => () => editor.isDragging as boolean,
  },
  key: KEY_DND,
  then: (editor, { options }) => ({
    renderAfterEditable: options.enableScroller
      ? () => <DndScroller {...options?.scrollerProps} />
      : undefined,
  }),
});
