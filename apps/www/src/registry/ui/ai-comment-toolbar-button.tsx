'use client';

import * as React from 'react';

import {
  AIChatPlugin,
  aiCommentToRange,
  getEditorPrompt,
} from '@platejs/ai/react';
import { getCommentKey, getTransientCommentKey } from '@platejs/comment';
import { deserializeMd, MarkdownPlugin } from '@platejs/markdown';
import {
  type TNode,
  KEYS,
  nanoid,
  NodeApi,
  SlateEditor,
  TextApi,
} from 'platejs';
import { PlateEditor, useEditorRef, usePluginOption } from 'platejs/react';

import { useEditorCommentChat } from '@/registry/components/editor/use-editor-comment-chat';

import { discussionPlugin } from '@/registry/components/editor/plugins/discussion-kit';
import { ToolbarButton } from './toolbar';
import { BlockSelectionPlugin } from '@platejs/selection/react';

export function AICommentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  const chat = usePluginOption(AIChatPlugin, 'chat');

  const { startCommentGeneration } = useEditorCommentChat({
    chat,
    onNewComment: (aiComment) => {
      aiCommentToRange(editor, aiComment, ({ comment, range }) => {
        if (range) {
          const discussions =
            editor.getOption(discussionPlugin, 'discussions') || [];

          // Generate a new discussion ID
          const discussionId = nanoid();

          // Create a new comment
          const newComment = {
            id: nanoid(),
            contentRich: [{ children: [{ text: comment }], type: 'p' }],
            createdAt: new Date(),
            discussionId,
            isEdited: false,
            userId: editor.getOption(discussionPlugin, 'currentUserId'),
          };

          // Create a new discussion
          const newDiscussion = {
            id: discussionId,
            comments: [newComment],
            createdAt: new Date(),
            documentContent: deserializeMd(editor, aiComment.content)
              .map((node: TNode) => NodeApi.string(node))
              .join('\n'),
            isResolved: false,
            userId: editor.getOption(discussionPlugin, 'currentUserId'),
          };

          // Update discussions
          const updatedDiscussions = [...discussions, newDiscussion];
          editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);

          // Apply comment marks to the editor
          editor.tf.withMerging(() => {
            editor.tf.setNodes(
              {
                [KEYS.comment]: true,
                [getCommentKey(newDiscussion.id)]: true,
                [getTransientCommentKey()]: true,
              },
              {
                at: range,
                match: TextApi.isText,
                split: true,
              }
            );
          });
        } else {
          console.warn('no range found');
        }
      });
    },
  });

  return (
    <ToolbarButton
      {...props}
      onClick={async () => {
        const commentPrompt = `
          This is for testing purposes, so please include all three types of comments.
          1. Comment on the entire block.
          2. Comment on a small part of the block.
          3. Comment on multiple blocks of the document.
          `;

        const aiCommentPrompt = getEditorPrompt(editor, {
          prompt: commentPrompt,
          promptTemplate: editor.getOption(
            AIChatPlugin,
            'commentPromptTemplate'
          ),
        });

        startCommentGeneration({ commentPrompt: aiCommentPrompt! });
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <AICommentIcon />
    </ToolbarButton>
  );
}

const AICommentIcon = () => (
  <svg
    fill="none"
    height="24"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
    <path d="M8 9h8" />
    <path d="M8 13h4.5" />
    <path d="M10 19l-1 -1h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v4.5" />
    <path d="M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
  </svg>
);
