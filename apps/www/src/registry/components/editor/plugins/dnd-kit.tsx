'use client';

import { DndPlugin } from '@udecode/plate-dnd';
import { PlaceholderPlugin } from '@udecode/plate-media/react';

import { BlockDraggable } from '@/registry/ui/block-draggable';

import { NodeIdKit } from './node-id-kit';

export const DndKit = [
  ...NodeIdKit,
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
    },
  }),
];
