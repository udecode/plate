/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { jsxt } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { isWordAfterTrigger } from '../../isWordAfterTrigger';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor /> test2
    </hp>
  </editor>
) as any as SlateEditor;

const at = Range.start(input.selection as Range);

const output = {
  match: null,
  range: undefined,
};

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' })).toEqual(output);
});
