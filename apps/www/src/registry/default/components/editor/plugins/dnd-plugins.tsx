'use client';

import { DndPlugin } from '@udecode/plate-dnd';
import { PlaceholderPlugin } from '@udecode/plate-media/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';

export const dndPlugins = [
  NodeIdPlugin,
  DndPlugin.configure({
    options: {
      enableScroller: true,
      onDropFiles: ({ dragItem, editor, target }) => {
        editor
          .getTransforms(PlaceholderPlugin)
          .insert.media(dragItem.files, { at: target, nextBlock: false });
      },
    },
  }),
] as const;
