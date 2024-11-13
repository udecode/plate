/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { jsxt } from '@udecode/plate-test-utils';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = (
  <editor>
    te
    <cursor />
    st
  </editor>
) as any as SlateEditor;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
