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
          content: z
            .string()
            .describe(
              'The original document fragment to be commented on. Do not modify it in any way.'
            ),
          comment: z
            .string()
            .describe('A brief comment or explanation for this fragment.'),
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
    schema,
    maxTokens: 2048,
    model: openai('gpt-4o'),
    prompt,
    system,
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const e of result.fullStream) {
          controller.enqueue(JSON.stringify(e) + '\n');
        }
      } catch (err) {
        controller.enqueue(
          JSON.stringify({ type: 'error', error: String(err) }) + '\n'
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
