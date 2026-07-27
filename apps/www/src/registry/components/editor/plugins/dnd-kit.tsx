'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { DndPlugin } from '@platejs/dnd';
import { PlaceholderPlugin } from '@platejs/media/react';

import { BlockDraggable } from '@/registry/ui/block-draggable';

export const DndKit = [
  DndPlugin.configure({
    initialState: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        editor
          .plugin(PlaceholderPlugin)
          .update.insertMedia(dragItem.files, { at: target });
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      abovePlite: ({ children }) => (
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      ),
    },
  }),
];
