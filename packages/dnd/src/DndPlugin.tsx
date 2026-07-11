import React, { useEffect } from 'react';

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
      nodeRef: React.RefObject<HTMLElement | null>;
      target?: Path;
    }) => void;
  }
>;

export const DndPlugin = createPlatePlugin<DndConfig>({
  key: KEYS.dnd,
  editOnly: true,
  handlers: {
    onDragEnd: ({ editor, plugin }) => {
      editor.plugin(plugin).setOption('isDragging', false);
      editor.plugin(plugin).setOption('dropTarget', { id: null, line: '' });
    },
    onDragEnter: ({ editor, plugin }) => {
      editor.plugin(plugin).setOption('_isOver', true);
    },
    onDragStart: ({ editor, event, plugin }) => {
      if (!(event.target instanceof HTMLElement)) return;

      const target = event.target;

      const { dataTransfer } = event;

      if (!dataTransfer) return;

      dataTransfer.effectAllowed = 'move';
      dataTransfer.dropEffect = 'move';

      const id = target.dataset.blockId;

      if (!id) return;

      editor.plugin(plugin).setOption('draggingId', id);
      editor.plugin(plugin).setOption('isDragging', true);
      editor.plugin(plugin).setOption('_isOver', true);
    },
    onDrop: ({ getOptions }) => getOptions().isDragging,
    onFocus: ({ editor, plugin }) => {
      editor.plugin(plugin).setOption('isDragging', false);
      editor.plugin(plugin).setOption('dropTarget', { id: null, line: '' });
      editor.plugin(plugin).setOption('_isOver', false);
      editor
        .plugin(plugin)
        .getOption('multiplePreviewRef')
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
  useHooks: ({ editor, setOption }) => {
    useEffect(() => {
      const handleDragLeave = (e: DragEvent) => {
        // This event fires for every element that receives a drag leave event. As soon as it is fired on the
        // editable dom node, or above, we will unset the drop target, and therefore hide the drop line.
        // In other words, whenever the drag is not happening inside the editor anymore, we will hide the
        // drop line which makes sense, since a potential drop would not insert anything into the editor.
        // This will also apply, if the user move the drag operation outside the document.
        if (e.target instanceof Node) {
          const editorDOMNode = editor.api.dom.resolveDOMNode(editor);

          if (!editorDOMNode) return;

          const targetElement =
            e.target instanceof HTMLElement ? e.target : e.target.parentElement;
          const relatedTarget = e.relatedTarget;
          const relatedElement =
            relatedTarget instanceof HTMLElement
              ? relatedTarget
              : relatedTarget instanceof Node
                ? relatedTarget.parentElement
                : null;
          const targetBlock = targetElement?.closest('[data-block-id]');
          const relatedBlock = relatedElement?.closest('[data-block-id]');
          const isLeavingEditor = !(
            e.target === editorDOMNode || editorDOMNode.contains(e.target)
          );
          const isLeavingBlockForEditorWhitespace =
            !!targetBlock &&
            !relatedBlock &&
            (!relatedTarget ||
              (relatedTarget instanceof Node &&
                editorDOMNode.contains(relatedTarget)));

          if (isLeavingEditor || isLeavingBlockForEditorWhitespace) {
            setOption('dropTarget', undefined);
          }
        }
      };

      // We listen for the drop event on the document and not only inside the editor, because we want to
      // remove the dropTarget, and therefore hide the drop line, also when the drop happened outside of
      // the editor. Needed, if the drag did not start inside the editor, but for example by dragging a
      // file from the filesystem
      const handleDrop = () => {
        setOption('_isOver', false);
        setOption('dropTarget', undefined);
      };

      document.addEventListener('dragleave', handleDragLeave, true);
      document.addEventListener('drop', handleDrop, true);

      return () => {
        document.removeEventListener('dragleave', handleDragLeave, true);
        document.removeEventListener('drop', handleDrop, true);
      };
    }, [editor, setOption]);
  },
}).extend(({ getOptions }) => ({
  render: {
    afterEditable: getOptions().enableScroller
      ? () => <DndScroller {...getOptions()?.scrollerProps} />
      : undefined,
  },
}));
