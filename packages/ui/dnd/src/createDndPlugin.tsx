import React from 'react';
import { createPluginFactory } from '@udecode/plate-core';
import { DndScroller } from './components/index';
import { dndStore } from './dndStore';

export interface DndPlugin {
  enableScroller?: boolean;
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
    renderAfterEditable: options?.enableScroller
      ? () => <DndScroller />
      : undefined,
  }),
});
