import React from 'react';

import type { Path, PluginConfig } from 'platejs';
import type { DropTargetMonitor } from 'react-dnd';

import { KEYS } from 'platejs';
import { type PlateEditor, createTPlatePlugin } from 'platejs/react';

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
    draggingId?: string | null;
    /** All IDs being dragged (for multi-node drag) */
    draggingIds?: string[] | null;
    dropTarget?: {
      id: string | null;
      line: DropLineDirection;
    };
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
  key: KEYS.dnd,
  editOnly: true,
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
    onDrop: ({ getOptions }) => {
      return getOptions().isDragging;
    },
  },
  options: {
    draggingId: null,
    draggingIds: null,
    dropTarget: { id: null, line: '' },
    isDragging: false,
  },
}).extend(({ getOptions }) => ({
  render: {
    afterEditable: getOptions().enableScroller
      ? () => <DndScroller {...getOptions()?.scrollerProps} />
      : undefined,
  },
}));
