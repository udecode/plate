import React from 'react';

import {
  addSelectedRow,
  createPluginFactory,
} from '@udecode/plate-common/server';

import { DndScroller, type ScrollerProps } from './components/Scroller';
import { dndStore } from './dndStore';

export interface DndPlugin {
  enableScroller?: boolean;
  scrollerProps?: Partial<ScrollerProps>;
}

export const KEY_DND = 'dnd';

export const createDndPlugin = createPluginFactory<DndPlugin>({
  handlers: {
    onDragEnd: () => () => {
      return dndStore.set.isDragging(false);
    },
    onDragStart: () => (e) => {
      const id = (e.target as HTMLDivElement).dataset.key ?? null;
      dndStore.set.DraggingId(id);

      return dndStore.set.isDragging(true);
    },
    onDrop: (editor) => () => {
      const id = dndStore.get.DraggingId();

      setTimeout(() => {
        id && addSelectedRow(editor, id);
      }, 0);

      return editor.isDragging as boolean;
    },
  },
  key: KEY_DND,
  then: (editor, { options }) => ({
    renderAfterEditable: options.enableScroller
      ? () => <DndScroller {...options?.scrollerProps} />
      : undefined,
  }),
});
