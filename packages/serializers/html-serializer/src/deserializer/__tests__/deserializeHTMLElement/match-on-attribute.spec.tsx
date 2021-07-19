/** @jsx jsx */

import { getElementDeserializer } from '@udecode/plate-common';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

const html1 = '<html><body><div data-poll-id="456"/></body></html>';
const element1 = getHtmlDocument(html1).body;
const input1 = {
  plugins: [
    {
      deserialize: () => ({
        element: getElementDeserializer({
          type: 'poll',
          getNode: (el) => ({
            type: 'poll',
            id: el.getAttribute('data-poll-id'),
          }),
          rules: [{ attribute: 'data-poll-id' }],
        }),
      }),
    },
  ],
  element: element1,
};

const output = (
  <editor>
    <element type="poll" id="456">
      <htext />
    </element>
  </editor>
) as any;

it('should match with the attribute name', () => {
  expect(deserializeHTMLElement(createEditorPlugins(), input1)).toEqual(
    output.children
  );
});

const html2 = '<html><body><div data-type="poll" data-id="456"/></body></html>';
const element2 = getHtmlDocument(html2).body;
const input2 = {
  plugins: [
    {
      deserialize: () => ({
        element: getElementDeserializer({
          type: 'poll',
          getNode: (el) => ({
            type: 'poll',
            id: el.getAttribute('data-id'),
          }),
          rules: [{ attribute: { 'data-type': 'poll' } }],
        }),
      }),
    },
  ],
  element: element2,
};

it('should match with the attribute name and value', () => {
  expect(deserializeHTMLElement(createEditorPlugins(), input2)).toEqual(
    output.children
  );
});
