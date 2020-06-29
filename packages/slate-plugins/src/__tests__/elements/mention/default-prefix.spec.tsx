/** @jsx jsx */

import { withReact } from 'slate-react';
import { jsx } from '../../../__test-utils__/jsx';
import { pipe } from '../../../common/utils';
import { withInlineVoid } from '../../../element';
import { MENTION } from '../../../elements';

const input = (
  <editor>
    <hp>
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext />
      <element type="mention" mentionable={{ value: 'Count Duku' }}>
        <htext />
      </element>
      <htext />
    </hp>
  </editor>
) as any;

it('should insert mention', () => {
  const editor = pipe(
    input,
    withReact,
    withInlineVoid({ inlineTypes: [MENTION], voidTypes: [MENTION] })
  );

  editor.insertNode({
    type: 'mention',
    mentionable: { value: 'Count Duku' },
    children: [{ text: '' }],
  });

  expect(input.children).toEqual(output.children);
});
