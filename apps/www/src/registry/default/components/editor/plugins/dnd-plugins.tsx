'use client';

import type { NodeWrapperComponent } from '@udecode/plate-common/react';

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { findNode } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { DndPlugin, useWithDraggable } from '@udecode/plate-dnd';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from '@udecode/plate-media/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';

import { Draggable } from '@/registry/default/plate-ui/draggable';

const draggableKeys = [
  ParagraphPlugin.key,
  'ul',
  'ol',
  ...HEADING_LEVELS,
  BlockquotePlugin.key,
  CodeBlockPlugin.key,
  ImagePlugin.key,
  MediaEmbedPlugin.key,
  ExcalidrawPlugin.key,
  TogglePlugin.key,
  ColumnPlugin.key,
  PlaceholderPlugin.key,
  TablePlugin.key,
];

const options = [
  {
    keys: draggableKeys,
    filter: (editor, path) => {
      if (path.length === 1) {
        return false;
      }

      const block = findNode(editor, {
        at: path,
        match: {
          type: [editor.getType(ColumnPlugin), editor.getType(TablePlugin)],
        },
      });

      if (block?.[0].type === editor.getType(TablePlugin)) {
        return path.length !== 4;
      }
      if (block?.[0].type === editor.getType(ColumnPlugin)) {
        return path.length !== 3;
      }

      return true;
    },
    level: null,
  },
  {
    key: HEADING_KEYS.h1,
    draggableProps: {
      className:
        '[&_.slate-blockToolbarWrapper]:h-[1.3em] [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-1 [&_.slate-gutterLeft]:text-[1.875em]',
    },
  },
  {
    key: HEADING_KEYS.h2,
    draggableProps: {
      className:
        '[&_.slate-blockToolbarWrapper]:h-[1.3em] [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-1 [&_.slate-gutterLeft]:text-[1.5em]',
    },
  },
  {
    key: HEADING_KEYS.h3,
    draggableProps: {
      className:
        '[&_.slate-blockToolbarWrapper]:h-[1.3em] [&_.slate-gutterLeft]:pt-[2px] [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-1 [&_.slate-gutterLeft]:text-[1.25em]',
    },
  },
  {
    keys: [HEADING_KEYS.h4, HEADING_KEYS.h5],
    draggableProps: {
      className:
        '[&_.slate-blockToolbarWrapper]:h-[1.3em] [&_.slate-gutterLeft]:pt-[3px] [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0 [&_.slate-gutterLeft]:text-[1.1em]',
    },
  },
  {
    keys: [ParagraphPlugin.key],
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-[3px] [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    keys: [HEADING_KEYS.h6, 'ul', 'ol'],
    draggableProps: {
      className: '[&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: BlockquotePlugin.key,
    draggableProps: {
      className: '[&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: CodeBlockPlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-6 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: ImagePlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-0 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: MediaEmbedPlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-0 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: ExcalidrawPlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-0 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: TogglePlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-0 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: ColumnPlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-0 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: PlaceholderPlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-3 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    key: TablePlugin.key,
    draggableProps: {
      className:
        '[&_.slate-gutterLeft]:pt-3 [&_.slate-gutterLeft]:px-0 [&_.slate-gutterLeft]:pb-0',
    },
  },
  {
    keys: draggableKeys,
    draggableProps: {
      className: '[&_.slate-gutterLeft]:w-3',
    },
    filter: (editor, path) => {
      if (path.length === 1) {
        return false;
      }

      const block = findNode(editor, {
        at: path,
        match: {
          type: [editor.getType(ColumnPlugin), editor.getType(TablePlugin)],
        },
      });

      if (block?.[0].type === editor.getType(TablePlugin)) {
        return path.length !== 4;
      }
      if (block?.[0].type === editor.getType(ColumnPlugin)) {
        return path.length !== 3;
      }

      return true;
    },
    level: null,
  },
];

const RenderDraggableAboveNodes: NodeWrapperComponent = () => {
  const { disabled, draggableProps } = useWithDraggable({
    ...options,
    // ...props,
  });

  console.log({ disabled, draggableProps });

  if (disabled) return;

  return ({ children, ...props }) => (
    <Draggable ref={ref} {...draggableProps}>
      <Component {...props} />
    </Draggable>
  );
};

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
    render: {
      aboveNodes: renderDraggableAboveNodes,
    },
  }),
] as const;
