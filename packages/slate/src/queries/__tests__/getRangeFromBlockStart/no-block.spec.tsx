/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = (
  <editor>
    te
    <cursor />
    st
  </editor>
) as any as TEditor;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
