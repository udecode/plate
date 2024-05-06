/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-common';

import { jsx } from '@udecode/plate-test-utils';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsx;

const input = (
  <editor>
    te
    <cursor />
    st
  </editor>
) as any as PlateEditor;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
