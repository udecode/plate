'use client';

import {
  KeyboardIcon,
  MoreHorizontalIcon,
  SubscriptIcon,
  SuperscriptIcon,
} from 'lucide-react';
import { KbdPlugin, ScriptPlugin, useEditor } from 'platejs/react';
import * as React from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function MoreToolbarButton() {
  const editor = useEditor();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton
          aria-label="More formatting"
          pressed={open}
          tooltip="More formatting"
        >
          <MoreHorizontalIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="ignore-click-outside/toolbar flex max-h-[500px] min-w-[180px] flex-col overflow-y-auto"
        align="start"
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            finalFocus={() => editor.api.dom.focus()}
            onSelect={() => {
              editor.update((tx) => {
                tx.plugin(KbdPlugin).toggle();
                tx.selection.collapse({ edge: 'end' });
              });
            }}
          >
            <KeyboardIcon />
            Keyboard input
          </DropdownMenuItem>

          <DropdownMenuItem
            finalFocus={() => editor.api.dom.focus()}
            onSelect={() => {
              editor.plugin(ScriptPlugin).update.toggle('sup');
            }}
          >
            <SuperscriptIcon />
            Superscript
            {/* (⌘+,) */}
          </DropdownMenuItem>
          <DropdownMenuItem
            finalFocus={() => editor.api.dom.focus()}
            onSelect={() => {
              editor.plugin(ScriptPlugin).update.toggle('sub');
            }}
          >
            <SubscriptIcon />
            Subscript
            {/* (⌘+.) */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
