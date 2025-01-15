'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { getEditorDOMFromHtmlString } from '@udecode/plate';
import { useEditorRef } from '@udecode/plate/react';
import { ArrowUpToLineIcon } from 'lucide-react';
import { useFilePicker } from 'use-file-picker';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export function ImportToolbarButton({ children, ...props }: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const { openFilePicker } = useFilePicker({
    accept: ['text/html'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const editorNode = getEditorDOMFromHtmlString(text);

      const nodes = editor.api.html.deserialize({
        collapseWhiteSpace: false,
        element: editorNode,
      });

      editor.tf.insertNodes(nodes);
    },
  });

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Import" isDropdown>
          <ArrowUpToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              openFilePicker();
            }}
          >
            Import from HTML
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            Import from Markdown{' '}
            <span className="text-xs text-muted-foreground">(coming soon)</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
