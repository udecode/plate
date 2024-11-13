/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { BaseAutoformatPlugin } from '../../../BaseAutoformatPlugin';

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
    plugins: [
      BaseAutoformatPlugin.configure({ options: getAutoformatOptions() }),
    ],
    value: input,
  });

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
