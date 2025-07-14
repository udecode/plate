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
    _isOver?: boolean;
    draggingId?: string[] | string | null;
    dropTarget?: {
      id: string | null;
      line: DropLineDirection;
    };
    enableScroller?: boolean;
    isDragging?: boolean;
    multiplePreviewRef?: React.RefObject<HTMLDivElement | null> | null;
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
      editor.setOption(plugin, 'dropTarget', { id: null, line: '' });
    },
    onDragEnter: ({ editor, plugin }) => {
      editor.setOption(plugin, '_isOver', true);
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
      editor.setOption(plugin, '_isOver', true);
    },
    onDrop: ({ getOptions, setOption }) => {
      setOption('_isOver', false);
      setOption('dropTarget', undefined);

      return getOptions().isDragging;
    },
    onFocus: ({ editor, plugin }) => {
      editor.setOption(plugin, 'isDragging', false);
      editor.setOption(plugin, 'dropTarget', { id: null, line: '' });
      editor.setOption(plugin, '_isOver', false);
      editor
        .getOption(plugin, 'multiplePreviewRef')
        ?.current?.replaceChildren();
    },
  },
  options: {
    _isOver: false,
    draggingId: null,
    dropTarget: { id: null, line: '' },
    isDragging: false,
    multiplePreviewRef: null,
  },
}).extend(({ getOptions }) => ({
  render: {
    afterEditable: getOptions().enableScroller
      ? () => <DndScroller {...getOptions()?.scrollerProps} />
      : undefined,
  },
}));
