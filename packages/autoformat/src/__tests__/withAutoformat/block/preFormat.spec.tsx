/** @jsx jsx */

import { withAutoformat } from '@/packages/autoformat/src/withAutoformat';
import { autoformatPlugin } from '@/plate/demo/plugins/autoformatPlugin';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

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
  const editor = withAutoformat(
    withReact(input),
    mockPlugin(autoformatPlugin as any)
  );

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
