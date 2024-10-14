import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import {
  createNodesWithHOC,
  ParagraphPlugin,
} from '@udecode/plate-common/react';
import { withDraggable as withDraggablePrimitive } from '@udecode/plate-dnd';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import {
  BulletedListPlugin,
  NumberedListPlugin,
} from '@udecode/plate-list/react';
import {
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
} from '@udecode/plate-media/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';

import { Draggable } from './draggable';

import type { DraggableProps } from './draggable';
import type { FC } from 'react';
import type { WithDraggableOptions } from '@udecode/plate-dnd';

export const withDraggable = (
  Component: FC,
  options?: WithDraggableOptions<
    Partial<Omit<DraggableProps, 'children' | 'editor' | 'element'>>
  >
) =>
  withDraggablePrimitive<DraggableProps>(Draggable, Component, options as any);

export const withDraggablesPrimitive = createNodesWithHOC(withDraggable);

export const withDraggables = (components: any) => {
  return withDraggablesPrimitive(components, [
    {
      keys: [
        ParagraphPlugin.key,
        BulletedListPlugin.key,
        NumberedListPlugin.key,
      ],
      level: 0,
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
      keys: [HEADING_KEYS.h6, BulletedListPlugin.key, NumberedListPlugin.key],
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
  ]);
};
