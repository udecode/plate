import faker from 'faker';
import { Node } from 'slate';

const HEADINGS = 100;
const PARAGRAPHS = 7;
export const initialValue: Node[] = [];

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    type: 'heading',
    children: [{ text: faker.lorem.sentence() }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValue.push({
      children: [{ text: faker.lorem.paragraph() }],
    });
  }
}
