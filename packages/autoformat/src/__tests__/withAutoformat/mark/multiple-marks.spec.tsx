/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { CONFIG } from '../../../../../../docs/src/live/config/config';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/bold/defaults';
import { MARK_ITALIC } from '../../../../../marks/basic-marks/src/italic/defaults';
import { MARK_UNDERLINE } from '../../../../../marks/basic-marks/src/underline/defaults';
import { withAutoformat } from '../../../createAutoformatPlugin';

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

    const editor = withAutoformat(CONFIG.autoformat)(withReact(input));

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

    const editor = withAutoformat({
      rules: [
        {
          type: [MARK_UNDERLINE, MARK_BOLD, MARK_ITALIC],
          match: { start: '___***', end: '***__' },
          trigger: '_',
          mode: 'mark',
        },
      ],
    })(withReact(input));

    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('_');
    editor.insertText('_');
    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
