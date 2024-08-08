/** @jsx jsx */

import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';

import { AutoformatPlugin } from '../../AutoformatPlugin';
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

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure({
        rules: [
          {
            ignoreTrim: true,
            match: '*',
            mode: 'mark',
            type: MARK_ITALIC,
          },
        ],
      }),
    });

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

      const editor = withAutoformat({
        editor: withReact(input),
        plugin: AutoformatPlugin.configure({
          rules: [
            {
              match: { end: '***__', start: '___***' },
              mode: 'mark',
              trigger: '_',
              type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
            },
          ],
        }),
      });

      editor.insertText(' ');

      expect(input.children).toEqual(output.children);
    });
  });
});
