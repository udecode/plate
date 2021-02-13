/** @jsx jsx */

import { getHtmlDocument } from '../../../../__test-utils__/getHtmlDocument';
import { jsx } from '../../../../__test-utils__/jsx';
import { getElementDeserializer } from '../../../../common/utils';
import { deserializeHTMLElement } from '../../../index';

const html1 = '<html><body><div data-poll-id="456"/></body></html>';
const element1 = getHtmlDocument(html1).body;
const input1 = {
  plugins: [
    {
      deserialize: {
        element: getElementDeserializer({
          type: 'poll',
          node: (el) => ({
            type: 'poll',
            id: el.getAttribute('data-poll-id'),
          }),
          rules: [{ attribute: 'data-poll-id' }],
        }),
      },
    },
  ],
  element: element1,
};

const output = (
  <editor>
    <block type="poll" id="456">
      <htext />
    </block>
  </editor>
) as any;

it('should match with the attribute name', () => {
  expect(deserializeHTMLElement(input1)).toEqual(output.children);
});

const html2 = '<html><body><div data-type="poll" data-id="456"/></body></html>';
const element2 = getHtmlDocument(html2).body;
const input2 = {
  plugins: [
    {
      deserialize: {
        element: getElementDeserializer({
          type: 'poll',
          node: (el) => ({
            type: 'poll',
            id: el.getAttribute('data-id'),
          }),
          rules: [{ attribute: { 'data-type': 'poll' } }],
        }),
      },
    },
  ],
  element: element2,
};

it('should match with the attribute name and value', () => {
  expect(deserializeHTMLElement(input2)).toEqual(output.children);
});
