/** @jsx jsx */

import { getElementDeserializer } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

const html =
  '<html><body><div class="poll" data-id="456"><ul><li>Question 1</li><li>Question 2</li></ul></div></body></html>';
const element = getHtmlDocument(html).body;

const input = {
  plugins: [
    {
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
  ] as PlatePlugin[],
  element,
};

const output = (
  <editor>
    <element type="poll" id="456">
      <htext />
    </element>
  </editor>
) as any;

it('should include named attributes', () => {
  expect(deserializeHTMLElement(createEditorPlugins(), input)).toEqual(
    output.children
  );
});
