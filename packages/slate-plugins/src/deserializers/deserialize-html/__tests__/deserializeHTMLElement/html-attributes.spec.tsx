/* eslint-disable react-hooks/rules-of-hooks */
/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/slate-plugins-test-utils';
import { createEditor } from 'slate';
import { createEditorPlugins } from '../../../../__fixtures__/editor.fixtures';
import { useTablePlugin } from '../../../../elements/table/useTablePlugin';
import { deserializeHTMLElement } from '../../../index';

const html =
  '<html><body><table><tbody><tr><th colspan="2" bgcolor="#CCC">header</th></tr><tr><td>cell 1</td><td>cell 2</td></tr></tbody></table></body></html>';
const element = getHtmlDocument(html).body;

const input = {
  plugins: [useTablePlugin()],
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
  expect(deserializeHTMLElement(createEditorPlugins(), input)).toEqual(
    output.children
  );
});
