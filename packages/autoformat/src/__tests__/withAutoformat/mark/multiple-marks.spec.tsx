/** @jsx jsx */

import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
} from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { getAutoformatOptions } from 'www/src/lib/plate/demo/plugins/autoformatOptions';

import { AutoformatPlugin } from '../../../AutoformatPlugin';
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

    const editor = withAutoformat({
      editor: withReact(input),
      plugin: AutoformatPlugin.configure(getAutoformatOptions()),
    });

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

    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('*');
    editor.insertText('_');
    editor.insertText('_');
    editor.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
