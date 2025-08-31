'use client';

import * as React from 'react';
import { ToolbarButton } from './toolbar';
import { aiReviewToRange, getEditorPrompt } from '@platejs/ai/react';
import { useEditorRef } from 'platejs/react';
import { deserializeMd } from '@platejs/markdown';

import { KEYS, nanoid, NodeApi, TextApi, TNode } from 'platejs';

import { useStreamObject } from '@/registry/hooks/useStreamObject';
import { aiReviewPlugin } from '../components/editor/plugins/ai-kit';
import { discussionPlugin } from '../components/editor/plugins/discussion-kit';
import { getCommentKey } from '@platejs/comment';

const system = `\
You are a document review assistant.  
You will receive an MDX document wrapped in <block id="..."> content </block> tags.  

Your task:  
- Read the content of all blocks and provide comments.  
- For each comment, generate a JSON object:  
  - blockId: the id of the block being commented on.
  - content: the original document fragment that needs commenting.
  - comments: a brief comment or explanation for that fragment.

Rules:
- The content field must be the original content inside the block tag. The returned content must not include the block tags, but should retain other MDX tags.
- The content field can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.
- Important: If a comment spans multiple blocks, use the id of the **first** block.
`;

const prompt = `
{editor}
`;

export function AICommentToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  const streamObjectResult = useStreamObject({
    onError: (error) => {
      console.error('AI Review error:', error);
    },
    onNewComment: (aiComment) => {
      aiReviewToRange(editor, aiComment, ({ comment, range }) => {
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
          editor.tf.setNodes(
            {
              [getCommentKey(newDiscussion.id)]: true,
              [KEYS.comment]: true,
            },
            {
              at: range,
              match: TextApi.isText,
              split: true,
            }
          );
        } else {
          console.warn('no range found');
        }
      });
    },
  });

  const { status, streamObject } = streamObjectResult;

  React.useEffect(() => {
    editor.setOption(aiReviewPlugin, 'streamObject', streamObjectResult);
  }, [status]);

  return (
    <ToolbarButton
      {...props}
      onClick={async () => {
        const promptText = getEditorPrompt(editor, {
          prompt,
          options: { withBlockId: true },
        });

        const systemText = getEditorPrompt(editor, {
          promptTemplate: () => system,
        });

        await streamObject(promptText!, systemText!);
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

const AISuggestionIcon = () => (
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
    <path d="M17.5 10.5l1 -1a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4h4l2 -2" />
    <path d="M13.5 6.5l4 4" />
    <path d="M17.8 20.817l-2.172 1.138a.392 .392 0 0 1 -.568 -.41l.415 -2.411l-1.757 -1.707a.389 .389 0 0 1 .217 -.665l2.428 -.352l1.086 -2.193a.392 .392 0 0 1 .702 0l1.086 2.193l2.428 .352a.39 .39 0 0 1 .217 .665l-1.757 1.707l.414 2.41a.39 .39 0 0 1 -.567 .411l-2.172 -1.138z" />
  </svg>
);
