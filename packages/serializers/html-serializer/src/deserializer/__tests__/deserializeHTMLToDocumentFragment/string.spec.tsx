/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { useParagraphPlugin } from '../../../../../../elements/paragraph/src/useParagraphPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

const input1: SlatePlugin[] = [useParagraphPlugin()];

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
