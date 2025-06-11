'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { DndPlugin } from '@udecode/plate-dnd';
import { PlaceholderPlugin } from '@udecode/plate-media/react';

import { BlockDraggable } from '@/registry/ui/block-draggable';

export const DndKit = [
  DndPlugin.configure({
    options: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        editor
          .getTransforms(PlaceholderPlugin)
          .insert.media(dragItem.files, { at: target, nextBlock: false });
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      aboveSlate: ({ children }) => (
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      ),
    },
  }),
];
