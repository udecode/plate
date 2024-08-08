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
      {'>'}
      <cursor />
      hello
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hblockquote>hello</hblockquote>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat({
    editor: withReact(input),
    plugin: AutoformatPlugin.configure(autoformatOptions),
  });

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
