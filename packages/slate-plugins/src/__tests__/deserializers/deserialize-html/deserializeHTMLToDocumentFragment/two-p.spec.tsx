/** @jsx jsx */

import { getHtmlDocument } from '__test-utils__/getHtmlDocument';
import { jsx } from '__test-utils__/jsx';
import { SlatePlugin } from 'common/types';
import { deserializeHTMLToDocumentFragment } from '../../../../deserializers/deserialize-html/utils';
import { ParagraphPlugin } from '../../../../elements/paragraph';

const html = '<p>first</p><p>second</p>';
const input1: SlatePlugin[] = [ParagraphPlugin()];
const input2 = getHtmlDocument(html).body;

const output = (
  <fragment>
    <hp>first</hp>
    <hp>second</hp>
  </fragment>
) as any;

it('should have the break line', () => {
  expect(deserializeHTMLToDocumentFragment(input1)(input2)).toEqual(output);
});
