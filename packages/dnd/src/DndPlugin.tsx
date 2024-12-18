import React from 'react';

import type { PluginConfig } from '@udecode/plate-common';
import type { DropTargetMonitor } from 'react-dnd';
import type { Path } from 'slate';

import {
  type PlateEditor,
  createTPlatePlugin,
} from '@udecode/plate-common/react';

import type {
  DragItemNode,
  DropLineDirection,
  FileDragItemNode,
} from './types';

import { type ScrollerProps, DndScroller } from './components/Scroller';

export const DRAG_ITEM_BLOCK = 'block';

export type DndConfig = PluginConfig<
  'dnd',
  {
    dropTarget?: {
      id: string | null;
      line: DropLineDirection;
    };
    draggingId?: string | null;
    enableScroller?: boolean;
    isDragging?: boolean;
    scrollerProps?: Partial<ScrollerProps>;
    onDropFiles?: (props: {
      id: string;
      dragItem: FileDragItemNode;
      editor: PlateEditor;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
      target?: Path;
    }) => void;
  }
>;

export const DndPlugin = createTPlatePlugin<DndConfig>({
  key: 'dnd',
  options: {
    draggingId: null,
    dropTarget: { id: null, line: '' },
    isDragging: false,
  },
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.setOption(plugin, 'isDragging', false);
    },
    onDragStart: ({ editor, event, plugin }) => {
      const target = event.target as HTMLElement;

      const dataTransfer = (event as React.DragEvent).dataTransfer!;
      dataTransfer.effectAllowed = 'move';
      dataTransfer.dropEffect = 'move';

      const id = target.dataset.blockId;

      if (!id) return;

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
