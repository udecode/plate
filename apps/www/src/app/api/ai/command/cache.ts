import type {
  LanguageModelV2,
  LanguageModelV2Middleware,
  LanguageModelV2Prompt,
  LanguageModelV2StreamPart,
} from '@ai-sdk/provider';

import { simulateReadableStream, wrapLanguageModel } from 'ai';
import fs from 'node:fs';
import path from 'node:path';

const CACHE_FILE = path.join(process.cwd(), '.cache/ai-cache.json');

export const cached = (model: LanguageModelV2, useCache?: boolean) =>
  useCache
    ? wrapLanguageModel({
        middleware: cacheMiddleware,
        model,
      })
    : model;

const ensureCacheFile = () => {
  const cacheDir = path.dirname(CACHE_FILE);

  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  if (!fs.existsSync(CACHE_FILE)) {
    fs.writeFileSync(CACHE_FILE, '{}');
  }
};

const getCachedResult = (key: object | string) => {
  ensureCacheFile();
  const cacheKey = typeof key === 'object' ? JSON.stringify(key) : key;

  try {
    const cacheContent = fs.readFileSync(CACHE_FILE, 'utf8');

    const cache = JSON.parse(cacheContent);

    const result = cache[cacheKey];

    return result ?? null;
  } catch (error) {
    console.error('Cache error:', error);

    return null;
  }
};

const updateCache = (key: string, value: any) => {
  ensureCacheFile();

  try {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    const updatedCache = { ...cache, [key]: value };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(updatedCache, null, 2));
    console.info('Cache updated for key:', key);
  } catch (error) {
    console.error('Failed to update cache:', error);
  }
};
const cleanPrompt = (prompt: LanguageModelV2Prompt) => {
  return prompt.map((m) => {
    if (m.role === 'assistant') {
      return m.content.map((part) =>
        part.type === 'tool-call' ? { ...part, toolCallId: 'cached' } : part
      );
    }
    if (m.role === 'tool') {
      return m.content.map((tc) => ({
        ...tc,
        result: {},
        toolCallId: 'cached',
      }));
    }

    return m;
  });
};

export const cacheMiddleware: LanguageModelV2Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const cacheKey = JSON.stringify({
      ...cleanPrompt(params.prompt),
      _function: 'generate',
    });
    const cachedResult = getCachedResult(cacheKey) as Awaited<
      ReturnType<LanguageModelV2['doGenerate']>
    > | null;

    if (cachedResult && cachedResult !== null) {
      console.info('Cache Hit (generate)');

      return {
        ...cachedResult,
        response: {
          ...cachedResult.response,
          timestamp: cachedResult?.response?.timestamp
            ? new Date(cachedResult?.response?.timestamp)
            : undefined,
        },
      };
    }

    const result = await doGenerate();

    updateCache(cacheKey, result);

    return result;
  },
  wrapStream: async ({ doStream, params }) => {
    const cacheKey = JSON.stringify({
      ...cleanPrompt(params.prompt),
      _function: 'stream',
    });
    // Check if the result is in the cache
    const cachedResult = getCachedResult(cacheKey);

    // If cached, return a simulated ReadableStream that yields the cached result
    if (cachedResult && cachedResult !== null) {
      console.info('Cache Hit');
      // Format the timestamps in the cached response
      const formattedChunks = (cachedResult as LanguageModelV2StreamPart[]).map(
        (p) => {
          if (p.type === 'response-metadata' && p.timestamp) {
            return { ...p, timestamp: new Date(p.timestamp) };
          } else return p;
        }
      );

      return {
        rawCall: { rawPrompt: null, rawSettings: {} },
        stream: simulateReadableStream({
          chunkDelayInMs: 1000,
          chunks: formattedChunks,
          initialDelayInMs: 0,
        }),
      };
    }

    // If not cached, proceed with streaming
    const { stream, ...rest } = await doStream();

    const fullResponse: LanguageModelV2StreamPart[] = [];

    const transformStream = new TransformStream<
      LanguageModelV2StreamPart,
      LanguageModelV2StreamPart
    >({
      flush() {
        // Store the full response in the cache after streaming is complete
        updateCache(cacheKey, fullResponse);
      },
      transform(chunk, controller) {
        fullResponse.push(chunk);
        controller.enqueue(chunk);
      },
    });

    return {
      stream: stream.pipeThrough(transformStream),
      ...rest,
    };
  },
};

/* Example Usage:
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import 'dotenv/config';
import { cached } from './ai-cache-middleware'; // Adjusted path

async function main() {
  const result = streamText({
    model: cached(openai('gpt-4o')),
    maxOutputTokens: 512,
    temperature: 0.3,
    maxRetries: 5,
    prompt: 'Invent a new holiday and describe its traditions.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  console.info();
  console.info('Token usage:', await result.usage);
  console.info('Finish reason:', await result.finishReason);
}

main().catch(console.error);
*/
