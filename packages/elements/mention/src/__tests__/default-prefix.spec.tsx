/** @jsx jsx */

import { withInlineVoid } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { withReact } from 'slate-react';
import { pipe } from '../../../../plate/src/pipe/pipe';
import { ELEMENT_MENTION } from '../defaults';

jsx;

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
    withInlineVoid({
      inlineTypes: [ELEMENT_MENTION],
      voidTypes: [ELEMENT_MENTION],
    })
  );

  editor.insertNode({
    type: 'mention',
    mentionable: { value: 'Count Duku' },
    children: [{ text: '' }],
  });

  expect(input.children).toEqual(output.children);
});
