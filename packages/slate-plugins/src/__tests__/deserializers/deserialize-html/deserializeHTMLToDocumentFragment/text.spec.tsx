/** @jsx jsx */

import { getHtmlDocument } from '__test-utils__/getHtmlDocument';
import { jsx } from '__test-utils__/jsx';
import { SlatePlugin } from 'common/types';
import { deserializeHTMLToDocumentFragment } from '../../../../deserializers/deserialize-html/utils';

const html = 'test';
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <htext>test</htext>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(deserializeHTMLToDocumentFragment(input1)(input2)).toEqual(output);
});
