/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { isPointAtWordEnd } from '../../isPointAtWordEnd';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
      test2
    </hp>
  </editor>
) as any as SlateEditor;

const at = Range.start(input.selection as Range);

const output = false;

it('should be', () => {
  expect(isPointAtWordEnd(input, { at })).toEqual(output);
});
