/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import type { AutoformatRule } from '../../types';
import { createAutoformatEditor } from './createAutoformatEditor';

jsxt;

describe('AutoformatPlugin invalid match handling', () => {
  it.each([
    {
      input: (
        <fragment>
          <hp>
            hello*
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>hello* </hp>
        </fragment>
      ) as any,
      rules: [
        { match: '*', mode: 'mark', type: KEYS.italic },
      ] satisfies AutoformatRule[],
      text: [' '],
      title: 'leaves text alone when only the trailing delimiter exists',
    },
    {
      input: (
        <fragment>
          <hp>
            a**hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>a**hello**</hp>
        </fragment>
      ) as any,
      rules: [
        { match: '**', mode: 'mark', type: KEYS.bold },
      ] satisfies AutoformatRule[],
      text: ['*', '*'],
      title:
        'does not format when a non-whitespace character precedes the opening delimiter',
    },
  ])('$title', ({ input, output, rules, text }) => {
    const editor = createAutoformatEditor({
      rules,
      value: input,
    });

    text.forEach((step) => {
      editor.tf.insertText(step);
    });

    expect(input.children).toEqual(output.children);
  });

  it('ignores autoformat when selection is null', () => {
    const input = (
      <fragment>
        <hp>**hello**</hp>
      </fragment>
    ) as any;

    const output = (
      <fragment>
        <hp>**hello**</hp>
      </fragment>
    ) as any;

    const editor = createAutoformatEditor({
      rules: [{ match: '**', mode: 'mark', type: KEYS.bold }],
      value: input,
    });

    editor.tf.insertText(' ');

    expect(input.children).toEqual(output.children);
  });
});
