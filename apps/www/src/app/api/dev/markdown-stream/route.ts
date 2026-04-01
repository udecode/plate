import { createGateway } from '@ai-sdk/gateway';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

import { normalizeMarkdownStreamingDemoGatewayApiKey } from '@/registry/lib/markdown-streaming-demo-ai';

export const runtime = 'nodejs';

const OPENAI_CHAT_COMPLETIONS_URL =
  'https://api.openai.com/v1/chat/completions';
const DEFAULT_GATEWAY_MODEL =
  process.env.AI_GATEWAY_MODEL ?? 'openai/gpt-4.1-mini';
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

type MarkdownStreamRequest = {
  gatewayApiKey?: string;
  model?: string;
  prompt?: string;
};

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: {
      content?: string | Array<{ text?: string; type?: string }>;
    };
  }>;
};

function createInstruction(prompt: string) {
  return [
    'You are helping test a streaming markdown editor.',
    'Reply in markdown only.',
    'Do not add explanatory prose outside the markdown answer.',
    'Prefer diverse markdown structures when they fit the prompt:',
    'headings, paragraphs, emphasis, links, lists, tables, blockquotes, and fenced code blocks.',
    'Do not wrap the whole response in a single outer code fence unless the user explicitly asks for that.',
    '',
    `User prompt: ${prompt}`,
  ].join('\n');
}

function encodeEvent(event: Record<string, unknown>) {
  return `${JSON.stringify(event)}\n`;
}

function extractChunkText(payload: ChatCompletionChunk): string {
  const fragments: string[] = [];

  for (const choice of payload.choices ?? []) {
    const content = choice.delta?.content;

    if (typeof content === 'string') {
      fragments.push(content);
      continue;
    }

    if (!Array.isArray(content)) {
      continue;
    }

    for (const part of content) {
      if (part.type === 'text' && typeof part.text === 'string') {
        fragments.push(part.text);
      }
    }
  }

  return fragments.join('');
}

function normalizeRequestedModel(model: string | undefined) {
  const normalized = model?.trim();

  if (!normalized) {
    return DEFAULT_GATEWAY_MODEL;
  }

  return normalized;
}

function toOpenAiModelId(model: string) {
  return model.startsWith('openai/') ? model.slice('openai/'.length) : model;
}

function createNdjsonStream(
  execute: (
    controller: ReadableStreamDefaultController<Uint8Array>
  ) => Promise<void>
) {
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await execute(controller);
      } catch (error) {
        controller.enqueue(
          new TextEncoder().encode(
            encodeEvent({
              type: 'error',
              error:
                error instanceof Error
                  ? error.message
                  : 'Unknown streaming error.',
            })
          )
        );
        controller.close();
      }
    },
  });
}

async function streamThroughGateway(
  prompt: string,
  model: string,
  apiKeyOverride?: string
) {
  const apiKey = apiKeyOverride ?? process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    return null;
  }

  const gateway = createGateway({ apiKey });
  const encoder = new TextEncoder();

  return createNdjsonStream(async (controller) => {
    const result = streamText({
      model: gateway(model),
      prompt: createInstruction(prompt),
    });

    for await (const textPart of result.textStream) {
      if (!textPart) {
        continue;
      }

      controller.enqueue(
        encoder.encode(
          encodeEvent({
            chunk: textPart,
            provider: 'gateway',
            type: 'chunk',
          })
        )
      );
    }

    controller.enqueue(
      encoder.encode(
        encodeEvent({
          model,
          provider: 'gateway',
          type: 'done',
        })
      )
    );
    controller.close();
  });
}

async function streamThroughOpenAi(prompt: string, model: string) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return null;
  }

  const upstreamResponse = await fetch(OPENAI_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: toOpenAiModelId(model) || DEFAULT_OPENAI_MODEL,
      stream: true,
      messages: [
        {
          role: 'system',
          content:
            'You generate markdown responses for a local streaming editor playground.',
        },
        {
          role: 'user',
          content: createInstruction(prompt),
        },
      ],
    }),
  });

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    const errorText = await upstreamResponse.text();

    throw new Error(
      errorText ||
        `OpenAI request failed with status ${upstreamResponse.status}.`
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return createNdjsonStream(async (controller) => {
    const reader = upstreamResponse.body!.getReader();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();

          if (!line.startsWith('data:')) {
            continue;
          }

          const data = line.slice(5).trim();

          if (!data) {
            continue;
          }

          if (data === '[DONE]') {
            controller.enqueue(
              encoder.encode(
                encodeEvent({
                  model,
                  provider: 'openai',
                  type: 'done',
                })
              )
            );
            controller.close();
            return;
          }

          let payload: ChatCompletionChunk;

          try {
            payload = JSON.parse(data) as ChatCompletionChunk;
          } catch {
            continue;
          }

          const chunk = extractChunkText(payload);

          if (!chunk) {
            continue;
          }

          controller.enqueue(
            encoder.encode(
              encodeEvent({
                chunk,
                provider: 'openai',
                type: 'chunk',
              })
            )
          );
        }
      }

      controller.enqueue(
        encoder.encode(
          encodeEvent({
            model,
            provider: 'openai',
            type: 'done',
          })
        )
      );
      controller.close();
    } finally {
      reader.releaseLock();
    }
  });
}

export async function POST(request: Request) {
  let body: MarkdownStreamRequest;

  try {
    body = (await request.json()) as MarkdownStreamRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const prompt = body.prompt?.trim();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
  }

  const model = normalizeRequestedModel(body.model);
  const gatewayApiKey = normalizeMarkdownStreamingDemoGatewayApiKey(
    body.gatewayApiKey
  );
  const gatewayStream = await streamThroughGateway(
    prompt,
    model,
    gatewayApiKey
  );

  if (gatewayStream) {
    return new Response(gatewayStream, {
      headers: {
        'Cache-Control': 'no-cache, no-transform',
        'Content-Type': 'application/x-ndjson; charset=utf-8',
      },
    });
  }

  if (!model.startsWith('openai/')) {
    return NextResponse.json(
      {
        error:
          'This model requires AI_GATEWAY_API_KEY. Configure AI Gateway to use non-OpenAI providers in the demo.',
      },
      { status: 400 }
    );
  }

  const openAiStream = await streamThroughOpenAi(prompt, model);

  if (!openAiStream) {
    return NextResponse.json(
      {
        error:
          'Missing API key. Set AI_GATEWAY_API_KEY for multi-provider models or OPENAI_API_KEY for OpenAI-only fallback.',
      },
      { status: 500 }
    );
  }

  return new Response(openAiStream, {
    headers: {
      'Cache-Control': 'no-cache, no-transform',
      'Content-Type': 'application/x-ndjson; charset=utf-8',
    },
  });
}
