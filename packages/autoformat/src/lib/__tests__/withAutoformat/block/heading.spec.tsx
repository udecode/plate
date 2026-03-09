/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from '../createAutoformatEditor';

jsxt;

describe('AutoformatPlugin heading block rules', () => {
  it.each([
    {
      expected: (
        <fragment>
          <hh1>hello</hh1>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            #
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      match: '# ',
      title: 'formats # into an h1 block',
      type: KEYS.h1,
    },
    {
      expected: (
        <fragment>
          <hh2>hello</hh2>
        </fragment>
      ) as any,
      input: (
        <fragment>
          <hp>
            ##
            <cursor />
            hello
          </hp>
        </fragment>
      ) as any,
      match: '## ',
      title: 'formats ## into an h2 block',
      type: KEYS.h2,
    },
  ])('$title', ({ expected, input, match, type }) => {
    const editor = createAutoformatEditor({
      rules: [{ match, mode: 'block', type }],
      value: input,
    });

    editor.tf.insertText(' ');

    expect(input.children).toEqual(expected.children);
  });
});
