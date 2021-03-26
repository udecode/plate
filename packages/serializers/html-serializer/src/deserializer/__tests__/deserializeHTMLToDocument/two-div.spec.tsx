/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { deserializeHTMLToDocument } from '../../utils/deserializeHTMLToDocument';

const html = '<div>first</div><div>second</div>';
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <element>
      <htext>first</htext>
      <htext>second</htext>
    </element>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLToDocument(
      createEditorPlugins({
        plugins: [],
      }),
      {
        plugins: [],
        element: input2,
      }
    )
  ).toEqual(output);
});
