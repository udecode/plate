/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { autoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

const input = (
  <editor>
    <hp>
      **hello
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext bold>hello</htext>
    </hp>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat({
    editor: withReact(input),
    plugin: AutoformatPlugin.configure(autoformatOptions),
  });

  editor.insertText('*');
  editor.insertText('*');

  expect(input.children).toEqual(output.children);
});
