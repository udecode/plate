'use client';

import * as React from 'react';

import { DndPlugin } from '@platejs/dnd';
import { useBlockSelected } from '@platejs/selection/react';
import { cva } from 'class-variance-authority';
import { PLUGINS } from 'platejs';
import {
  type RenderNodeWrapperProps,
  useEditor,
  usePluginStore,
} from 'platejs/react';

export const blockSelectionVariants = cva(
  'pointer-events-none absolute inset-0 z-1 bg-brand/[.13] transition-opacity',
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: 'opacity-0',
        true: 'opacity-100',
      },
    },
  }
);

export function BlockSelection(props: RenderNodeWrapperProps) {
  const editor = useEditor();
  const isBlockSelected = useBlockSelected();
  const isDragging = usePluginStore(DndPlugin, 'isDragging');
  const table = editor.plugin(PLUGINS.table);
  const tableRow = editor.plugin(PLUGINS.tableRow);

  if (
    !isBlockSelected ||
    (tableRow.installed && props.element.type === tableRow.schema.type) ||
    (table.installed && props.element.type === table.schema.type)
  )
    return null;

  return (
    <div
      className={blockSelectionVariants({
        active: isBlockSelected && !isDragging,
      })}
      contentEditable={false}
      data-plite-root-chrome-ignore="true"
      data-slot="block-selection"
    />
  );
}
