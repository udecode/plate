/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';

jsx;

const input = (
  <fragment>
    <hp>
      **hello
      <cursor />
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hp>
      <htext bold>hello</htext>
    </hp>
  </fragment>
) as any;

it('should autoformat', () => {
  const editor = createPlateEditor({
    plugins: [AutoformatPlugin.configure({ options: getAutoformatOptions() })],
    value: input,
  });

  editor.insertText('*');
  editor.insertText('*');

  expect(input.children).toEqual(output.children);
});
