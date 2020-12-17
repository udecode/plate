/** @jsx jsx */

import { getHtmlDocument } from '../../../../__test-utils__/getHtmlDocument';
import { jsx } from '../../../../__test-utils__/jsx';
import { getElementDeserializer } from '../../../../common/utils';
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
