/** @jsx jsxt */

import { getHtmlDocument, jsxt } from '@platejs/test-utils';

import { createSlateEditor } from '../../../editor';
import { deserializeHtmlNode } from './deserializeHtmlNode';

jsxt;

describe('when element has a br', () => {
  const editor = createSlateEditor({ plugins: [] });

  const html = '<html><body>test<br /></body></html>';
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test{'\n'}</htext>
    </editor>
  ) as any;

  it('converts br tags to newlines', () => {
    expect(deserializeHtmlNode(editor)(element)).toEqual(output.children);
  });
});
