/** @jsx jsx */

import { createSlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';

jsx;

const input = (
  <fragment>
    <hp>
      *hello
      <cursor />
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hp>
      <htext italic>hello</htext>
    </hp>
  </fragment>
) as any;

it('should autoformat', () => {
  const editor = createSlateEditor({
    plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() })],
    value: input,
  });

  editor.insertText('*');

  expect(input.children).toEqual(output.children);
});
