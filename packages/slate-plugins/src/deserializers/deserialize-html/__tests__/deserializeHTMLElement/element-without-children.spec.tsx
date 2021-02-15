/** @jsx jsx */

import { getElementDeserializer } from '@udecode/slate-plugins-common';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { deserializeHTMLElement } from '../../../index';

const html =
  '<html><body><div class="poll" data-id="456"><ul><li>Question 1</li><li>Question 2</li></ul></div></body></html>';
const element = getHtmlDocument(html).body;

const input = {
  plugins: [
    {
      deserialize: {
        element: getElementDeserializer({
          type: 'poll',
          node: (el) => ({
            type: 'poll',
            id: el.getAttribute('data-id'),
          }),
          rules: [{ className: 'poll' }],
          withoutChildren: true,
        }),
      },
    },
  ],
  element,
};

const output = (
  <editor>
    <block type="poll" id="456">
      <htext />
    </block>
  </editor>
) as any;

it('should include named attributes', () => {
  expect(deserializeHTMLElement(input)).toEqual(output.children);
});
