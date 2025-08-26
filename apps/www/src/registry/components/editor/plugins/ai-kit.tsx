'use client';

import type { AIChatPluginConfig } from '@platejs/ai/react';
import type { UseChatOptions } from 'ai/react';

import { streamInsertChunk, withAIBatch } from '@platejs/ai';
import {
  AIChatPlugin,
  AIPlugin,
  AIReviewPlugin,
  useChatChunk,
} from '@platejs/ai/react';
import { getPluginType, KEYS, PathApi } from 'platejs';
import { usePluginOption } from 'platejs/react';

import { AILoadingBar, AIMenu } from '@/registry/ui/ai-menu';
import { AIAnchorElement, AILeaf } from '@/registry/ui/ai-node';

import { CursorOverlayKit } from './cursor-overlay-kit';
import { MarkdownKit } from './markdown-kit';
import { AIReviewPreview } from '@/registry/ui/ai-review-preview';

export const aiChatPlugin = AIChatPlugin.extend({
  options: {
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    } as UseChatOptions,
    promptTemplate: ({ isBlockSelecting, isSelecting }) => {
      return isBlockSelecting
        ? PROMPT_TEMPLATES.userBlockSelecting
        : isSelecting
          ? PROMPT_TEMPLATES.userSelecting
          : PROMPT_TEMPLATES.userDefault;
    },
    systemTemplate: ({ isBlockSelecting, isSelecting }) => {
      return isBlockSelecting
        ? PROMPT_TEMPLATES.systemBlockSelecting
        : isSelecting
          ? PROMPT_TEMPLATES.systemSelecting
          : PROMPT_TEMPLATES.systemDefault;
    },
  },
  render: {
    afterContainer: AILoadingBar,
    afterEditable: AIMenu,
    node: AIAnchorElement,
  },
  shortcuts: { show: { keys: 'mod+j' } },
  useHooks: ({ editor, getOption }) => {
    const mode = usePluginOption(
      { key: KEYS.aiChat } as AIChatPluginConfig,
      'mode'
    );

    useChatChunk({
      onChunk: ({ chunk, isFirst, nodes }) => {
        if (isFirst && mode == 'insert') {
          editor.tf.withoutSaving(() => {
            editor.tf.insertNodes(
              {
                children: [{ text: '' }],
                type: getPluginType(editor, KEYS.aiChat),
              },
              {
                at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
              }
            );
          });
          editor.setOption(AIChatPlugin, 'streaming', true);
        }

        if (mode === 'insert' && nodes.length > 0) {
          withAIBatch(
            editor,
            () => {
              if (!getOption('streaming')) return;
              editor.tf.withScrolling(() => {
                streamInsertChunk(editor, chunk, {
                  textProps: {
                    [getPluginType(editor, KEYS.ai)]: true,
                  },
                });
              });
            },
            { split: isFirst }
          );
        }
      },
      onFinish: () => {
        editor.setOption(AIChatPlugin, 'streaming', false);
        editor.setOption(AIChatPlugin, '_blockChunks', '');
        editor.setOption(AIChatPlugin, '_blockPath', null);
      },
    });
  },
});

export const AIKit = [
  ...CursorOverlayKit,
  ...MarkdownKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPlugin,
  AIReviewPlugin.configure({
    render: {
      afterContainer: AIReviewPreview,
    },
    options: {
      promptTemplate: () => AI_REVIEW_PROMPT_TEMPLATES.userComment,
      systemTemplate: () => AI_REVIEW_PROMPT_TEMPLATES.systemComment,
    },
  }),
];

const systemCommon = `\
You are an advanced AI-powered note-taking assistant, designed to enhance productivity and creativity in note management.
Respond directly to user prompts with clear, concise, and relevant content. Maintain a neutral, helpful tone.

Rules:
- <Document> is the entire note the user is working on.
- <Reminder> is a reminder of how you should reply to INSTRUCTIONS. It does not apply to questions.
- Anything else is the user prompt.
- Your response should be tailored to the user's prompt, providing precise assistance to optimize note management.
- For INSTRUCTIONS: Follow the <Reminder> exactly. Provide ONLY the content to be inserted or replaced. No explanations or comments.
- For QUESTIONS: Provide a helpful and concise answer. You may include brief explanations if necessary.
- CRITICAL: DO NOT remove or modify the following custom MDX tags: <u>, <callout>, <kbd>, <toc>, <sub>, <sup>, <mark>, <del>, <date>, <span>, <column>, <column_group>, <file>, <audio>, <video> in <Selection> unless the user explicitly requests this change.
- CRITICAL: Distinguish between INSTRUCTIONS and QUESTIONS. Instructions typically ask you to modify or add content. Questions ask for information or clarification.
- CRITICAL: when asked to write in markdown, do not start with \`\`\`markdown.
- CRITICAL: When writing the column, such line breaks and indentation must be preserved.
<column_group>
  <column>
    1
  </column>
  <column>
    2
  </column>
  <column>
    3
  </column>
</column_group>
`;

const systemDefault = `\
${systemCommon}
- <Block> is the current block of text the user is working on.
- Ensure your output can seamlessly fit into the existing <Block> structure.

<Block>
{block}
</Block>
`;

const systemSelecting = `\
${systemCommon}
- <Block> is the block of text containing the user's selection, providing context.
- Ensure your output can seamlessly fit into the existing <Block> structure.
- <Selection> is the specific text the user has selected in the block and wants to modify or ask about.
- Consider the context provided by <Block>, but only modify <Selection>. Your response should be a direct replacement for <Selection>.
<Block>
{block}
</Block>
<Selection>
{selection}
</Selection>
`;

const systemBlockSelecting = `\
${systemCommon}
- <Selection> represents the full blocks of text the user has selected and wants to modify or ask about.
- Your response should be a direct replacement for the entire <Selection>.
- Maintain the overall structure and formatting of the selected blocks, unless explicitly instructed otherwise.
- CRITICAL: Provide only the content to replace <Selection>. Do not add additional blocks or change the block structure unless specifically requested.
<Selection>
{block}
</Selection>
`;

const userDefault = `<Reminder>
CRITICAL: NEVER write <Block>.
</Reminder>
{prompt}`;
const userSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the text to replace <Selection>. No explanations.
Ensure it fits seamlessly within <Block>. If <Block> is empty, write ONE random sentence.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about <Selection>`;

const userBlockSelecting = `<Reminder>
If this is a question, provide a helpful and concise answer about <Selection>.
If this is an instruction, provide ONLY the content to replace the entire <Selection>. No explanations.
Maintain the overall structure unless instructed otherwise.
NEVER write <Block> or <Selection>.
</Reminder>
{prompt} about <Selection>`;

export const PROMPT_TEMPLATES = {
  systemBlockSelecting,
  systemDefault,
  systemSelecting,
  userBlockSelecting,
  userDefault,
  userSelecting,
};

const systemComment = `\
You are an intelligent document review assistant. When given a complete document, your task is to add helpful 
comments by wrapping relevant portions of the original text with <comment value="your comment">original document text</comment>.
Only add comment tags around parts of the original text. Do not alter, delete, or reformat anything else. After removing all comment tags, 
the output must be exactly identical to the input.

IMPORTANT RULES:
- You can only add <comment value="..."> </comment> MDX tags to provide comments.
- Can NOT comment on images, empty blocks, or other non-text elements like <toc>, <audio>, <video>, etc.
- Comments must NOT contain any Markdown syntax.
- The <comment> tag must NOT be empty; it must contain some text elements.
- Do NOT write self-closing <comment> tags.
- Do NOT remove any line breaks and spaces.

Correct examples:
- # <comment>heading</comment>.
- <comment value="...">any text</comment>.

Incorrect examples:
- <comment># heading</comment>
- <comment value="..."></comment>
- <comment value="..." />
`;

const userComment = `{editor}`;

const AI_REVIEW_PROMPT_TEMPLATES = {
  systemComment,
  userComment,
};
