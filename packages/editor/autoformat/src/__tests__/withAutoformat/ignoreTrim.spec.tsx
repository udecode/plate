/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { autoformatPlugin } from 'examples/src/autoformat/autoformatPlugin';
import { withReact } from 'slate-react';
import { MARK_ITALIC } from '../../../../../nodes/basic-marks/src/createItalicPlugin';
import { withAutoformat } from '../../withAutoformat';

jsx;

describe('when ignoreTrim is true', () => {
  it('should autoformat', () => {
    const input = (
      <editor>
        <hp>
          * hello
          <cursor />
        </hp>
      </editor>
    ) as any;

    const output = (
      <editor>
        <hp>
          <htext italic> hello</htext>
        </hp>
      </editor>
    ) as any;

    const editor = withAutoformat(
      withReact(input),
      mockPlugin({
        options: {
          rules: [
            {
              mode: 'mark',
              type: MARK_ITALIC,
              match: '*',
              ignoreTrim: true,
            },
          ],
        },
      })
    );

    editor.insertText('*');

    expect(input.children).toEqual(output.children);
  });
});

describe('when ignoreTrim is false', () => {
  describe('when the match text is not trimmed', () => {
    it('should run default', () => {
      const input = (
        <editor>
          <hp>
            **hello **
            <cursor />
          </hp>
        </editor>
      ) as any;

      const output = (
        <editor>
          <hp>**hello ** </hp>
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
});
