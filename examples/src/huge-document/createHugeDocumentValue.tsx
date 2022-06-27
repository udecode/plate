/** @jsxRuntime classic */
/** @jsx jsx */
import { faker } from '@faker-js/faker';
import { TDescendant } from '@udecode/plate';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const HEADINGS = 100;
const PARAGRAPHS = 7;

export const createHugeDocumentValue = () => {
  const hugeDocument: TDescendant[] = [];

  for (let h = 0; h < HEADINGS; h++) {
    hugeDocument.push((<hh1>{faker.lorem.sentence()}</hh1>) as any);

    for (let p = 0; p < PARAGRAPHS; p++) {
      hugeDocument.push((<hp>{faker.lorem.paragraph()}</hp>) as any);
    }
  }

  return hugeDocument;
};
