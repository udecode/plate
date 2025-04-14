'use client';

import { openai } from '@ai-sdk/openai';
import { useChat as useBaseChat } from 'ai/react';

import { useSettings } from '@/registry/default/components/editor/settings';

export const useChat = () => {
  const { keys, model } = useSettings();

  return useBaseChat({
    id: 'editor',
    api: '/api/ai/command',
    body: {
      // !!! DEMO ONLY: don't use API keys client-side
      apiKey: keys.openai,
      model: openai('gpt-4o'),
    },
    fetch: async (input, init) => {
      const res = await fetch(input, init);

      if (!res.ok) {
        // Mock the API response. Remove it when you implement the route /api/ai/command
        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText();

        return new Response(stream, {
          headers: {
            Connection: 'keep-alive',
            'Content-Type': 'text/plain',
          },
        });
      }

      return res;
    },
  });
};

// Used for testing. Remove it after implementing useChat api.
const fakeStreamText = ({
  chunkCount = 3,
  streamProtocol = 'data',
}: {
  chunkCount?: number;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  // Create 3 blocks with different lengths
  const blocks = [
    [
      { delay: 100, texts: '' },
      { delay: 100, texts: '#' },
      { delay: 100, texts: ' Pluto' },
      { delay: 100, texts: '\n' },
      { delay: 100, texts: '  \n' },
      { delay: 100, texts: '**' },
      { delay: 100, texts: 'Pl' },
      { delay: 100, texts: 'uto' },
      { delay: 100, texts: '**' },
      { delay: 100, texts: ' (' },
      { delay: 100, texts: 'minor' },
      { delay: 100, texts: '-' },
      { delay: 100, texts: 'planet' },
      { delay: 100, texts: ' designation' },
      { delay: 100, texts: ':' },
      { delay: 100, texts: ' *' },
      { delay: 100, texts: '134' },
      { delay: 100, texts: '340' },
      { delay: 100, texts: ' Pluto' },
      { delay: 100, texts: '*)' },
      { delay: 100, texts: ' is' },
      { delay: 100, texts: ' a' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'd' },
      { delay: 100, texts: 'warf' },
      { delay: 100, texts: ' planet' },
      { delay: 100, texts: '](' },
      { delay: 100, texts: 'https' },
      { delay: 100, texts: '://' },
      { delay: 100, texts: 'en' },
      { delay: 100, texts: '.wikipedia' },
      { delay: 100, texts: '.org' },
      { delay: 100, texts: '/wiki' },
      { delay: 100, texts: '/D' },
      { delay: 100, texts: 'warf' },
      { delay: 100, texts: '_plan' },
      { delay: 100, texts: 'et' },
      { delay: 100, texts: ')' },
      { delay: 100, texts: ' in' },
      { delay: 100, texts: ' the' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'Ku' },
      { delay: 100, texts: 'iper' },
      { delay: 100, texts: ' belt' },
      { delay: 100, texts: '](' },
      { delay: 100, texts: 'https' },
      { delay: 100, texts: '://' },
      { delay: 100, texts: 'en' },
      { delay: 100, texts: '.wikipedia' },
      { delay: 100, texts: '.org' },
      { delay: 100, texts: '/wiki' },
      { delay: 100, texts: '/' },
      { delay: 100, texts: 'Ku' },
      { delay: 100, texts: 'iper' },
      { delay: 100, texts: '_b' },
      { delay: 100, texts: 'elt' },
      { delay: 100, texts: ').' },
      { delay: 100, texts: '  \n\n' },
      { delay: 100, texts: '##' },
      { delay: 100, texts: ' History' },
      { delay: 100, texts: '  \n' },
      { delay: 100, texts: 'In' },
      { delay: 100, texts: ' the' },
      { delay: 100, texts: ' ' },
      { delay: 100, texts: '184' },
      { delay: 100, texts: '0' },
      { delay: 100, texts: 's' },
      { delay: 100, texts: ',' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'U' },
      { delay: 100, texts: 'rb' },
      { delay: 100, texts: 'ain' },
      { delay: 100, texts: ' Le' },
      { delay: 100, texts: ' Verr' },
      { delay: 100, texts: 'ier' },
      { delay: 100, texts: '](' },
      { delay: 100, texts: 'https' },
      { delay: 100, texts: '://' },
      { delay: 100, texts: 'w' },
      { delay: 100, texts: 'ikipedia' },
      { delay: 100, texts: '.org' },
      { delay: 100, texts: '/wiki' },
      { delay: 100, texts: '/U' },
      { delay: 100, texts: 'rb' },
      { delay: 100, texts: 'ain' },
      { delay: 100, texts: '_' },
      { delay: 100, texts: 'Le' },
      { delay: 100, texts: '_V' },
      { delay: 100, texts: 'err' },
      { delay: 100, texts: 'ier' },
      { delay: 100, texts: ')' },
      { delay: 100, texts: ' used' },
      { delay: 100, texts: ' Newton' },
      { delay: 100, texts: 'ian' },
      { delay: 100, texts: ' mechanics' },
      { delay: 100, texts: ' to' },
      { delay: 100, texts: ' predict' },
      { delay: 100, texts: ' the' },
      { delay: 100, texts: ' position' },
      { delay: 100, texts: ' of' },
      { delay: 100, texts: ' the' },
      { delay: 100, texts: ' then' },
      { delay: 100, texts: '-und' },
      { delay: 100, texts: 'is' },
      { delay: 100, texts: 'covered' },
      { delay: 100, texts: ' planet' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'Ne' },
      { delay: 100, texts: 'ptune' },
      { delay: 100, texts: '](' },
      { delay: 100, texts: 'https' },
      { delay: 100, texts: '://' },
      { delay: 100, texts: 'w' },
      { delay: 100, texts: 'ikipedia' },
      { delay: 100, texts: '.org' },
      { delay: 100, texts: '/wiki' },
      { delay: 100, texts: '/' },
      { delay: 100, texts: 'Ne' },
      { delay: 100, texts: 'ptune' },
      { delay: 100, texts: ')' },
      { delay: 100, texts: ' after' },
      { delay: 100, texts: ' analyzing' },
      { delay: 100, texts: ' perturb' },
      { delay: 100, texts: 'ations' },
      { delay: 100, texts: ' in' },
      { delay: 100, texts: ' the' },
      { delay: 100, texts: ' orbit' },
      { delay: 100, texts: ' of' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'U' },
      { delay: 100, texts: 'ran' },
      { delay: 100, texts: 'us' },
      { delay: 100, texts: '](' },
      { delay: 100, texts: 'https' },
      { delay: 100, texts: '://' },
      { delay: 100, texts: 'w' },
      { delay: 100, texts: 'ikipedia' },
      { delay: 100, texts: '.org' },
      { delay: 100, texts: '/wiki' },
      { delay: 100, texts: '/U' },
      { delay: 100, texts: 'ran' },
      { delay: 100, texts: 'us' },
      { delay: 100, texts: ').' },
      { delay: 100, texts: '  \n\n' },
      { delay: 100, texts: '***' },
      { delay: 100, texts: '  \n\n' },
      { delay: 100, texts: 'Just' },
      { delay: 100, texts: ' a' },
      { delay: 100, texts: ' link' },
      { delay: 100, texts: ':' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'www' },
      { delay: 100, texts: '.n' },
      { delay: 100, texts: 'asa' },
      { delay: 100, texts: '.gov' },
      { delay: 100, texts: '](' },
      { delay: 100, texts: 'http' },
      { delay: 100, texts: '://' },
      { delay: 100, texts: 'www' },
      { delay: 100, texts: '.n' },
      { delay: 100, texts: 'asa' },
      { delay: 100, texts: '.gov' },
      { delay: 100, texts: ').' },
      { delay: 100, texts: '  \n\n' },
      { delay: 100, texts: '*' },
      { delay: 100, texts: ' Lists' },
      { delay: 100, texts: '  \n' },
      { delay: 100, texts: ' ' },
      { delay: 100, texts: ' *' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: ' ]' },
      { delay: 100, texts: ' todo' },
      { delay: 100, texts: '  \n' },
      { delay: 100, texts: ' ' },
      { delay: 100, texts: ' *' },
      { delay: 100, texts: ' [' },
      { delay: 100, texts: 'x' },
      { delay: 100, texts: ']' },
      { delay: 100, texts: ' done' },
      { delay: 100, texts: '  \n\n' },
      { delay: 100, texts: 'A' },
      { delay: 100, texts: ' table' },
      { delay: 100, texts: ':' },
      { delay: 100, texts: '  \n\n' },
      { delay: 100, texts: '|' },
      { delay: 100, texts: ' a' },
      { delay: 100, texts: ' |' },
      { delay: 100, texts: ' b' },
      { delay: 100, texts: ' |' },
      { delay: 100, texts: '  \n' },
      { delay: 100, texts: '|' },
      { delay: 100, texts: ' -' },
      { delay: 100, texts: ' |' },
      { delay: 100, texts: ' -' },
      { delay: 100, texts: ' |' },
      { delay: 100, texts: '  \n\n' },
    ],
  ];
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        // Stream the block content
        for (const chunk of block) {
          await new Promise((resolve) => setTimeout(resolve, chunk.delay));

          if (streamProtocol === 'text') {
            controller.enqueue(encoder.encode(chunk.texts));
          } else {
            controller.enqueue(
              encoder.encode(`0:${JSON.stringify(chunk.texts)}\n`)
            );
          }
        }

        // Add double newline after each block except the last one
        if (i < blocks.length - 1) {
          if (streamProtocol === 'text') {
            controller.enqueue(encoder.encode('\n\n'));
          } else {
            controller.enqueue(encoder.encode(`0:${JSON.stringify('\n\n')}\n`));
          }
        }
      }

      if (streamProtocol === 'data') {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${blocks.reduce(
            (sum, block) => sum + block.length,
            0
          )}}}\n`
        );
      }

      controller.close();
    },
  });
};
