/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'examples/src/autoformat/autoformatPlugin';
import { withReact } from 'slate-react';
import { preFormat } from '../../../../../../../examples/src/autoformat/autoformatUtils';
import { ELEMENT_H1 } from '../../../../../../nodes/heading/src/constants';
import { withAutoformat } from '../../../withAutoformat';

jsx;

describe('when #space', () => {
  it('should set block type to h1', () => {
    const input = (
      <editor>
        <hp>
          #
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hh1>hello</hh1>
      </editor>
    ) as any;

    const editor = withAutoformat(
      withReact(input),
      mockPlugin({
        options: {
          rules: [
            {
              mode: 'block',
              type: ELEMENT_H1,
              match: '# ',
              preFormat,
            },
          ],
        },
      })
    );

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ##space', () => {
  it('should set block type to h2', () => {
    const input = (
      <editor>
        <hp>
          ##
          <cursor />
          hello
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hh2>hello</hh2>
      </editor>
    ) as any;

    const editor = withAutoformat(
      withReact(input),
      mockPlugin(autoformatPlugin as any)
    );

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
