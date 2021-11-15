/** @jsx jsx */

import { getElementDeserializer } from '@udecode/plate-common';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

jsx;

const html =
  '<html><body><div class="poll" data-id="456"><ul><li>Question 1</li><li>Question 2</li></ul></div></body></html>';
const element = getHtmlDocument(html).body;

const output = (
  <editor>
    <element type="poll" id="456">
      <htext />
    </element>
  </editor>
) as any;

it('should include named attributes', () => {
  expect(
    deserializeHTMLElement(
      createPlateUIEditor({
        plugins: [
          {
            key: 'a',
            deserialize: () => ({
              element: getElementDeserializer({
                type: 'poll',
                getNode: (el) => ({
                  type: 'poll',
                  id: el.getAttribute('data-id'),
                }),
                rules: [{ className: 'poll' }],
                withoutChildren: true,
              }),
            }),
          },
        ],
      }),
      { element }
    )
  ).toEqual(output.children);
});
