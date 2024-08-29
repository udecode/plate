import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  SubscriptPlugin,
  SuperscriptPlugin,
} from '@udecode/plate-basic-marks/react';
import { focusEditor, useEditorRef } from '@udecode/plate-common/react';

import { Icons } from '@/components/icons';

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
          <Icons.more />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-[180px] flex-col gap-0.5 overflow-y-auto"
      >
        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({
              clear: [SubscriptPlugin.key, SuperscriptPlugin.key],
              key: SuperscriptPlugin.key,
            });
            focusEditor(editor);
          }}
        >
          <Icons.superscript className="mr-2 size-5" />
          Superscript
          {/* (⌘+,) */}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({
              clear: [SuperscriptPlugin.key, SubscriptPlugin.key],
              key: SubscriptPlugin.key,
            });
            focusEditor(editor);
          }}
        >
          <Icons.subscript className="mr-2 size-5" />
          Subscript
          {/* (⌘+.) */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
