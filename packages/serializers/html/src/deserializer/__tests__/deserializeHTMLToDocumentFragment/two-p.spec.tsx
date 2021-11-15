/** @jsx jsx */

import { PlatePlugin } from '@udecode/plate-core';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

const html = '<p>first</p><p>second</p>';
// eslint-disable-next-line react-hooks/rules-of-hooks
const input1: PlatePlugin[] = [createParagraphPlugin()];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <hp>first</hp>
    <hp>second</hp>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLToDocumentFragment(createPlateUIEditor(), {
      plugins: input1,
      element: input2,
    })
  ).toEqual(output);
});
