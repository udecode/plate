import { createGateway } from '@ai-sdk/gateway';
import {
  type LanguageModel,
  type UIMessageStreamWriter,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  Output,
  streamText,
  tool,
} from 'ai';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createEditor, nanoid } from 'platejs';
import {
  type AIChatRequestContext,
  type AIChatRequestRefs,
  resolveAIChatRequestContext,
} from 'platejs/ai';
import type { MarkdownEditor } from 'platejs/markdown';
import { z } from 'zod';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';
import type {
  ChatMessage,
  ToolName,
} from '@/registry/components/editor/use-chat';
import { markdownJoinerTransform } from '@/registry/lib/markdown-joiner-transform';

import { getChooseToolPrompt } from './prompt/getChooseToolPrompt';
import { getCommentPrompt } from './prompt/getCommentPrompt';
import { getEditPrompt } from './prompt/getEditPrompt';
import { buildEditTableMultiCellPrompt } from './prompt/getEditTablePrompt';
import { getGeneratePrompt } from './prompt/getGeneratePrompt';

const toolNameSchema = z.enum(['comment', 'edit', 'generate']);

export async function POST(req: NextRequest) {
  const { apiKey: key, ctx, messages: messagesRaw, model } = await req.json();

  const {
    children,
    nodeSelection,
    refs,
    selection,
    toolName: toolNameParam,
  } = ctx as AIChatRequestContext;
  const request = resolveAIChatRequestContext({ nodeSelection, selection });
  const { isSelecting } = request;

  const editor = createEditor({
    plugins: BaseEditorKit,
    selection: request.selection,
    initialValue: children,
  });

  const apiKey = key || process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing AI Gateway API key.' },
      { status: 401 }
    );
  }

  const gatewayProvider = createGateway({
    apiKey,
  });

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        let toolName = toolNameParam;

        if (!toolName) {
          const prompt = getChooseToolPrompt({
            isSelecting,
            messages: messagesRaw,
          });

          const enumOptions: ToolName[] = isSelecting
            ? ['generate', 'edit', 'comment']
            : ['generate', 'comment'];
          const modelId = model || 'google/gemini-2.5-flash';

          const { output } = await generateText({
            model: gatewayProvider(modelId),
            output: Output.choice({ options: enumOptions }),
            prompt,
          });
          const selectedToolName = toolNameSchema.parse(output);

          writer.write({
            data: selectedToolName,
            type: 'data-toolName',
          });

          toolName = selectedToolName;
        }

        const innerStream = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: gatewayProvider(model || 'openai/gpt-4o-mini'),
          // Not used
          prompt: '',
          tools: {
            comment: getCommentTool(editor, {
              messagesRaw,
              model: gatewayProvider(model || 'google/gemini-2.5-flash'),
              refs: refs.blocks,
              writer,
            }),
            table: getTableTool(editor, {
              messagesRaw,
              model: gatewayProvider(model || 'google/gemini-2.5-flash'),
              refs: refs.tableCells,
              writer,
            }),
          },
          prepareStep: (step) => {
            if (toolName === 'comment') {
              // The selection task is more challenging, so use Gemini 2.5 Flash.
              return {
                ...step,
                toolChoice: { toolName: 'comment', type: 'tool' },
              };
            }

            if (toolName === 'edit') {
              const [editPrompt, editType] = getEditPrompt(editor, {
                isSelecting,
                messages: messagesRaw,
                tableCellRefs: refs.tableCells,
              });

              // Table editing uses the table tool
              if (editType === 'table') {
                return {
                  ...step,
                  toolChoice: { toolName: 'table', type: 'tool' },
                };
              }

              return {
                ...step,
                activeTools: [],
                model:
                  editType === 'selection'
                    ? gatewayProvider(model || 'google/gemini-2.5-flash')
                    : gatewayProvider(model || 'openai/gpt-4o-mini'),
                messages: [
                  {
                    content: editPrompt,
                    role: 'user',
                  },
                ],
              };
            }

            if (toolName === 'generate') {
              const generatePrompt = getGeneratePrompt(editor, {
                isSelecting,
                messages: messagesRaw,
              });

              return {
                ...step,
                activeTools: [],
                messages: [
                  {
                    content: generatePrompt,
                    role: 'user',
                  },
                ],
                model: gatewayProvider(model || 'openai/gpt-4o-mini'),
              };
            }

            return undefined;
          },
        });

        writer.merge(innerStream.toUIMessageStream({ sendFinish: false }));
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
  editor: MarkdownEditor,
  {
    messagesRaw,
    model,
    refs,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: LanguageModel;
    refs: AIChatRequestRefs['blocks'];
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: 'Comment on the content',
    inputSchema: z.object({}),
    strict: true,
    execute: async () => {
      const commentSchema = z.object({
        blockRef: z
          .string()
          .describe(
            'The request-local reference of the starting block. If the comment spans multiple blocks, use the reference of the first block.'
          ),
        comment: z
          .string()
          .describe('A brief comment or explanation for this fragment.'),
        content: z
          .string()
          .describe(
            String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
          ),
      });

      const { partialOutputStream } = streamText({
        model,
        output: Output.array({ element: commentSchema }),
        prompt: getCommentPrompt(editor, {
          messages: messagesRaw,
          refs,
        }),
      });

      let lastLength = 0;

      for await (const partialArray of partialOutputStream) {
        for (let i = lastLength; i < partialArray.length; i++) {
          const comment = partialArray[i];
          const commentDataId = nanoid();

          writer.write({
            id: commentDataId,
            data: {
              comment,
              status: 'streaming',
            },
            type: 'data-comment',
          });
        }

        lastLength = partialArray.length;
      }

      writer.write({
        id: nanoid(),
        data: {
          comment: null,
          status: 'finished',
        },
        type: 'data-comment',
      });
    },
  });

const getTableTool = (
  editor: MarkdownEditor,
  {
    messagesRaw,
    model,
    refs,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: LanguageModel;
    refs: AIChatRequestRefs['tableCells'];
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: 'Edit table cells',
    inputSchema: z.object({}),
    strict: true,
    execute: async () => {
      const cellUpdateSchema = z.object({
        content: z
          .string()
          .describe(
            String.raw`The new content for the cell. Can contain multiple paragraphs separated by \n\n.`
          ),
        ref: z
          .string()
          .describe('The request-local reference of the table cell to update.'),
      });

      const { partialOutputStream } = streamText({
        model,
        output: Output.array({ element: cellUpdateSchema }),
        prompt: buildEditTableMultiCellPrompt(editor, messagesRaw, refs),
      });

      let lastLength = 0;

      for await (const partialArray of partialOutputStream) {
        for (let i = lastLength; i < partialArray.length; i++) {
          const cellUpdate = partialArray[i];

          writer.write({
            id: nanoid(),
            data: {
              cellUpdate,
              status: 'streaming',
            },
            type: 'data-table',
          });
        }

        lastLength = partialArray.length;
      }

      writer.write({
        id: nanoid(),
        data: {
          cellUpdate: null,
          status: 'finished',
        },
        type: 'data-table',
      });
    },
  });
