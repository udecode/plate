/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { MARK_BOLD } from '../../../../marks/basic-marks/src/bold/defaults';
import { MARK_ITALIC } from '../../../../marks/basic-marks/src/italic/defaults';
import { MARK_UNDERLINE } from '../../../../marks/basic-marks/src/underline/defaults';
import { withAutoformat } from '../../createAutoformatPlugin';

jsx;

const input = (
  <editor>
    <hp>
      _***hello***
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

describe('when trigger is defined', () => {
  it('should autoformat', () => {
    const editor = withAutoformat({
      rules: [
        {
          mode: 'mark',
          type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
          match: { start: '_***', end: '***' },
          trigger: '_',
          ignoreTrim: true,
        },
      ],
    })(withReact(input));

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
