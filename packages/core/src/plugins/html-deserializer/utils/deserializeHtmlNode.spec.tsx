/** @jsx jsx */

import { getHtmlDocument, jsx } from '@udecode/plate-test-utils';
import { deserializeHtmlNode } from './deserializeHtmlNode';

import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

jsx;

describe('when element has a br', () => {
  const editor = createPlateUIEditor({ plugins: [] });

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
