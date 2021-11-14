import { createPlateEditor } from '../../../../../plate/src/utils/createPlateEditor';
import { deserializeHTMLToDocumentFragment } from '../../deserializer/utils/deserializeHTMLToDocumentFragment';
import { serializeHTMLFromNodes } from '../serializeHTMLFromNodes';
import { htmlStringToDOMNode } from '../utils/htmlStringToDOMNode';

it('serializes with edge case where input is non-rich text', () => {
  const input = htmlStringToDOMNode('Some non-rich text here.');
  const output = 'Some non-rich text here.';
  const editor = createPlateEditor();
  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [],
      nodes: deserializeHTMLToDocumentFragment(editor, {
        plugins: [],
        element: input,
      }),
    })
  ).toEqual(output);
});

it('serializes with edge case where input is text element', () => {
  const input = [{ text: 'Test just text.' }];
  const output = 'Test just text.';
  const editor = createPlateEditor();
  expect(
    serializeHTMLFromNodes(editor, {
      plugins: [],
      nodes: input,
    })
  ).toEqual(output);
});
