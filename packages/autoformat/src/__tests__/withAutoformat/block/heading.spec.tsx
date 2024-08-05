/** @jsx jsx */

import { createPlugin } from '@udecode/plate-common';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { autoformatPlugin } from 'www/src/lib/plate/demo/plugins/autoformatPlugin';
import { preFormat } from 'www/src/lib/plate/demo/plugins/autoformatUtils';

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
      createPlugin({
        options: {
          rules: [
            {
              match: '# ',
              mode: 'block',
              preFormat: preFormat,
              type: ELEMENT_H1,
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
      createPlugin(autoformatPlugin as any)
    );

    editor.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
