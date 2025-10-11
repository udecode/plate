import type {
  ChatMessage,
  ToolName,
} from '@/registry/components/editor/use-chat';
import type { NextRequest } from 'next/server';

import { getMarkdown } from '@platejs/ai';
import {
  type UIMessageStreamWriter,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  streamObject,
  streamText,
  tool,
} from 'ai';
import { NextResponse } from 'next/server';
import { type SlateEditor, createSlateEditor, nanoid } from 'platejs';
import { z } from 'zod';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';
import { markdownJoinerTransform } from '@/registry/lib/markdown-joiner-transform';

import {
  getChooseToolPrompt,
  getCommentPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from './prompts';

export async function POST(req: NextRequest) {
  const { apiKey: key, ctx, messages: messagesRaw } = await req.json();

  const { children, selection, toolName: toolNameParam } = ctx;

  const editor = createSlateEditor({
    plugins: BaseEditorKit,
    selection,
    value: children,
  });

  const apiKey = key || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing AI Gateway API key.' },
      { status: 401 }
    );
  }

  const isSelecting = editor.api.isExpanded();

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        let toolName = toolNameParam;

        if (!toolName) {
          const { object: AIToolName } = await generateObject({
            enum: isSelecting
              ? ['generate', 'edit', 'comment']
              : ['generate', 'comment'],
            model: 'google/gemini-2.5-flash',
            output: 'enum',
            prompt: getChooseToolPrompt(messagesRaw),
          });

          writer.write({
            data: AIToolName as ToolName,
            type: 'data-toolName',
          });

          toolName = AIToolName;
        }

        const s = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: 'google/gemini-2.5-flash',
          // Not used
          prompt: '',
          tools: {
            comment: getCommentTool(editor, { messagesRaw, writer }),
          },
          prepareStep: async (step) => {
            if (toolName === 'comment') {
              return {
                ...step,
                toolChoice: { toolName: 'comment', type: 'tool' },
              };
            }

            if (toolName === 'edit') {
              const editPrompt = getEditPrompt(
                editor,
                messagesRaw,
                isSelecting
              );

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: editPrompt,
                    role: 'user',
                  },
                ],
              };
            }

            if (toolName === 'generate') {
              const generatePrompt = getGeneratePrompt(editor, messagesRaw);

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: generatePrompt,
                    role: 'user',
                  },
                ],
                model: 'openai/gpt-4o-mini',
              };
            }
          },
        });

        writer.merge(s.toUIMessageStream({ sendFinish: false }));
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch {
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

const getCommentTool = (
  editor: SlateEditor,
  {
    messagesRaw,
    writer,
  }: { messagesRaw: ChatMessage[]; writer: UIMessageStreamWriter<ChatMessage> }
) => {
  return tool({
    description: 'Comment on the content',
    inputSchema: z.object({}),
    execute: async () => {
      const selectingMarkdown = getMarkdown(editor, {
        type: 'blockWithBlockId',
      });

      const { elementStream } = streamObject({
        model: 'google/gemini-2.5-flash',
        output: 'array',
        prompt: getCommentPrompt(selectingMarkdown, messagesRaw),
        schema: z
          .object({
            blockId: z
              .string()
              .describe(
                'The id of the starting block. If the comment spans multiple blocks, use the id of the first block.'
              ),
            comment: z
              .string()
              .describe('A brief comment or explanation for this fragment.'),
            content: z
              .string()
              .describe(
                String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
              ),
          })
          .describe('A single comment'),
      });

      for await (const comment of elementStream) {
        const commentDataId = nanoid();

        writer.write({
          id: commentDataId,
          data: comment,
          type: 'data-comment',
        });
      }
    },
  });
};
