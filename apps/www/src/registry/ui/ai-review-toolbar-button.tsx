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
你是一名文档审阅助手。  
你将收到一个用 <block id="..."> 内容 </block> 标签包裹的 MDX 文档。  

你的任务：  
- 阅读所有 block 的内容并提供评论。  
- 对于每条评论，生成一个 JSON 对象：  
  - blockId：被评论的 block 的 id。
  - content：需要评论的原始文档片段。
  - comments：对该片段的简要评论或说明。

规则：
- content 字段必须是 block 标签内的原始内容。返回的内容不能包含 block 标签，但应保留其他 MDX 标签。
- content 字段可以是整个 block、block 内的一小段，或跨越多个 block。如果跨越多个 block，请用两个 \n\n 分隔。
- 重要：如果评论跨越多个 block，请使用**第一个** block 的 id。
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

          // 生成新的讨论ID
          const discussionId = nanoid();

          // 创建新的评论
          const newComment = {
            id: nanoid(),
            contentRich: [{ children: [{ text: comment }], type: 'p' }],
            createdAt: new Date(),
            discussionId,
            isEdited: false,
            userId: editor.getOption(discussionPlugin, 'currentUserId'),
          };

          // 创建新的讨论
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

          // 更新讨论数据
          const updatedDiscussions = [...discussions, newDiscussion];
          editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);

          // 在编辑器中应用评论标记
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
