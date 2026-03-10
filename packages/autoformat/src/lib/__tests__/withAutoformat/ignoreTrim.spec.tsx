/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from './createAutoformatEditor';

jsxt;

describe('AutoformatPlugin ignoreTrim handling', () => {
  it('formats a mark when ignoreTrim allows surrounding whitespace', () => {
    const input = (
      <fragment>
        <hp>
          * hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext italic> hello</htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          ignoreTrim: true,
          match: '*',
          mode: 'mark',
          type: KEYS.italic,
        },
      ],
      value: input,
    });

    editor.tf.insertText('*');

    expect(input.children).toEqual(output.children);
  });

  it('leaves the text alone when whitespace prevents a trim-sensitive match', () => {
    const input = (
      <fragment>
        <hp>
          **hello **
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>**hello ** </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          match: { end: '***__', start: '___***' },
          mode: 'mark',
          trigger: '_',
          type: [KEYS.underline, KEYS.bold, KEYS.italic],
        },
      ],
      value: input,
    });

    editor.tf.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
