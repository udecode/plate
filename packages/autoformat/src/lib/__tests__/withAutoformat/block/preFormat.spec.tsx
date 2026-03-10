/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from '../createAutoformatEditor';

jsxt;

const input = (
  <fragment>
    <hul>
      <hli>
        <hp>
          #
          <cursor />
          hello
        </hp>
      </hli>
    </hul>
  </fragment>
) as any;

const output = (
  <fragment>
    <hh1>hello</hh1>
  </fragment>
) as any;

it('formats a heading from inside a nested list wrapper', () => {
  const editor = createAutoformatEditor({
    rules: [{ match: '# ', mode: 'block', type: KEYS.h1 }],
    value: input,
  });

  editor.tf.insertText(' ');

  expect(input.children).toEqual(output.children);
});
