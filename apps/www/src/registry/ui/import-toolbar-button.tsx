'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { getCommentKey } from '@platejs/comment';
import {
  applyTrackedChangeSuggestions,
  type DocxTrackedComment,
  importDocxWithTracking,
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

import type { TComment } from '@/registry/ui/comment';
import {
  type TDiscussion,
  discussionPlugin,
} from '@/registry/components/editor/plugins/discussion-kit';

import { ToolbarButton } from './toolbar';

type ImportType = 'html' | 'markdown';

type TRange = {
  anchor: { offset: number; path: number[] };
  focus: { offset: number; path: number[] };
};

type TPoint = { offset: number; path: number[] };

/** Compare two points to determine order. Returns true if a is after b. */
function isPointAfter(a: TPoint, b: TPoint): boolean {
  for (let i = 0; i < Math.min(a.path.length, b.path.length); i++) {
    if (a.path[i] > b.path[i]) return true;
    if (a.path[i] < b.path[i]) return false;
  }

  if (a.path.length > b.path.length) return true;
  if (a.path.length < b.path.length) return false;

  return a.offset > b.offset;
}

/** Apply DOCX comments to the editor using the discussion plugin */
function applyDocxComments({
  editor,
  comments,
  searchRange: searchRangeFn,
}: {
  editor: ReturnType<typeof useEditorRef>;
  comments: DocxTrackedComment[];
  searchRange: (editor: unknown, search: string) => TRange | null;
}): { applied: number; errors: string[] } {
  const errors: string[] = [];
  let applied = 0;

  // Get existing discussions from the plugin
  const existingDiscussions =
    editor.getOption(discussionPlugin, 'discussions') ?? [];
  const newDiscussions: TDiscussion[] = [];

  for (const comment of comments) {
    try {
      // Find the token ranges
      const startTokenRange = comment.hasStartToken
        ? searchRangeFn(editor, comment.startToken)
        : null;
      const endTokenRange = comment.hasEndToken
        ? searchRangeFn(editor, comment.endToken)
        : null;

      const hasStartMarker = Boolean(startTokenRange);
      const hasEndMarker = Boolean(endTokenRange);

      // Golden rule: if we have ANY location marker, preserve the comment
      if (!startTokenRange && !endTokenRange) {
        errors.push(`Comment ${comment.id}: no location markers found`);
        continue;
      }

      // Use whichever marker we have, fallback to the other for point comments
      const effectiveStartRange = startTokenRange ?? endTokenRange;
      const effectiveEndRange = endTokenRange ?? startTokenRange;

      if (!effectiveStartRange || !effectiveEndRange) {
        errors.push(`Comment ${comment.id}: invalid ranges`);
        continue;
      }

      // Use rangeRef to track ranges through operations
      const startTokenRef = editor.api.rangeRef(effectiveStartRange);
      const endTokenRef = editor.api.rangeRef(effectiveEndRange);

      const currentStartRange = startTokenRef.current;
      const currentEndRange = endTokenRef.current;

      if (!currentStartRange || !currentEndRange) {
        startTokenRef.unref();
        endTokenRef.unref();
        errors.push(`Comment ${comment.id}: ranges became invalid`);
        continue;
      }

      // Create discussion data
      const discussionId = nanoid();
      const userId = comment.authorName ?? 'imported-unknown';
      const createdAt = comment.date ? new Date(comment.date) : new Date();

      // Create the TComment
      const newComment: TComment = {
        id: nanoid(),
        contentRich: [
          {
            type: 'p',
            children: [{ text: comment.text ?? '' }],
          },
        ],
        createdAt,
        discussionId,
        isEdited: false,
        userId,
      };

      // Create TDiscussion
      const discussion: TDiscussion = {
        id: discussionId,
        comments: [newComment],
        createdAt,
        isResolved: false,
        userId,
      };

      newDiscussions.push(discussion);

      // Apply comment marks to the text between tokens
      editor.tf.withMerging(() => {
        const currentStart = startTokenRef.current;
        const currentEnd = endTokenRef.current;

        if (currentStart && currentEnd) {
          let markAnchor = currentStart.focus;
          let markFocus = currentEnd.anchor;

          if (isPointAfter(markAnchor, markFocus)) {
            [markAnchor, markFocus] = [markFocus, markAnchor];
          }

          const markRange = { anchor: markAnchor, focus: markFocus };

          // Apply comment marks: KEYS.comment = true, getCommentKey(discussionId) = true
          editor.tf.setNodes(
            {
              [KEYS.comment]: true,
              [getCommentKey(discussionId)]: true,
            },
            {
              at: markRange,
              match: TextApi.isText,
              split: true,
            }
          );
        }
      });

      // Delete the tokens (only those that actually existed)
      const endRange = endTokenRef.unref();
      const startRange = startTokenRef.unref();

      if (hasEndMarker && endRange) {
        editor.tf.delete({ at: endRange });
      }
      if (hasStartMarker && startRange) {
        editor.tf.delete({ at: startRange });
      }

      applied++;
    } catch (error) {
      errors.push(
        `Comment ${comment.id}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Update discussions in the plugin state
  if (newDiscussions.length > 0) {
    editor.setOption(discussionPlugin, 'discussions', [
      ...existingDiscussions,
      ...newDiscussions,
    ]);
  }

  return { applied, errors };
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
      const result = await importDocxWithTracking(editor, arrayBuffer);

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
        const commentsResult = applyDocxComments({
          editor,
          comments: result.trackedComments,
          searchRange: (_editor, search) =>
            searchRange(editor as Parameters<typeof searchRange>[0], search),
        });

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
