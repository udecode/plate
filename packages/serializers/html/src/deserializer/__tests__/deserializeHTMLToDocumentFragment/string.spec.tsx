/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { PlatePlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../../elements/paragraph/src/createParagraphPlugin';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

jsx;

const input1: PlatePlugin[] = [createParagraphPlugin()];

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
      element: '<p>first</p><p>second</p>',
    })
  ).toEqual(output);
});
