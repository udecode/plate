/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'www/src/registry/default/components/editor/plugins/autoformat-plugin';

jsxt;

const input = (
  <fragment>
    <hp>
      {'>'}
      <cursor />
      hello
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hblockquote>hello</hblockquote>
  </fragment>
) as any;

it('should autoformat', () => {
  const editor = createSlateEditor({
    plugins: [autoformatPlugin],
    value: input,
  });

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
