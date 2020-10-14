/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { jsx } from '../../../../__test-utils__/jsx';
import { ParagraphPlugin } from '../../../../elements/paragraph/ParagraphPlugin';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

const input1: SlatePlugin[] = [ParagraphPlugin()];

const output = (
  <fragment>
    <hp>first</hp>
    <hp>second</hp>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLToDocumentFragment({
      plugins: input1,
      element: '<p>first</p><p>second</p>',
    })
  ).toEqual(output);
});
