/** @jsx jsxt */

import { KEYS } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { createAutoformatEditor } from '../createAutoformatEditor';

jsxt;

const input = (
  <fragment>
    <hp>
      {'>'}
      <cursor />
      hello
    </hp>
  </fragment>
) as any;

const output = (
  <fragment>
    <hblockquote>hello</hblockquote>
  </fragment>
) as any;

it('formats > into a blockquote', () => {
  const editor = createAutoformatEditor({
    rules: [{ match: '> ', mode: 'block', type: KEYS.blockquote }],
    value: input,
  });

  editor.tf.insertText(' ');

  expect(input.children).toEqual(output.children);
});
