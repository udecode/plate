import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  SubscriptPlugin,
  SuperscriptPlugin,
} from '@udecode/plate-basic-marks/react';
import { collapseSelection } from '@udecode/plate-common';
import { focusEditor, useEditorRef } from '@udecode/plate-common/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import {
  HighlighterIcon,
  KeyboardIcon,
  MoreHorizontalIcon,
  SubscriptIcon,
  SuperscriptIcon,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from '@/registry/default/plate-ui/dropdown-menu';
import { ToolbarButton } from '@/registry/default/plate-ui/toolbar';

export function PlaygroundMoreDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert">
          <MoreHorizontalIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar flex max-h-[500px] min-w-[180px] flex-col gap-0.5 overflow-y-auto"
        align="start"
      >
        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({ key: HighlightPlugin.key });
            collapseSelection(editor, { edge: 'end' });
            focusEditor(editor);
          }}
        >
          <HighlighterIcon className="mr-2 size-5" />
          Highlight
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({ key: KbdPlugin.key });
            collapseSelection(editor, { edge: 'end' });
            focusEditor(editor);
          }}
        >
          <KeyboardIcon className="mr-2 size-5" />
          Keyboard input
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            editor.tf.toggle.mark({
              key: SuperscriptPlugin.key,
              clear: [SubscriptPlugin.key, SuperscriptPlugin.key],
            });
            focusEditor(editor);
          }}
        >
          <SuperscriptIcon className="mr-2 size-5" />
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
          <SubscriptIcon className="mr-2 size-5" />
          Subscript
          {/* (⌘+.) */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
