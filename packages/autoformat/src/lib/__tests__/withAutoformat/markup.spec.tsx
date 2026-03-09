/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from './createAutoformatEditor';

jsxt;

describe('AutoformatPlugin mark match parsing', () => {
  it.each([
    {
      match: ['_***', '***_'],
      title: 'formats a mark rule when match is an array',
    },
    {
      match: '_***',
      title: 'formats a mark rule when match is a string',
    },
  ])('$title', ({ match }) => {
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
          match,
          mode: 'mark',
          type: [KEYS.underline, KEYS.bold, KEYS.italic],
        },
      ],
      value: input,
    });

    editor.tf.insertText('_');

    expect(input.children).toEqual(output.children);
  });
});
