import { createGateway } from '@ai-sdk/gateway';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  streamText,
  streamObject,
  tool,
  type UIMessageStreamWriter,
} from 'ai';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createSlateEditor, nanoid, type SlateEditor } from 'platejs';
import { z } from 'zod';
import { BaseEditorKit } from '@/components/editor/editor-base-kit';
import type { ChatMessage, ToolName } from '@/components/editor/use-chat';
import { markdownJoinerTransform } from '@/lib/markdown-joiner-transform';

import {
  buildEditTableMultiCellPrompt,
  getChooseToolPrompt,
  getCommentPrompt,
  getEditPrompt,
  getGeneratePrompt,
} from './prompt';

type AiSdkLanguageModel = Parameters<typeof generateObject>[0]['model'];
const emptyToolSchema = z.object({});

// `@ai-sdk/gateway` exposes V3 models, while `ai@5` still types model inputs as V2.
// Runtime is fine; keep the cast at this boundary instead of spreading `as any` everywhere.
const getGatewayModel = (
  gatewayProvider: ReturnType<typeof createGateway>,
  modelId: string
) => gatewayProvider(modelId as never) as unknown as AiSdkLanguageModel;

export async function POST(req: NextRequest) {
  const { apiKey: key, ctx, messages: messagesRaw, model } = await req.json();

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

          const enumOptions = isSelecting
            ? ['generate', 'edit', 'comment']
            : ['generate', 'comment'];
          const modelId = model || 'google/gemini-2.5-flash';

          const { object: AIToolName } = await generateObject({
            enum: enumOptions,
            model: getGatewayModel(gatewayProvider, modelId),
            output: 'enum',
            prompt,
          });

          writer.write({
            data: AIToolName as ToolName,
            type: 'data-toolName',
          });

          toolName = AIToolName;
        }

        const stream = streamText({
          experimental_transform: markdownJoinerTransform(),
          model: getGatewayModel(gatewayProvider, model || 'openai/gpt-4o-mini'),
          // Not used
          prompt: '',
          tools: {
            comment: getCommentTool(editor, {
              messagesRaw,
              model: getGatewayModel(
                gatewayProvider,
                model || 'google/gemini-2.5-flash'
              ),
              writer,
            }),
            table: getTableTool(editor, {
              messagesRaw,
              model: getGatewayModel(
                gatewayProvider,
                model || 'google/gemini-2.5-flash'
              ),
              writer,
            }),
          },
          prepareStep: async (step) => {
            if (toolName === 'comment') {
              return {
                ...step,
                toolChoice: { toolName: 'comment', type: 'tool' },
              };
            }

            if (toolName === 'edit') {
              const [editPrompt, editType] = getEditPrompt(editor, {
                isSelecting,
                messages: messagesRaw,
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
                    ? //The selection task is more challenging, so we chose to use Gemini 2.5 Flash.
                      getGatewayModel(
                        gatewayProvider,
                        model || 'google/gemini-2.5-flash'
                      )
                    : getGatewayModel(
                        gatewayProvider,
                        model || 'openai/gpt-4o-mini'
                      ),
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
                model: getGatewayModel(
                  gatewayProvider,
                  model || 'openai/gpt-4o-mini'
                ),
              };
            }
          },
        });

        writer.merge(stream.toUIMessageStream({ sendFinish: false }));
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
    model,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: AiSdkLanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: 'Comment on the content',
    inputSchema: emptyToolSchema,
    strict: true,
    execute: async (_input: z.infer<typeof emptyToolSchema>) => {
      const commentSchema = z.object({
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
      });

      const { partialObjectStream } = streamObject({
        model,
        prompt: getCommentPrompt(editor, {
          messages: messagesRaw,
        }),
        output: 'array',
        schema: commentSchema,
      });

      let lastLength = 0;

      for await (const partialArray of partialObjectStream) {
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
  } as any);

const getTableTool = (
  editor: SlateEditor,
  {
    messagesRaw,
    model,
    writer,
  }: {
    messagesRaw: ChatMessage[];
    model: AiSdkLanguageModel;
    writer: UIMessageStreamWriter<ChatMessage>;
  }
) =>
  tool({
    description: 'Edit table cells',
    inputSchema: emptyToolSchema,
    strict: true,
    execute: async (_input: z.infer<typeof emptyToolSchema>) => {
      const cellUpdateSchema = z.object({
        content: z
          .string()
          .describe(
            String.raw`The new content for the cell. Can contain multiple paragraphs separated by \n\n.`
          ),
        id: z.string().describe('The id of the table cell to update.'),
      });

      const { partialObjectStream } = streamObject({
        model,
        prompt: buildEditTableMultiCellPrompt(editor, messagesRaw),
        output: 'array',
        schema: cellUpdateSchema,
      });

      let lastLength = 0;

      for await (const partialArray of partialObjectStream) {
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
  } as any);
