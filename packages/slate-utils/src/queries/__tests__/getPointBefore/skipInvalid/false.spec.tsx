/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';

import { getPointBeforeLocation } from '../../../getPointBeforeLocation';

jsxt;

const input = (
  <editor>
    <hp>
      test http://google.com
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = undefined;

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      matchString: '3',
      skipInvalid: false,
    })
  ).toEqual(output);
});
