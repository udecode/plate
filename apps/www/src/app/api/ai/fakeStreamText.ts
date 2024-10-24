import { faker } from '@faker-js/faker';

interface Chunk {
  delay: number;
  texts: string;
}

function getRandomChunks(count = 15): Chunk[] {
  return Array.from({ length: count }, () => ({
    delay: faker.number.int({ max: 150, min: 50 }),
    texts: faker.lorem.words({ max: 3, min: 1 }) + ' ',
  }));
}

export const fakeStreamText = ({
  chunkCount = 15,
  streamProtocol = 'text',
}: {
  chunkCount?: number;
  streamProtocol?: 'data' | 'text';
} = {}) => {
  const chunks = getRandomChunks(chunkCount);

  return new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, chunk.delay));

        if (streamProtocol === 'text') {
          controller.enqueue(chunk.texts);
        } else {
          controller.enqueue(`0:${JSON.stringify(chunk.texts)}\n`);
        }
      }

      if (streamProtocol === 'data') {
        controller.enqueue(
          `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":${chunks.length}}}\n`
        );
      }

      controller.close();
    },
  });
};
