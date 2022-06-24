/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { CONFIG } from '../../../../../../../examples/next/src/config/config';
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
  const editor = withAutoformat(
    withReact(input),
    mockPlugin(CONFIG.autoformat as any)
  );

  editor.insertText(' ');

  expect(input.children).toEqual(output.children);
});
