import React, { useCallback, useState } from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import {
  collapseSelection,
  MARK_HIGHLIGHT,
  MARK_KBD,
  MARK_SUBSCRIPT,
  MARK_SUPERSCRIPT,
  useEventPlateId,
} from '@udecode/plate';
import { focusEditor, toggleMark } from '@udecode/plate-common';

import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ToolbarButton } from '@/components/ui/toolbar-button';
import { useMyPlateEditorState } from '@/plate/demo/plate.types';

export function MoreDropdownMenu(props: DropdownMenuProps) {
  const editor = useMyPlateEditorState(useEventPlateId());

  const [open, setOpen] = useState(false);
  const onToggle = useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

  return (
    <DropdownMenu open={open} modal={false} onOpenChange={onToggle} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert">
          <Icons.more />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="flex max-h-[500px] min-w-[180px] flex-col gap-0.5 overflow-y-auto"
      >
        <DropdownMenuItem
          onSelect={() => {
            toggleMark(editor, {
              key: MARK_HIGHLIGHT,
            });
            collapseSelection(editor, { edge: 'end' });
            focusEditor(editor);
          }}
        >
          <Icons.highlight className="mr-2 h-5 w-5" />
          Highlight
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            toggleMark(editor, {
              key: MARK_KBD,
            });
            collapseSelection(editor, { edge: 'end' });
            focusEditor(editor);
          }}
        >
          <Icons.kbd className="mr-2 h-5 w-5" />
          Keyboard input
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            toggleMark(editor, {
              key: MARK_SUBSCRIPT,
              clear: MARK_SUPERSCRIPT,
            });
            focusEditor(editor);
          }}
        >
          <Icons.subscript className="mr-2 h-5 w-5" />
          Superscript
          {/* (⌘+,) */}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            toggleMark(editor, {
              key: MARK_SUPERSCRIPT,
              clear: MARK_SUBSCRIPT,
            });
            focusEditor(editor);
          }}
        >
          <Icons.subscript className="mr-2 h-5 w-5" />
          Subscript
          {/* (⌘+.) */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
