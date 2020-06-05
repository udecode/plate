import { SlateDocument, SlatePlugin } from '../../../../common';
import { deserializeHTMLToDocument } from '../../../../deserializers/deserialize-html';

const plugins: SlatePlugin[] = [];
const body = document.createElement('span');

const output: SlateDocument = [
  {
    children: [{ text: '' }],
  },
];

it('should be', () => {
  expect(deserializeHTMLToDocument(plugins)(body)).toEqual(output);
});
