import { faker } from '@faker-js/faker';
import type { Value } from 'platejs';

import { DEFAULT_HUGE_DOCUMENT_BLOCKS } from '@/lib/huge-document-config';

type HugeDocumentBlock = {
  text: string;
  type: 'heading-one' | 'paragraph';
};

type HugeDocumentEngine = 'plate' | 'slate';

const HEADING_INTERVAL = 100;
const cachedHugeDocumentBlocks: HugeDocumentBlock[] = [];

const toPlateValue = (blocks: HugeDocumentBlock[]): Value =>
  blocks.map(({ text, type }) => ({
    children: [{ text }],
    type: type === 'heading-one' ? 'h1' : 'p',
  })) as Value;

const toSlateValue = (blocks: HugeDocumentBlock[]): Value =>
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

  faker.seed(1);

  for (let index = cachedHugeDocumentBlocks.length; index < blocks; index++) {
    if (index % HEADING_INTERVAL === 0) {
      cachedHugeDocumentBlocks.push({
        text: faker.lorem.sentence(),
        type: 'heading-one',
      });
    } else {
      cachedHugeDocumentBlocks.push({
        text: faker.lorem.paragraph(),
        type: 'paragraph',
      });
    }
  }

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
    ? toSlateValue(hugeDocumentBlocks)
    : toPlateValue(hugeDocumentBlocks);
};
