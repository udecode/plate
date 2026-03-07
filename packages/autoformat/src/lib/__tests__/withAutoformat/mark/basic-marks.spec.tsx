/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import type { AutoformatRule } from '../../../types';
import { createAutoformatEditor } from '../createAutoformatEditor';

jsxt;

describe('AutoformatPlugin basic mark rules', () => {
  it.each([
    {
      input: (
        <fragment>
          <hp>
            **hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext bold>hello</htext>
          </hp>
        </fragment>
      ) as any,
      rules: [
        { match: '**', mode: 'mark', type: KEYS.bold },
      ] satisfies AutoformatRule[],
      text: ['*', '*'],
      title: 'formats bold text',
    },
    {
      input: (
        <fragment>
          <hp>
            *hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext italic>hello</htext>
          </hp>
        </fragment>
      ) as any,
      rules: [
        { match: '*', mode: 'mark', type: KEYS.italic },
      ] satisfies AutoformatRule[],
      text: ['*'],
      title: 'formats italic text',
    },
    {
      input: (
        <fragment>
          <hp>
            `hello
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext code>hello</htext>
          </hp>
        </fragment>
      ) as any,
      rules: [
        { match: '`', mode: 'mark', type: KEYS.code },
      ] satisfies AutoformatRule[],
      text: ['`'],
      title: 'formats code text',
    },
    {
      input: (
        <fragment>
          <hp>
            ~~hello~
            <cursor />
          </hp>
        </fragment>
      ) as any,
      output: (
        <fragment>
          <hp>
            <htext strikethrough>hello</htext>
          </hp>
        </fragment>
      ) as any,
      rules: [
        { match: '~~', mode: 'mark', type: KEYS.strikethrough },
      ] satisfies AutoformatRule[],
      text: ['~'],
      title: 'formats strikethrough text',
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
});
