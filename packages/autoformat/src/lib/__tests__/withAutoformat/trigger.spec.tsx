/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from './createAutoformatEditor';

jsxt;

describe('AutoformatPlugin trigger handling', () => {
  it('formats marks when a custom trigger closes the match', () => {
    const input = (
      <fragment>
        <hp>
          _***hello***
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
          ignoreTrim: true,
          match: { end: '***', start: '_***' },
          mode: 'mark',
          trigger: '_',
          type: [KEYS.underline, KEYS.bold, KEYS.italic],
        },
      ],
      value: input,
    });

    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });

  it.each([
    {
      enableUndoOnDelete: true,
      expected: (
        <fragment>
          <hp>
            1/4
            <cursor />
          </hp>
        </fragment>
      ) as any,
      title: 'restores the original match when undo-on-delete is enabled',
    },
    {
      enableUndoOnDelete: false,
      expected: (
        <fragment>
          <hp>
            ¼<cursor />
          </hp>
        </fragment>
      ) as any,
      title: 'deletes the formatted character when undo-on-delete is disabled',
    },
  ])('$title', ({ enableUndoOnDelete, expected }) => {
    const input = (
      <fragment>
        <hp>
          1/
          <cursor />
        </hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      enableUndoOnDelete,
      rules: [
        {
          format: '¼',
          match: '1/4',
          mode: 'text',
        },
      ],
      value: input,
    });

    editor.tf.insertText('4');
    editor.tf.deleteBackward();

    expect(input.children).toEqual(expected.children);
  });
});
