'use client';

import * as React from 'react';
import { ToolbarButton } from './toolbar';
import { aiReviewToRange, getEditorPrompt } from '@platejs/ai/react';
import { PlateEditor, useEditorRef } from 'platejs/react';
import { deserializeMd } from '@platejs/markdown';

import {
  Descendant,
  ElementApi,
  KEYS,
  NodeApi,
  PathApi,
  Range,
  TextApi,
  TText,
} from 'platejs';

import { useStreamObject } from '@/registry/hooks/useStreamObject';

const system = `\
You are a document review assistant.  
You will receive an MDX document wrapped in <block id="..."> content </block> tags.  

Your task:  
- Read the content of all blocks and provide comments.  
- For each comment, generate a JSON object:  
  - blockId: The id of the block being commented on.
  - content: The original document fragment to be commented on.
  - comments: A brief comment or explanation for the fragment.


Important rules:
- The content field must be the original content inside the block tag. The returned content must not include the block tags, but other MDX tags should be preserved.
- Important: The content field can be the entire block, a small segment within a block, or span across multiple blocks. If spanning multiple blocks, separate them with two \n\n.
- Important: If the comment spans multiple blocks, please use the **first** block's id.
`;

const prompt = `
This test is to check whether the content is generated correctly, so please generate all three types of content:
1. The entire block
2. A small segment within a block
3. Spanning multiple blocks


{editor}
`;

export function AIReviewToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  const { streamObject, object, status, error, stop, comments } =
    useStreamObject({
      onError: (error) => {
        console.error('AI Review error:', error);
      },
      onNewComment: (aiComment) => {
        aiReviewToRange(editor, aiComment, ({ comment, range }) => {
          editor.tf.setNodes(
            {
              [KEYS.comment]: true,
              comment_ai: true,
            },
            { at: range, match: (n) => TextApi.isText(n), split: true }
          );
        });
      },
    });

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
