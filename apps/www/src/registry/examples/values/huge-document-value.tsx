import { faker } from '@faker-js/faker';
import type { Value } from 'platejs';

type HugeDocumentBlock = {
  text: string;
  type: 'heading-one' | 'paragraph';
};

type HugeDocumentEngine = 'plate' | 'slate';

const DEFAULT_HUGE_DOCUMENT_BLOCKS = 10_000;
const HEADING_INTERVAL = 100;
const cachedHugeDocumentBlocks: HugeDocumentBlock[] = [];

const buildHugeDocumentBlocks = (blocks: number): HugeDocumentBlock[] => {
  faker.seed(1);

  return Array.from({ length: blocks }, (_, index) => {
    if (index % HEADING_INTERVAL === 0) {
      return {
        text: faker.lorem.sentence(),
        type: 'heading-one',
      };
    }

    return {
      text: faker.lorem.paragraph(),
      type: 'paragraph',
    };
  });
};

const toPlateValue = (blocks: HugeDocumentBlock[]): Value =>
  blocks.map(({ text, type }) => ({
    children: [{ text }],
    type: type === 'heading-one' ? 'h1' : 'p',
  })) as Value;

const toPliteValue = (blocks: HugeDocumentBlock[]): Value =>
  blocks.map(({ text, type }) => ({
    children: [{ text }],
    type,
  })) as Value;

export const getHugeDocumentBlocks = (
  blocks = DEFAULT_HUGE_DOCUMENT_BLOCKS
): HugeDocumentBlock[] => {
  if (cachedHugeDocumentBlocks.length >= blocks) {
    return structuredClone(cachedHugeDocumentBlocks.slice(0, blocks));
  }

  cachedHugeDocumentBlocks.length = 0;
  cachedHugeDocumentBlocks.push(...buildHugeDocumentBlocks(blocks));

  return structuredClone(cachedHugeDocumentBlocks.slice(0, blocks));
};

export const createHugeDocumentValue = ({
  blocks = DEFAULT_HUGE_DOCUMENT_BLOCKS,
  engine = 'plate',
}: {
  blocks?: number;
  engine?: HugeDocumentEngine;
} = {}): Value => {
  const hugeDocumentBlocks = getHugeDocumentBlocks(blocks);

  return engine === 'slate'
    ? toPliteValue(hugeDocumentBlocks)
    : toPlateValue(hugeDocumentBlocks);
};
