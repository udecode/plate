/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { jsxt } from '@udecode/plate-test-utils';

import { getPointBeforeLocation } from '../../../getPointBeforeLocation';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = { offset: 4, path: [0, 0] };

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      afterMatch: true,
      matchString: 'test',
      skipInvalid: true,
      unit: 'word',
    })
  ).toEqual(output);
});
