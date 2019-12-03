import faker from 'faker';

const HEADINGS = 100;
const PARAGRAPHS = 7;
export const initialValue: any = [];

for (let h = 0; h < HEADINGS; h++) {
  initialValue.push({
    type: 'heading',
    children: [{ text: faker.lorem.sentence(), marks: [] }],
  });

  for (let p = 0; p < PARAGRAPHS; p++) {
    initialValue.push({
      children: [{ text: faker.lorem.paragraph(), marks: [] }],
    });
  }
}
