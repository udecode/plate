'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  SubscriptPlugin,
  SuperscriptPlugin,
} from '@udecode/plate-basic-marks/react';
import { focusEditor, useEditorRef } from '@udecode/plate-common/react';
import { MoreHorizontal, Subscript, Superscript } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export function MoreDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert">
          <MoreHorizontal />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-[180px] flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({
              key: SuperscriptPlugin.key,
              clear: [SubscriptPlugin.key, SuperscriptPlugin.key],
            });
            focusEditor(editor);
          }}
        >
          <Superscript className="mr-2 size-5" />
          Superscript
          {/* (⌘+,) */}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({
              key: SubscriptPlugin.key,
              clear: [SuperscriptPlugin.key, SubscriptPlugin.key],
            });
            focusEditor(editor);
          }}
        >
          <Subscript className="mr-2 size-5" />
          Subscript
          {/* (⌘+.) */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
