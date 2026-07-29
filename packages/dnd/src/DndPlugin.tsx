import type React from 'react';

import type { PluginConfig } from '@platejs/core';
import type { PlateEditor } from '@platejs/core/react';
import type { Path } from '@platejs/plite';
import type { DropTargetMonitor } from 'react-dnd';

import { createPlatePlugin } from '@platejs/core/react';
import { KEYS } from '@platejs/utils';

import type {
  DragItemNode,
  DropLineDirection,
  FileDragItemNode,
} from './useDndNode';

import { DndScrollerAfterEditable, type ScrollerProps } from './DndScroller';
import { useDndPlugin } from './useDndNode';

export type DndPluginState = {
  _isOver: boolean;
  draggingId: string[] | string | null;
  dropTarget:
    | {
        id: string | null;
        line: DropLineDirection;
      }
    | undefined;
  enableScroller: boolean;
  isDragging: boolean;
  multiplePreviewRef: React.RefObject<HTMLDivElement | null> | null;
  scrollerProps: Partial<ScrollerProps>;
  onDropFiles?: (props: {
    id: string;
    dragItem: FileDragItemNode;
    editor: PlateEditor;
    monitor: DropTargetMonitor<DragItemNode, unknown>;
    nodeRef: React.RefObject<HTMLElement | null>;
    target?: Path;
  }) => void;
};

export type DndConfig = PluginConfig<typeof KEYS.dnd, DndPluginState>;

const initialState: DndPluginState = {
  _isOver: false,
  draggingId: null,
  dropTarget: { id: null, line: '' },
  enableScroller: false,
  isDragging: false,
  multiplePreviewRef: null,
  scrollerProps: {},
};

export const DndPlugin = createPlatePlugin<DndConfig>({
  key: KEYS.dnd,
  initialState,

  editOnly: true,
  render: {
    afterEditable: DndScrollerAfterEditable,
  },
  handlers: {
    onDragEnd: ({ store }) => {
      store.set({ isDragging: false });
      store.set({ dropTarget: { id: null, line: '' } });
    },
    onDragEnter: ({ store }) => {
      store.set({ _isOver: true });
    },
    onDragStart: ({ event, store }) => {
      if (!(event.target instanceof HTMLElement)) return;

      const target = event.target;

      const { dataTransfer } = event;

      if (!dataTransfer) return;

      dataTransfer.effectAllowed = 'move';
      dataTransfer.dropEffect = 'move';

      const id = target.dataset.blockId;

      if (!id) return;

      store.set({ draggingId: id });
      store.set({ isDragging: true });
      store.set({ _isOver: true });
    },
    onDrop: ({ store }) => store.get().isDragging,
    onFocus: ({ store }) => {
      store.set({ isDragging: false });
      store.set({ dropTarget: { id: null, line: '' } });
      store.set({ _isOver: false });
      store.get('multiplePreviewRef')?.current?.replaceChildren();
    },
  },
  useHooks: useDndPlugin,
});
