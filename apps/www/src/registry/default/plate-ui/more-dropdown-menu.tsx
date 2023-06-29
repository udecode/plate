import React from 'react';
import { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';
import { MARK_SUBSCRIPT, MARK_SUPERSCRIPT } from '@udecode/plate-basic-marks';
import {
  collapseSelection,
  focusEditor,
  toggleMark,
} from '@udecode/plate-common';
import { usePlateEditorState } from '@udecode/plate-core';
import { MARK_HIGHLIGHT } from '@udecode/plate-highlight';
import { MARK_KBD } from '@udecode/plate-kbd';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

import { Icons } from '@/components/icons';

export function MoreDropdownMenu(props: DropdownMenuProps) {
  const editor = usePlateEditorState();
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
          <Icons.superscript className="mr-2 h-5 w-5" />
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
