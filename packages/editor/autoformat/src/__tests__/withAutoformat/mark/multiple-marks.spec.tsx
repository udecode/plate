/** @jsx jsx */

import { MARK_BOLD } from '@udecode/plate-basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '@udecode/plate-basic-marks/src/createItalicPlugin';
import { MARK_UNDERLINE } from '@udecode/plate-basic-marks/src/createUnderlinePlugin';
import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

import { withAutoformat } from '@/editor/autoformat/src/withAutoformat';
import { autoformatPlugin } from '@/plate/autoformat/autoformatPlugin';

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
      mockPlugin(autoformatPlugin as any)
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
