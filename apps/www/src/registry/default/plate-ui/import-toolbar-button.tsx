'use client';

import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { getEditorDOMFromHtmlString } from '@udecode/plate';
import { useEditorRef } from '@udecode/plate/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
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

type ImportType = 'html' | 'markdown';

export function ImportToolbarButton({ children, ...props }: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const [type, setType] = React.useState<ImportType>('html');
  const accept = type === 'html' ? ['text/html'] : ['.md'];

  const getFileNodes = (text: string, type: ImportType) => {
    if (type === 'html') {
      const editorNode = getEditorDOMFromHtmlString(text);
      const nodes = editor.api.html.deserialize({
        element: editorNode,
      });

      return nodes;
    }

    const nodes = editor.getApi(MarkdownPlugin).markdown.deserialize(text);

    return nodes;
  };

  const { openFilePicker } = useFilePicker({
    accept,
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, type);

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
              setType('html');
              openFilePicker();
            }}
          >
            Import from HTML
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              setType('markdown');
              openFilePicker();
            }}
          >
            Import from Markdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
