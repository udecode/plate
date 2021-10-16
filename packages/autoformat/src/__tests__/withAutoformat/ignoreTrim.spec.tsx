/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { CONFIG } from '../../../../../docs/src/live/config/config';
import { MARK_ITALIC } from '../../../../marks/basic-marks/src/italic/defaults';
import { withAutoformat } from '../../createAutoformatPlugin';

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
      rules: [
        {
          mode: 'mark',
          type: MARK_ITALIC,
          match: '*',
          ignoreTrim: true,
        },
      ],
    })(withReact(input));

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

      const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

      editor.insertText(' ');

      expect(input.children).toEqual(output.children);
    });
  });
});
