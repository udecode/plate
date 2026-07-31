import type React from 'react';

import { createPlatePlugin, type PlateEditor } from '@platejs/core/react';
import type { Path } from '@platejs/plite';
import { KEYS } from '@platejs/utils';
import type { DropTargetMonitor } from 'react-dnd';

import type { ScrollerProps } from '../DndScroller';
import type {
  DragItemNode,
  DropLineDirection,
  FileDragItemNode,
} from '../useDndNode';

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

const initialState: DndPluginState = {
  _isOver: false,
  draggingId: null,
  dropTarget: { id: null, line: '' },
  enableScroller: false,
  isDragging: false,
  multiplePreviewRef: null,
  scrollerProps: {},
};

export const DndStorePlugin = createPlatePlugin({
  editOnly: true,
  initialState,
  name: KEYS.dnd,
  on: {
    dragEnd: ({ store }) => {
      store.set({ isDragging: false });
      store.set({ dropTarget: { id: null, line: '' } });
    },
    dragEnter: ({ store }) => {
      store.set({ _isOver: true });
    },
    dragStart: ({ event, store }) => {
      if (!(event.target instanceof HTMLElement)) return;

      const { dataTransfer } = event;

      if (!dataTransfer) return;

      dataTransfer.effectAllowed = 'move';
      dataTransfer.dropEffect = 'move';

      const id = event.target.dataset.blockId;

      if (!id) return;

      store.set({ draggingId: id });
      store.set({ isDragging: true });
      store.set({ _isOver: true });
    },
    drop: ({ store }) => store.get().isDragging,
    focus: ({ store }) => {
      store.set({ isDragging: false });
      store.set({ dropTarget: { id: null, line: '' } });
      store.set({ _isOver: false });
      store.get('multiplePreviewRef')?.current?.replaceChildren();
    },
  },
});
