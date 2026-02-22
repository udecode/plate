'use client';

import * as React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import { getCommentKey } from '@platejs/comment';
import { importDocxWithTracking } from '@platejs/docx-io';
import { MarkdownPlugin } from '@platejs/markdown';
import { getSuggestionKey } from '@platejs/suggestion';
import { ArrowUpToLineIcon } from 'lucide-react';
import { KEYS, TextApi } from 'platejs';
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

import { commentPlugin } from '@/registry/components/editor/plugins/comment-kit';
import {
  discussionPlugin,
  type TDiscussion,
} from '@/registry/components/editor/plugins/discussion-kit';
import { getDiscussionCounterSeed } from '../lib/discussion-ids';
import { ToolbarButton } from './toolbar';

type ImportType = 'html' | 'markdown';

const WHITESPACE_REGEX = /\s+/;

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

      // Compute next discussion number to avoid ID collisions
      const existingDiscussions =
        editor.getOption(discussionPlugin, 'discussions') ?? [];
      let discussionCounter = getDiscussionCounterSeed(existingDiscussions);

      // Import with full tracking support (suggestions + comments)
      const result = await importDocxWithTracking(editor as any, arrayBuffer, {
        suggestionKey: KEYS.suggestion,
        getSuggestionKey,
        commentKey: KEYS.comment,
        getCommentKey,
        isText: TextApi.isText,
        generateId: () => `discussion${++discussionCounter}`,
      });

      // Register imported users so suggestion/comment UI can resolve them
      if (result.users.length > 0) {
        const existingUsers = editor.getOption(discussionPlugin, 'users') ?? {};
        const updatedUsers = { ...existingUsers };

        for (const user of result.users) {
          if (!updatedUsers[user.id]) {
            updatedUsers[user.id] = {
              id: user.id,
              name: user.name,
              avatarUrl: `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(user.name)}`,
            };
          }
        }

        editor.setOption(discussionPlugin, 'users', updatedUsers);
      }

      // Convert imported discussions to TDiscussion format (empty array if none)
      const newDiscussions: TDiscussion[] = (result.discussions ?? []).map(
        (d) => ({
          id: d.id,
          comments: (d.comments ?? []).map((c, index) => ({
            id: c.id || `comment${index + 1}`,
            contentRich:
              c.contentRich as TDiscussion['comments'][number]['contentRich'],
            createdAt: c.createdAt ?? new Date(),
            discussionId: d.id,
            isEdited: false,
            userId: c.userId ?? c.user?.id ?? 'imported-unknown',
            authorName: c.user?.name,
            authorInitials: c.user?.name
              ? c.user.name
                  .split(WHITESPACE_REGEX)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase() ?? '')
                  .join('')
              : undefined,
            paraId: c.paraId,
            parentParaId: c.parentParaId,
          })),
          createdAt: d.createdAt ?? new Date(),
          documentContent: d.documentContent,
          isResolved: false,
          userId: d.userId ?? d.user?.id ?? 'imported-unknown',
          authorName: d.user?.name,
          authorInitials: d.user?.name
            ? d.user.name
                .split(WHITESPACE_REGEX)
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase() ?? '')
                .join('')
            : undefined,
          paraId: d.paraId,
        })
      );

      // Replace all discussions (not append) because importDocxWithTracking
      // replaces the entire editor content, making old discussions stale
      editor.setOption(discussionPlugin, 'discussions', newDiscussions);
      editor.setOption(commentPlugin, 'uniquePathMap', new Map());

      // Log import results in dev only
      if (
        result.hasTracking &&
        result.errors.length > 0 &&
        process.env.NODE_ENV !== 'production'
      ) {
        console.warn('[DOCX Import] Errors:', result.errors);
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
