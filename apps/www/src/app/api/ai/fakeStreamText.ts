import { faker } from '@faker-js/faker';
interface FakeStreamTextProps {
  texts: string;
  delay?: number;
}

export const fakerText = [
  {
    delay: 100,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 80,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 70,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 90,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 75,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 85,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 80,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 70,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 75,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 80,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 90,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 75,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 70,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 85,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 80,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 90,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 75,
    texts: faker.lorem.words(1) + ' ',
  },
  {
    delay: 70,
    texts: faker.lorem.words(1) + ' ',
  },
];

export const fakeStreamText = ({
  chunks = fakerText,
  streamProtocol = 'text',
}: {
  chunks?: FakeStreamTextProps[];
  streamProtocol?: 'data' | 'text';
} = {}) => {
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
