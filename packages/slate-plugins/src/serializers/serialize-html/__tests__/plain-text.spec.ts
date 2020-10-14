import { deserializeHTMLToDocumentFragment } from '../../../deserializers/deserialize-html/utils/deserializeHTMLToDocumentFragment';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

it('serializes with edge case where input is non-rich text', () => {
  const input = htmlStringToDOMNode('Some non-rich text here.');
  const output = 'Some non-rich text here.';
  expect(
    serializeHTMLFromNodes({
      plugins: [],
      nodes: deserializeHTMLToDocumentFragment({ plugins: [], element: input }),
    })
  ).toEqual(output);
});

it('serializes with edge case where input is text element', () => {
  const input = [{ text: 'Test just text.' }];
  const output = 'Test just text.';
  expect(
    serializeHTMLFromNodes({
      plugins: [],
      nodes: input,
    })
  ).toEqual(output);
});
