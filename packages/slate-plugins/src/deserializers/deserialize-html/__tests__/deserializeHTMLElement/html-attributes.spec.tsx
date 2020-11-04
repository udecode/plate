/** @jsx jsx */

import { getHtmlDocument } from '../../../../__test-utils__/getHtmlDocument';
import { jsx } from '../../../../__test-utils__/jsx';
import { TablePlugin } from '../../../../elements/table/index';
import { deserializeHTMLElement } from '../../../index';

const html =
  '<html><body><table><tbody><tr><th colspan="2" bgcolor="#CCC">header</th></tr><tr><td>cell 1</td><td>cell 2</td></tr></tbody></table></body></html>';
const element = getHtmlDocument(html).body;

const input = {
  plugins: [TablePlugin()],
  element,
};

const output = (
  <editor>
    <htable>
      <htr>
        <hth attributes={{ colspan: '2' }}>header</hth>
      </htr>
      <htr>
        <htd>cell 1</htd>
        <htd>cell 2</htd>
      </htr>
    </htable>
  </editor>
) as any;

it('should include named attributes', () => {
  expect(deserializeHTMLElement(input)).toEqual(output.children);
});
