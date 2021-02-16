/** @jsx jsx */

import { SlatePlugin } from '@udecode/slate-plugins-core';
import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { deserializeHTMLToDocumentFragment } from '../../utils/deserializeHTMLToDocumentFragment';

const html = '<div>test</div>';
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <htext>test</htext>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(
    deserializeHTMLToDocumentFragment({
      plugins: input1,
      element: input2,
    })
  ).toEqual(output);
});
