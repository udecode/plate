'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { getCommentKey } from '@platejs/comment';
import {
  applyTrackedChangeSuggestions,
  applyTrackedCommentsLocal,
  type DocxImportDiscussion,
  type DocxTrackedComment,
  importDocx,
  searchRange,
} from '@platejs/docx-io';
import { MarkdownPlugin } from '@platejs/markdown';
import { getSuggestionKey } from '@platejs/suggestion';
import { ArrowUpToLineIcon } from 'lucide-react';
import { KEYS, nanoid, TextApi } from 'platejs';
import { useEditorRef } from 'platejs/react';
import { getEditorDOMFromHtmlString } from 'platejs/static';
import { useFilePicker } from 'use-file-picker';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  type TDiscussion,
  discussionPlugin,
} from '@/registry/components/editor/plugins/discussion-kit';

import { ToolbarButton } from './toolbar';

type ImportType = 'html' | 'markdown';

/**
 * Convert DocxImportDiscussion to TDiscussion format for plugin storage.
 */
function convertToTDiscussion(
  docxDiscussion: DocxImportDiscussion
): TDiscussion {
  return {
    id: docxDiscussion.id,
    comments:
      docxDiscussion.comments?.map((comment, index) => ({
        id: `${docxDiscussion.id}-comment-${index}`,
        contentRich: comment.contentRich as TDiscussion['comments'][0]['contentRich'],
        createdAt: comment.createdAt ?? new Date(),
        discussionId: docxDiscussion.id,
        isEdited: false,
        userId: comment.userId ?? 'imported-unknown',
        // Pass direct author info from DOCX
        authorName: comment.user?.name,
      })) ?? [],
    createdAt: docxDiscussion.createdAt ?? new Date(),
    documentContent: docxDiscussion.documentContent,
    isResolved: false,
    userId: docxDiscussion.userId ?? 'imported-unknown',
    // Pass direct author info from DOCX
    authorName: docxDiscussion.user?.name,
  };
}

export function ImportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  const getFileNodes = (text: string, type: ImportType) => {
    if (type === 'html') {
      const editorNode = getEditorDOMFromHtmlString(text);
      const nodes = editor.api.html.deserialize({
        element: editorNode,
      });

      return nodes;
    }

    if (type === 'markdown') {
      return editor.getApi(MarkdownPlugin).markdown.deserialize(text);
    }

    return [];
  };

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: ['.md', '.mdx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, 'markdown');

      editor.tf.insertNodes(nodes);
    },
  });

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ['text/html'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, 'html');

      editor.tf.insertNodes(nodes);
    },
  });

  const { openFilePicker: openDocxFilePicker } = useFilePicker({
    accept: ['.docx'],
    multiple: false,
    onFilesSelected: async ({ plainFiles }) => {
      const arrayBuffer = await plainFiles[0].arrayBuffer();
      const result = await importDocx(editor, arrayBuffer);

      // Insert the deserialized nodes
      editor.tf.insertNodes(result.nodes as typeof editor.children);

      // Apply tracked changes (suggestions) if any were found
      if (result.hasTracking && result.trackedChanges.length > 0) {
        const suggestionsResult = applyTrackedChangeSuggestions({
          editor: editor as Parameters<
            typeof applyTrackedChangeSuggestions
          >[0]['editor'],
          changes: result.trackedChanges,
          searchRange: (_editor, search) =>
            searchRange(editor as Parameters<typeof searchRange>[0], search),
          suggestionKey: KEYS.suggestion,
          getSuggestionKey,
          isText: TextApi.isText,
        });

        // Log results for debugging
        if (suggestionsResult.total > 0) {
          console.log(
            `[DOCX Import] Applied ${suggestionsResult.insertions} insertions, ${suggestionsResult.deletions} deletions`
          );
        }
        if (suggestionsResult.errors.length > 0) {
          console.warn('[DOCX Import] Errors:', suggestionsResult.errors);
        }
      }

      // Apply comments if any were found
      if (result.trackedComments.length > 0) {
        // Use file's last modified date as fallback for comment dates
        // (Word doesn't export dates on w:comment elements)
        const documentDate = plainFiles[0].lastModified
          ? new Date(plainFiles[0].lastModified)
          : new Date();

        // Get existing discussions from the plugin
        const existingDiscussions =
          editor.getOption(discussionPlugin, 'discussions') ?? [];

        const commentsResult = applyTrackedCommentsLocal({
          editor: editor as Parameters<
            typeof applyTrackedCommentsLocal
          >[0]['editor'],
          comments: result.trackedComments as DocxTrackedComment[],
          searchRange: (_editor, search) =>
            searchRange(editor as Parameters<typeof searchRange>[0], search),
          commentKey: KEYS.comment,
          getCommentKey,
          isText: TextApi.isText,
          generateId: nanoid,
          documentDate,
        });

        // Convert and store discussions in plugin state
        if (commentsResult.discussions.length > 0) {
          const newDiscussions = commentsResult.discussions.map(
            convertToTDiscussion
          );
          editor.setOption(discussionPlugin, 'discussions', [
            ...existingDiscussions,
            ...newDiscussions,
          ]);
        }

        if (commentsResult.applied > 0) {
          // eslint-disable-next-line no-console
          console.log(
            `[DOCX Import] Applied ${commentsResult.applied} comments`
          );
        }
        if (commentsResult.errors.length > 0) {
          console.warn('[DOCX Import] Comment errors:', commentsResult.errors);
        }
      }
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
