'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import { DndPlugin } from '@platejs/dnd';
import {
  BlockSelectionPlugin,
  useBlockSelected,
} from '@platejs/selection/react';
import { cva } from 'class-variance-authority';
import { isHotkey, PLUGINS } from 'platejs';
import {
  type RenderNodeWrapperProps,
  useEditor,
  usePluginStore,
} from 'platejs/react';
import * as React from 'react';

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
  ) {
    return null;
  }

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

export const hasSelectableClass = ({
  attributes,
  className,
}: {
  attributes: { className?: string };
  className?: string;
}) =>
  [className, attributes.className]
    .filter(Boolean)
    .join(' ')
    .includes('plite-selectable');

export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    initialState: {
      enableContextMenu: true,
      selectionAreaClassName: 'z-50 border border-brand/25 bg-brand/15',
      isSelectable: (element) =>
        ![PLUGINS.column, PLUGINS.codeLine, PLUGINS.tableCell]
          .flatMap((name) => {
            const plugin = editor.plugin(name);

            return plugin.installed ? [plugin.schema.type] : [];
          })
          .includes(element.type),
      onKeyDownSelecting: (innerEditor, event) => {
        if (isHotkey('mod+j')(event)) {
          innerEditor.plugin(AIChatPlugin).api.show();
        }
      },
    },
    render: {
      belowRootNodes: (props) => {
        if (!hasSelectableClass(props)) return null;

        return <BlockSelection {...props} />;
      },
    },
  })),
] as const;
