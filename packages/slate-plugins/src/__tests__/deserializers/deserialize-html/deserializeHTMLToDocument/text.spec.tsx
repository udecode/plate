/** @jsx jsx */

import { getHtmlDocument } from '__test-utils__/getHtmlDocument';
import { jsx } from '__test-utils__/jsx';
import { SlatePlugin } from 'common/types';
import { deserializeHTMLToDocument } from '../../../../deserializers/deserialize-html';

const html = 'test';
const input1: SlatePlugin[] = [];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <block>
      <htext>test</htext>
    </block>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(deserializeHTMLToDocument(input1)(input2)).toEqual(output);
});
