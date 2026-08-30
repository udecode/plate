import type React from 'react';
import type { DropTargetMonitor } from 'react-dnd';

import type { NodeKey, Path } from '../../../core';
import { PLUGINS } from '../../../core';
import { definePlatePlugin, type Editor } from '../../../react/core';
import type { DndScrollerOptions } from '../DndScroller';
import type {
  DragItemNode,
  DropLineDirection,
  FileDragItemNode,
} from '../useDndNode';

export type DndPluginState = {
  _isOver: boolean;
  draggingKey: NodeKey[] | NodeKey | null;
  dropTarget:
    | {
        key: NodeKey | null;
        line: DropLineDirection;
      }
    | undefined;
  enableScroller: boolean;
  isDragging: boolean;
  multiplePreviewRef: React.RefObject<HTMLDivElement | null> | null;
  scrollerProps: Partial<DndScrollerOptions>;
  onDropFiles?: (props: {
    key: NodeKey;
    dragItem: FileDragItemNode;
    editor: Editor;
    monitor: DropTargetMonitor<DragItemNode>;
    nodeRef: React.RefObject<HTMLElement | null>;
    target?: Path;
  }) => void;
};

const initialState: DndPluginState = {
  _isOver: false,
  draggingKey: null,
  dropTarget: { key: null, line: '' },
  enableScroller: false,
  isDragging: false,
  multiplePreviewRef: null,
  scrollerProps: {},
};

export const DndStorePlugin = definePlatePlugin(PLUGINS.dnd, {
  editOnly: true,
  initialState,
  on: {
    dragEnd: ({ store }) => {
      store.set({ isDragging: false });
      store.set({ dropTarget: { key: null, line: '' } });
    },
    dragEnter: ({ store }) => {
      store.set({ _isOver: true });
    },
    dragOver: ({ store }) => store.get().isDragging,
    drop: ({ store }) => store.get().isDragging,
    focus: ({ store }) => {
      store.set({ isDragging: false });
      store.set({ dropTarget: { key: null, line: '' } });
      store.set({ _isOver: false });
      store.get('multiplePreviewRef')?.current?.replaceChildren();
    },
  },
});
