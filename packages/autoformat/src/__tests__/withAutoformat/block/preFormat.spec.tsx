/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

const input = (
  <editor>
    <hul>
      <hli>
        <hp>
          #
          <cursor />
          hello
        </hp>
      </hli>
    </hul>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>hello</hh1>
  </editor>
) as any;

it('should autoformat', () => {
  const editor = withAutoformat({
    editor: withReact(input),
    plugin: AutoformatPlugin.configure(getAutoformatOptions()),
  });

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
