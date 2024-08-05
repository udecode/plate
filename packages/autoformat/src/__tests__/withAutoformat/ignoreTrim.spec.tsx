/** @jsx jsx */

import { MARK_ITALIC } from '@udecode/plate-basic-marks';
import { createPlugin } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { autoformatPlugin } from 'www/src/lib/plate/demo/plugins/autoformatPlugin';

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
      createPlugin({
        options: {
          rules: [
            {
              ignoreTrim: true,
              match: '*',
              mode: 'mark',
              type: MARK_ITALIC,
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
        createPlugin(autoformatPlugin as any)
      );

      editor.insertText(' ');

      expect(input.children).toEqual(output.children);
    });
  });
});
