/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from '../createAutoformatEditor';

jsxt;

describe('AutoformatPlugin multi-mark rules', () => {
  it('formats triple asterisks into bold italic text', () => {
    const input = (
      <fragment>
        <hp>
          ***hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic>
            hello
          </htext>
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [
        {
          match: '***',
          mode: 'mark',
          type: [KEYS.bold, KEYS.italic],
        },
      ],
      value: input,
    });

    editor.tf.insertText('*');
    editor.tf.insertText('*');
    editor.tf.insertText('*');

    expect(input.children).toEqual(output.children);
  });

  it('formats a custom nested mark rule when the closing trigger arrives', () => {
    const input = (
      <fragment>
        <hp>
          ___***hello
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>
          <htext bold italic underline>
            hello
          </htext>
        </hp>
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

    editor.tf.insertText('*');
    editor.tf.insertText('*');
    editor.tf.insertText('*');
    editor.tf.insertText('_');
    editor.tf.insertText('_');
    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
