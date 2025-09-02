import type { NextRequest } from 'next/server';

import { createOpenAI } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  createUIMessageStream,
  streamText,
  generateObject,
  streamObject,
} from 'ai';
import { NextResponse } from 'next/server';

import { z } from 'zod/v3';
import { markdownJoinerTransform } from '@/registry/lib/markdown-joiner-transform';
import { nanoid } from 'platejs';

export async function POST(req: NextRequest) {
  const { apiKey: key, messages, system, prompt } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  try {
    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const lastUserMessage = messages.findLast(
          (message: any) => message.role === 'user'
        );

        const { object: choice } = await generateObject({
          model: openai('gpt-4o'),
          output: 'enum',
          enum: ['generate', 'edit', 'comment'],
          prompt:
            'Determine whether the user wants to generate new content, edit existing document content, or comment on the document.' +
            JSON.stringify(lastUserMessage),
        });

        if (choice === 'generate') {
          const gen = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: openai('gpt-4o'),
            system: system,
          });

          writer.merge(gen.toUIMessageStream({ sendFinish: false }));
        }

        if (choice === 'edit') {
          // TODO
          const edit = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: openai('gpt-4o'),
            system: system,
          });

          writer.merge(edit.toUIMessageStream({ sendFinish: false }));
        }

        if (choice === 'comment') {
          const { elementStream } = streamObject({
            maxOutputTokens: 2048,
            model: openai('gpt-4o'),
            output: 'array',
            prompt,
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
                    'The original document fragment to be commented on. Do not modify it in any way.'
                  ),
              })
              .describe('A single comment object'),
            system,
          });

          // Create a single message ID for the entire comment stream
          const messageId = nanoid();
          let isFirst = true;

          for await (const comment of elementStream) {
            if (isFirst) {
              // Send start event for the message
              writer.write({
                type: 'text-start',
                id: messageId,
              });
              isFirst = false;
            }

            // Send each comment as a delta
            writer.write({
              type: 'text-delta',
              id: messageId,
              delta: JSON.stringify(comment) + '\n',
            });
          }

          // Send end event
          writer.write({
            type: 'text-end',
            id: messageId,
          });

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
