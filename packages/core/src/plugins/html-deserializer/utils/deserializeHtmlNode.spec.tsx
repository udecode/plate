/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { deserializeHtmlNode } from './deserializeHtmlNode';

jsx;

describe('when element has a br', () => {
  const editor = createPlateEditor({ plugins: [] });

  const html = `<html><body>test<br /></body></html>`;
  const element = getHtmlDocument(html).body;

  const output = (
    <editor>
      <htext>test{'\n'}</htext>
    </editor>
  ) as any;

  it('should have the break line', () => {
    expect(deserializeHtmlNode(editor)(element)).toEqual(output.children);
  });
});
