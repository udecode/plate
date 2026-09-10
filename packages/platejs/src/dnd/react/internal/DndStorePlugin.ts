import type React from 'react';
import type { DropTargetMonitor } from 'react-dnd';

import type { Element, NodeEntry, NodeKey, Path } from '../../../core';
import { ElementApi, PLUGINS } from '../../../core';
import { BaseListPlugin } from '../../../features/list/lib/BaseListPlugin';
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
  dropTarget: {
    key: NodeKey | null;
    line: DropLineDirection;
  } | null;
  enableScroller: boolean;
  isDragging: boolean;
  multiplePreviewRef: React.RefObject<HTMLDivElement | null> | null;
  scrollerProps: Partial<DndScrollerOptions>;
  onDropFiles:
    | ((props: {
        key: NodeKey;
        dragItem: FileDragItemNode;
        editor: Editor;
        monitor: DropTargetMonitor<DragItemNode>;
        nodeRef: React.RefObject<HTMLElement | null>;
        target?: Path;
      }) => void)
    | null;
};

const initialState: DndPluginState = {
  _isOver: false,
  draggingKey: null,
  dropTarget: { key: null, line: '' },
  enableScroller: false,
  isDragging: false,
  multiplePreviewRef: null,
  onDropFiles: null,
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
})
  .extend(({ editor }) => ({
    read: ({ state }) => ({
      /** Read the clicked block's selection, including its nested list items. */
      dragEntries: (element: Element): ReadonlyArray<NodeEntry<Element>> => {
        const path = state.nodes.path(element);

        if (!path) return [];

        const current = state.nodes.get(path, { match: ElementApi.isElement });

        if (!current) return [];

        const key = editor.key(current[0]);

        let entries = state.nodes.blocks();

        if (!entries.some(([node]) => editor.key(node) === key)) {
          entries = [current];
        }

        const list = editor.plugin(BaseListPlugin);

        return list.installed &&
          entries.some(([node]) => typeof node.listType === 'string')
          ? list.read.expandItemsWithChildren(entries)
          : entries;
      },
    }),
  }))
  .extend(({ editor, read, store }) => ({
    api: () => ({
      /** Select the drag payload and return inert clones for its mounted views. */
      prepareDrag: (element: Element) => {
        if (editor.read.view.isReadOnly()) return [];

        const entries = read.dragEntries(element);
        const previews = entries.flatMap(([node]) => {
          const domNode = editor.api.dom.resolveDOMNode(node);

          if (!domNode) return [];

          const preview = domNode.cloneNode(true) as HTMLElement;

          for (const child of [preview, ...preview.querySelectorAll('*')]) {
            for (const attribute of Array.from(child.attributes)) {
              if (attribute.name.startsWith('data-plite')) {
                child.removeAttribute(attribute.name);
              }
            }
          }
          preview.inert = true;
          preview.setAttribute('aria-hidden', 'true');
          preview.contentEditable = 'false';

          return [{ domNode, node, preview }];
        });

        if (entries.length > 0) {
          store.set({ draggingKey: entries.map(([node]) => editor.key(node)) });
          editor.update.selection.setNodes(entries.map(([node]) => node));
        }

        return previews;
      },
    }),
  }));
