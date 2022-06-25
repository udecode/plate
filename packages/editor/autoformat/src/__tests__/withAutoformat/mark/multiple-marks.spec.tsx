/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { CONFIG } from '../../../../../../../examples/src/config/config';
import { MARK_BOLD } from '../../../../../../nodes/basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '../../../../../../nodes/basic-marks/src/createItalicPlugin';
import { MARK_UNDERLINE } from '../../../../../../nodes/basic-marks/src/createUnderlinePlugin';
import { withAutoformat } from '../../../withAutoformat';

jsx;

describe('when inserting ***', () => {
  it('should autoformat to italic bold', () => {
    const input = (
      <editor>
        <hp>
          ***hello
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext bold italic>
            hello
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(
      withReact(input),
      mockPlugin(CONFIG.autoformat as any)
    );

    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when inserting ***___', () => {
  it('should autoformat to italic bold', () => {
    const input = (
      <editor>
        <hp>
          ___***hello
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext bold italic underline>
            hello
          </htext>
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(
      withReact(input),
      mockPlugin({
        options: {
          rules: [
            {
              type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
              match: { start: '___***', end: '***__' },
              trigger: '_',
              mode: 'mark',
            },
          ],
        },
      })
    );

    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('_');
    editor.insertText('_');
    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
