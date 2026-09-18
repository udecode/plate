'use client';

import { ArrowUpToLineIcon } from 'lucide-react';
import { HtmlPlugin } from 'platejs';
import { MarkdownPlugin } from 'platejs/markdown';
import { useEditor, useModelEditor } from 'platejs/react';
import { getEditorDOMFromHtmlString } from 'platejs/static';
import * as React from 'react';
import { toast } from 'sonner';
import { useFilePicker } from 'use-file-picker';

import { useDocxSource } from '@/registry/components/editor/docx-source';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/components/editor/dropdown-menu';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

export function ImportToolbarButton() {
  const editor = useEditor();
  const model = useModelEditor();
  const [open, setOpen] = React.useState(false);
  const docxSource = useDocxSource();
  const markdownApi = editor.plugin(MarkdownPlugin).api;

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const text = await plainFiles[0].text();
      const nodes = markdownApi.deserialize(text).children;

      editor.update.fragment.replace(nodes);
      docxSource?.replaceSource(null);
    },
  });

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ['text/html'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const text = await plainFiles[0].text();
      const editorNode = getEditorDOMFromHtmlString(text);
      const nodes = editor.plugin(HtmlPlugin).api.deserialize({
        element: editorNode,
      });

      if (nodes === null) return;

      editor.update.fragment.replace(nodes);
      docxSource?.replaceSource(null);
    },
  });

  const { openFilePicker: openDocxFilePicker } = useFilePicker({
    accept: ['.docx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      const [{ importDocx }, arrayBuffer] = await Promise.all([
        import('platejs/docx/import'),
        plainFiles[0].arrayBuffer(),
      ]);
      const result = await importDocx(model, arrayBuffer, {
        retainSource: docxSource !== null,
      });

      if (!result.ok) {
        toast.error(
          result.diagnostics.find(({ severity }) => severity === 'error')
            ?.message ?? 'The Word document could not be imported.'
        );

        return;
      }

      model.update.value.replace(result.document);
      if (docxSource && 'source' in result) {
        docxSource.replaceSource(result.source);
      }

      const warningCount = result.diagnostics.filter(
        ({ severity }) => severity === 'warning'
      ).length;

      if (result.comments.length > 0 || warningCount > 0) {
        toast.info(
          `Imported ${result.comments.length} comment${
            result.comments.length === 1 ? '' : 's'
          } with ${warningCount} warning${warningCount === 1 ? '' : 's'}.`
        );
      }
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger>
        <ToolbarButton
          aria-label="Import"
          pressed={open}
          tooltip="Import"
          isDropdown
        >
          <ArrowUpToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              openHtmlFilePicker();
            }}
          >
            Import from HTML
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              openMdFilePicker();
            }}
          >
            Import from Markdown
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              openDocxFilePicker();
            }}
          >
            Import from Word
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
