import type { NextRequest } from 'next/server';

import { createOpenAI } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const schema = z.object({
  comments: z
    .array(
      z
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
              'The original document fragment to be commented on. Do not modify it in any way.'
            ),
        })
        .describe('A single comment object')
    )
    .min(1)
    .max(10),
});

export async function POST(req: NextRequest) {
  const { apiKey: key, prompt, system } = await req.json();

  const apiKey = key || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing API key' }), {
      status: 401,
    });
  }

  const openai = createOpenAI({ apiKey });

  const result = streamObject({
    maxTokens: 2048,
    model: openai('gpt-4o'),
    prompt,
    schema,
    system,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const e of result.fullStream) {
          controller.enqueue(JSON.stringify(e) + '\n');
        }
      } catch (error) {
        controller.enqueue(
          JSON.stringify({ error: String(error), type: 'error' }) + '\n'
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
