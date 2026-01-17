'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { importDocx, importHtml, importMarkdown } from '@platejs/docx-import';
import { ArrowUpToLineIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ToolbarButton } from './toolbar';

type ImportType = 'docx' | 'html' | 'markdown';

export function ImportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const handleImport = React.useCallback(
    async (file: File, type: ImportType) => {
      try {
        if (type === 'docx') {
          const arrayBuffer = await file.arrayBuffer();
          const result = await importDocx(editor, arrayBuffer);

          if (result.warnings.length > 0) {
            console.warn('DOCX import warnings:', result.warnings);
          }

          editor.tf.insertNodes(result.nodes);

          if (result.comments.length > 0) {
            console.info(
              `DOCX contains ${result.comments.length} comments (not imported)`
            );
          }

          toast.success('DOCX file imported successfully');
        } else if (type === 'html') {
          const text = await file.text();
          const result = importHtml(editor, text);
          editor.tf.insertNodes(result.nodes);
          toast.success('HTML file imported successfully');
        } else if (type === 'markdown') {
          const text = await file.text();
          const result = importMarkdown(editor, text);
          editor.tf.insertNodes(result.nodes);
          toast.success('Markdown file imported successfully');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import file');
      }
    },
    [editor]
  );

  const { openFilePicker: openDocxFilePicker } = useFilePicker({
    accept: ['.docx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      await handleImport(plainFiles[0], 'docx');
    },
  });

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ['text/html'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      await handleImport(plainFiles[0], 'html');
    },
  });

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      await handleImport(plainFiles[0], 'markdown');
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Import" isDropdown>
          <ArrowUpToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => openDocxFilePicker()}>
            Import from DOCX
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => openHtmlFilePicker()}>
            Import from HTML
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => openMdFilePicker()}>
            Import from Markdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
