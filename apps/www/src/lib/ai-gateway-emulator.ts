import { AsyncLocalStorage } from 'node:async_hooks';

import { type OpenAIProvider, createOpenAI } from '@ai-sdk/openai';
import { type AiSeedConfig, aiPlugin, seedFromConfig } from '@emulators/ai';
import { createServer } from '@emulators/core';
import { NextRequest } from 'next/server';

type GatewayHandler = (request: Request) => Promise<Response>;
type StreamPart =
  Awaited<
    ReturnType<ReturnType<OpenAIProvider['chat']>['doStream']>
  >['stream'] extends ReadableStream<infer Part>
    ? Part
    : never;

const gatewayHost = 'ai-gateway.vercel.sh';
const emulatorUrl = 'http://ai-emulator.local';
const scope = new AsyncLocalStorage<GatewayHandler>();
const installedFetches = new WeakSet<typeof fetch>();

export function postWithEmulatedGateway(
  post: (request: NextRequest) => Promise<Response>,
  request: NextRequest,
  body: object,
  config: AiSeedConfig
) {
  routeGatewayFetchToRequestEmulator();

  return scope.run(createGatewayHandler(config), () =>
    post(
      new NextRequest(request.url, {
        body: JSON.stringify({ ...body, apiKey: 'demo' }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        signal: request.signal,
      })
    )
  );
}

function routeGatewayFetchToRequestEmulator() {
  if (installedFetches.has(globalThis.fetch)) return;
  const next = globalThis.fetch;

  globalThis.fetch = Object.assign(
    (input: RequestInfo | URL, init?: RequestInit) => {
      const handle = scope.getStore();
      if (!handle) return next(input, init);

      const request = new Request(input, init);
      return new URL(request.url).host === gatewayHost
        ? handle(request)
        : next(input, init);
    },
    next
  );
  installedFetches.add(globalThis.fetch);
}

/**
 * Answers `@ai-sdk/gateway`'s language model protocol: the body is the call
 * options, and a streamed reply is one SSE event per stream part.
 */
function createGatewayHandler(config: AiSeedConfig): GatewayHandler {
  const { app, store } = createServer(aiPlugin, { baseUrl: emulatorUrl });
  seedFromConfig(store, emulatorUrl, config);
  const openai = createOpenAI({
    apiKey: 'demo',
    baseURL: `${emulatorUrl}/v1`,
    fetch: Object.assign(
      (input: RequestInfo | URL, init?: RequestInit) =>
        app.fetch(new Request(input, init)),
      globalThis.fetch
    ),
  });

  return async (request) => {
    if (!new URL(request.url).pathname.endsWith('/language-model')) {
      return Response.json(
        { error: `The AI demo does not emulate ${request.url}` },
        { status: 404 }
      );
    }

    const model = openai.chat(
      request.headers.get('ai-language-model-id') ?? 'demo'
    );
    const options = {
      ...(await request.json()),
      abortSignal: request.signal,
    };

    if (request.headers.get('ai-language-model-streaming') !== 'true') {
      return Response.json(await model.doGenerate(options));
    }

    const { stream } = await model.doStream(options);

    return new Response(
      stream
        .pipeThrough(withoutEmptyTextParts())
        .pipeThrough(
          new TransformStream<StreamPart, string>({
            transform(part, controller) {
              controller.enqueue(`data: ${JSON.stringify(part)}\n\n`);
            },
          })
        )
        .pipeThrough(new TextEncoderStream()),
      { headers: { 'content-type': 'text/event-stream' } }
    );
  };
}

function withoutEmptyTextParts() {
  const unopened = new Map<string, StreamPart>();

  return new TransformStream<StreamPart, StreamPart>({
    transform(part, controller) {
      if (part.type === 'text-start') {
        unopened.set(part.id, part);
        return;
      }
      if (part.type === 'text-end' && unopened.delete(part.id)) return;
      if (part.type === 'text-delta') {
        const start = unopened.get(part.id);
        if (start) {
          if (!part.delta) return;
          unopened.delete(part.id);
          controller.enqueue(start);
        }
      }
      controller.enqueue(part);
    },
  });
}
