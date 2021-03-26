/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { getParagraphPlugin } from '../../../../../../elements/paragraph/src/getParagraphPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

jsx;

const input1: SlatePlugin[] = [getParagraphPlugin()];

const output = (
  <fragment>
    <hp>first</hp>
    <hp>second</hp>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLToDocumentFragment(createEditorPlugins(), {
      plugins: input1,
      element: '<p>first</p><p>second</p>',
    })
  ).toEqual(output);
});
