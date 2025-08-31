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

export function AIReviewToolbarButton(
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
          console.log('🚀 ~ AIReviewToolbarButton ~ aiComment:', aiComment);
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
    />
  );
}
