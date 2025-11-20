import React, { useCallback, useEffect } from 'react';

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
    onDrop: ({ getOptions }) => getOptions().isDragging,
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
  useHooks: ({ editor, setOption }) => {
    const handleDragLeave = useCallback(
      (e: DragEvent) => {
        // This event fires for every element that receives a drag leave event. As soon as it is fired on the
        // editable dom node, or above, we will unset the drop target, and therefore hide the drop line.
        // In other words, whenever the drag is not happening inside the editor anymore, we will hide the
        // drop line which makes sense, since a potential drop would not insert anything into the editor.
        // This will also apply, if the user move the drag operation outside the document.
        if (e.target instanceof Node) {
          const editorDOMNode = editor.api.toDOMNode(editor);

          if (
            editorDOMNode &&
            !(e.target === editorDOMNode || editorDOMNode.contains(e.target))
          ) {
            setOption('dropTarget', undefined);
          }
        }
      },
      [editor, setOption]
    );

    // We listen for the drop event on the document and not only inside the editor, because we want to
    // remove the dropTarget, and therefore hide the drop line, also when the drop happened outside of
    // the editor. Needed, if the drag did not start inside the editor, but for example by dragging a
    // file from the filesystem
    const handleDrop = useCallback(() => {
      setOption('_isOver', false);
      setOption('dropTarget', undefined);
    }, [setOption]);

    useEffect(() => {
      document.addEventListener('dragleave', handleDragLeave, true);
      document.addEventListener('drop', handleDrop, true);

      return () => {
        document.removeEventListener('dragleave', handleDragLeave, true);
        document.removeEventListener('drop', handleDrop, true);
      };
    }, [handleDragLeave, handleDrop]);
  },
}).extend(({ getOptions }) => ({
  render: {
    afterEditable: getOptions().enableScroller
      ? () => <DndScroller {...getOptions()?.scrollerProps} />
      : undefined,
  },
}));
