/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { MARK_BOLD } from '../../../../marks/basic-marks/src/bold/defaults';
import { MARK_ITALIC } from '../../../../marks/basic-marks/src/italic/defaults';
import { MARK_UNDERLINE } from '../../../../marks/basic-marks/src/underline/defaults';
import { withAutoformat } from '../../createAutoformatPlugin';

jsx;

describe('when match is an array', () => {
  it('should autoformat', () => {
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

    const editor = withAutoformat({
      rules: [
        {
          mode: 'mark',
          type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
          match: ['_***', '***_'],
          ignoreTrim: true,
        },
      ],
    })(withReact(input));

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});

describe('when match is a string', () => {
  it('should autoformat', () => {
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

    const editor = withAutoformat({
      rules: [
        {
          mode: 'mark',
          type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
          match: '_***',
          ignoreTrim: true,
        },
      ],
    })(withReact(input));

    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
