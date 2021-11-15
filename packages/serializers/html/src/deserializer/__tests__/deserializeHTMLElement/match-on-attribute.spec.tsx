/** @jsx jsx */

import { getElementDeserializer } from '@udecode/plate-common';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

jsx;

const html1 = '<html><body><div data-poll-id="456"/></body></html>';
const element1 = getHtmlDocument(html1).body;

const output = (
  <editor>
    <element type="poll" id="456">
      <htext />
    </element>
  </editor>
) as any;

it('should match with the attribute name', () => {
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
                  id: el.getAttribute('data-poll-id'),
                }),
                rules: [{ attribute: 'data-poll-id' }],
              }),
            }),
          },
        ],
      }),
      { element: element1 }
    )
  ).toEqual(output.children);
});

const html2 = '<html><body><div data-type="poll" data-id="456"/></body></html>';
const element2 = getHtmlDocument(html2).body;

it('should match with the attribute name and value', () => {
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
                rules: [{ attribute: { 'data-type': 'poll' } }],
              }),
            }),
          },
        ],
      }),
      { element: element2 }
    )
  ).toEqual(output.children);
});
