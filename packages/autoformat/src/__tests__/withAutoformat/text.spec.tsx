/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { optionsAutoformat } from '../../../../../docs/src/live/config/pluginOptions';
import { withAutoformat } from '../../createAutoformatPlugin';

jsx;

describe('when #space', () => {
  it('should set block type to h1', () => {
    const input = (
      <editor>
        <hp>
          -
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          —
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(optionsAutoformat)(withReact(input));

    editor.insertText('-');

    expect(input.children).toEqual(output.children);
  });
});
