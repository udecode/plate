/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import type { TEditor } from '../../../interfaces';

import { isWordAfterTrigger } from '../../isWordAfterTrigger';

jsxt;

const input = (
  <editor>
    <hp>
      @test
      <cursor /> test2
    </hp>
  </editor>
) as any as TEditor;

const at = Range.start(input.selection as Range);

const output = 'test';

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match?.[1]).toBe(
    output
  );
});
