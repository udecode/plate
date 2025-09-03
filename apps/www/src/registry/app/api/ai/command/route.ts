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
import { ChatMessage, Choice } from '@platejs/ai/react';

const commentSystem = `\
You are a document review assistant.  
You will receive an MDX document wrapped in <block id="..."> content </block> tags.  

Your task:  
- Read the content of all blocks and provide comments.  
- For each comment, generate a JSON object:  
  - blockId: the id of the block being commented on.
  - content: the original document fragment that needs commenting.
  - comments: a brief comment or explanation for that fragment.

Rules:
- The content field must be the original content inside the block tag. The returned content must not include the block tags, but should retain other MDX tags.
- The content field can be the entire block, a small part within a block, or span multiple blocks. If spanning multiple blocks, separate them with two \n\n.
- Important: If a comment spans multiple blocks, use the id of the **first** block.
`;

export async function POST(req: NextRequest) {
  const { apiKey: key, messages, system, commentPrompt } = await req.json();

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

        const { object: choice } = await generateObject({
          model: openai('gpt-4o'),
          output: 'enum',
          enum: ['generate', 'edit', 'comment'],
          system: `
        You are a strict classifier. Classify the user's last request as "generate", "edit", or "comment".
        
        Priority rules:
        1. Default is "generate". Any open question, idea request, or creation request → "generate".
        2. Only return "edit" if the user provides original text (or a selection of text) AND asks to change, rephrase, translate, or shorten it.
        3. Only return "comment" if the user explicitly asks for comments, feedback, annotations, or review. Do not infer "comment" implicitly.
        
        Return only one enum value with no explanation.
        `,
          prompt: `User message:
        ${JSON.stringify(lastUserMessage)}`,
        });

        writer.write({
          type: 'data-choice',
          data: choice as Choice,
        });

        if (choice === 'generate') {
          const gen = streamText({
            experimental_transform: markdownJoinerTransform(),
            maxOutputTokens: 2048,
            messages: convertToModelMessages(messages),
            model: openai('gpt-4o-mini'),
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
            model: openai('gpt-4o-mini'),
            system: system,
          });

          writer.merge(edit.toUIMessageStream({ sendFinish: false }));
        }

        if (choice === 'comment') {
          const { elementStream } = streamObject({
            maxOutputTokens: 2048,
            model: openai('gpt-4o-mini'),
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
                    'The original document fragment to be commented on. Do not modify it in any way.'
                  ),
              })
              .describe('A single comment object'),
            system: commentSystem,
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
