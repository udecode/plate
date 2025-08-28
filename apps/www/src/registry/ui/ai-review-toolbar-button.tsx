'use client';

import * as React from 'react';

import { ToolbarButton } from './toolbar';
import { useCompletion } from '@ai-sdk/react';
import { getEditorPrompt } from '@platejs/ai/react';
import { useEditorRef } from 'platejs/react';

const system = `\
You are an intelligent document review assistant. When given a complete document, your task is to add helpful 
comments by wrapping relevant portions of the original text with <comment value="your comment">original document text</comment>.
Only add comment tags around parts of the original text. Do not alter, delete, or reformat anything else. After removing all comment tags, 
the output must be exactly identical to the input.

Rules:
- You can only add <comment value="...">original document text</comment> MDX tags to provide comments.
- Can NOT comment on images, empty blocks, or other non-text elements like <toc>, <audio>, <video>, etc.
- Comments must NOT contain any Markdown syntax.
- The <comment> tag must NOT be empty; it must contain some text elements.
- Do NOT write self-closing <comment> tags.
- Do NOT remove any line breaks and spaces.
- Do NOT start with \`\`\`markdown.


Correct examples:
- # <comment>heading</comment>.
- <comment value="...">Must include some text</comment>.

INCORRECT EXAMPLES:
- Comments must NOT contain any Markdown syntax.
  <comment># heading</comment>
  <comment>> blockquote</comment>
  <comment>- list</comment>
- Can NOT write empty <comment> tags.
  <comment value="..."></comment>
- Can NOT write self-closing <comment> tags.
  <comment value="..." />
- A comment can NOT span across multiple blocks or include multiple lines.
  <comment value="The author sets specific daily goals for themselves.">1.list1
  2.list2
  3.list3</comment>
`;

const prompt = `{editor}`;

export function AIReviewToolbarButton(
  props: React.ComponentProps<typeof ToolbarButton>
) {
  const editor = useEditorRef();

  const { complete, completion } = useCompletion({
    api: '/api/ai/review',
  });

  const promptText = getEditorPrompt(editor, {
    prompt: prompt,
  });

  const systemText = getEditorPrompt(editor, {
    promptTemplate: () => system,
  });

  return (
    <ToolbarButton
      {...props}
      onClick={() => {
        complete(promptText!, {
          body: {
            system: systemText,
          },
        });
      }}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
    />
  );
}
