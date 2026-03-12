'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { type DndConfig, DndPlugin } from '@platejs/dnd';
import { PlaceholderPlugin } from '@platejs/media/react';

import { BlockDraggable } from '@/registry/ui/block-draggable';

export const DndKit = [
  DndPlugin.configure({
    options: {
      enableScroller: true,
      onDropFiles: ({
        dragItem,
        editor,
        target,
      }: Parameters<NonNullable<DndConfig['options']['onDropFiles']>>[0]) => {
        editor
          .getTransforms(PlaceholderPlugin)
          .insert.media(dragItem.files, { at: target, nextBlock: false });
      },
    },
    render: {
      aboveNodes: BlockDraggable,
      aboveSlate: ({ children }: React.PropsWithChildren) => (
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      ),
    },
  }),
];
