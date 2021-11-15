/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { createTablePlugin } from '../../../../../../elements/table/src/createTablePlugin';
import { createPlateUIEditor } from '../../../../../../plate/src/utils/createPlateUIEditor';
import { deserializeHTMLElement } from '../../utils/deserializeHTMLElement';

jsx;

const html =
  '<html><body><table><tbody><tr><th colspan="2" bgcolor="#CCC">header</th></tr><tr><td>cell 1</td><td>cell 2</td></tr></tbody></table></body></html>';
const element = getHtmlDocument(html).body;

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
  expect(
    deserializeHTMLElement(
      createPlateUIEditor({
        plugins: [createTablePlugin()],
      }),
      { element }
    )
  ).toEqual(output.children);
});
