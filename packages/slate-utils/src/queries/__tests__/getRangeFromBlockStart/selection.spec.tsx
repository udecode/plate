/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { jsxt } from '@udecode/plate-test-utils';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = (
  <editor>
    <hp>
      te
      <cursor />
      st
    </hp>
  </editor>
) as any as SlateEditor;

const output: ReturnType<typeof getRangeFromBlockStart> = {
  anchor: { offset: 0, path: [0, 0] },
  focus: { offset: 2, path: [0, 0] },
};

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
