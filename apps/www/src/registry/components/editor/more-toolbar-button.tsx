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
  const focusEditorRef = React.useRef(false);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) focusEditorRef.current = false;
        setOpen(nextOpen);
      }}
      modal={false}
    >
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
        onFinalFocus={(event) => {
          if (!focusEditorRef.current) return;

          focusEditorRef.current = false;
          event.preventDefault();
          editor.api.dom.focus();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              focusEditorRef.current = true;
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
            onSelect={() => {
              focusEditorRef.current = true;
              editor.plugin(ScriptPlugin).update.toggle('sup');
            }}
          >
            <SuperscriptIcon />
            Superscript
            {/* (⌘+,) */}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              focusEditorRef.current = true;
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
