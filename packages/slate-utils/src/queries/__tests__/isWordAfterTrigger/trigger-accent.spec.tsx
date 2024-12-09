/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { isWordAfterTrigger } from '../../isWordAfterTrigger';

jsxt;

const input = (
  <editor>
    <hp>
      @pré
      <cursor /> test2
    </hp>
  </editor>
) as any as SlateEditor;

const at = Range.start(input.selection as Range);

const output = 'pré';

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match?.[1]).toBe(
    output
  );
});
