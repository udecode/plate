/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { createEditorPlugins } from '../../../../../slate-plugins/src/__fixtures__/editor.fixtures';
import { useParagraphPlugin } from '../../../../../slate-plugins/src/elements/paragraph/useParagraphPlugin';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

const html = '<p>first</p><p>second</p>';
// eslint-disable-next-line react-hooks/rules-of-hooks
const input1: SlatePlugin[] = [useParagraphPlugin()];
const input2 = getHtmlDocument(html).body;

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
      element: input2,
    })
  ).toEqual(output);
});
