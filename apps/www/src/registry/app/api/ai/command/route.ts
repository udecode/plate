import type {
  ChatMessage,
  ToolName,
} from '@/registry/components/editor/use-chat';
import type { NextRequest } from 'next/server';

import { google } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateObject,
  streamObject,
  streamText,
} from 'ai';
import { NextResponse } from 'next/server';
import { nanoid } from 'platejs';
import { z } from 'zod';

import { markdownJoinerTransform } from '@/registry/lib/markdown-joiner-transform';

const choseToolSystem = `You are a strict classifier. Classify the user's last request as "generate", "edit", or "comment".

Priority rules:
1. Default is "generate". Any open question, idea request, or creation request → "generate".
2. Only return "edit" if the user provides original text (or a selection of text) AND asks to change, rephrase, translate, or shorten it.
3. Only return "comment" if the user explicitly asks for comments, feedback, annotations, or review. Do not infer "comment" implicitly.

Return only one enum value with no explanation.`;

const commentSystem = `You are a document review assistant.  
You will receive an MDX document wrapped in <block id="..."> content </block> tags.  

Your task:  
- Read the content of all blocks and provide comments.  
- For each comment, generate a JSON object:  
  - blockId: the id of the block being commented on.
  - content: the original document fragment that needs commenting.
  - comments: a brief comment or explanation for that fragment.

Rules:
- IMPORTANT: If a comment spans multiple blocks, use the id of the **first** block.
- The **content** field must be the original content inside the block tag. The returned content must not include the block tags, but should retain other MDX tags.
- IMPORTANT: The **content** field must be flexible:
  - It can cover one full block, only part of a block, or multiple blocks.  
  - If multiple blocks are included, separate them with two \\n\\n.  
  - Do NOT default to using the entire block—use the smallest relevant span instead.
- At least one comment must be provided.

`;

export async function POST(req: NextRequest) {
  const { apiKey: key, commentPrompt, messages, system } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  try {
    const stream = createUIMessageStream<ChatMessage>({
      execute: async ({ writer }) => {
        const lastUserMessage = messages.findLast(
          (message: any) => message.role === 'user'
        );

        const { object: toolName } = await generateObject({
          enum: ['generate', 'edit', 'comment'],
          model: openai('gpt-4o'),
          output: 'enum',
          prompt: `User message:
          ${JSON.stringify(lastUserMessage)}`,
          system: choseToolSystem,
        });

        console.log('🚀 ~ POST ~ toolName:', toolName);
        writer.write({
          data: toolName as ToolName,
          type: 'data-toolName',
        });

        if (toolName === 'generate') {
          const gen = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: google('gemini-2.5-flash'),
            system: system,
          });

          writer.merge(gen.toUIMessageStream({ sendFinish: false }));
        }

        if (toolName === 'edit') {
          // TODO
          const edit = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: google('gemini-2.5-flash'),
            system: system,
          });

          writer.merge(edit.toUIMessageStream({ sendFinish: false }));
        }

        if (toolName === 'comment') {
          const { elementStream } = streamObject({
            maxOutputTokens: 2048,
            model: openai('gpt-4o'),
            output: 'array',
            prompt: commentPrompt,
            schema: z
              .object({
                blockId: z
                  .string()
                  .describe(
                    'The id of the starting block. If the comment spans multiple blocks, use the id of the first block.'
                  ),
                comment: z
                  .string()
                  .describe(
                    'A brief comment or explanation for this fragment.'
                  ),
                content: z
                  .string()
                  .describe(
                    String.raw`The original document fragment to be commented on.It can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.`
                  ),
              })
              .describe('A single comment'),
            system: commentSystem,
          });

          // Create a single message ID for the entire comment stream

          for await (const comment of elementStream) {
            const commentDataId = nanoid();
            // Send each comment as a delta

            writer.write({
              id: commentDataId,
              data: comment,
              type: 'data-comment',
            });
          }

          return;
        }
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
