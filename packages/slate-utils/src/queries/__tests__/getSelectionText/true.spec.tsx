/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';

import { getSelectionText } from '../../getSelectionText';

jsxt;

const input = (
  <editor>
    <hp>
      <anchor />
      test
      <focus />
    </hp>
  </editor>
) as any as SlateEditor;

const output = 'test';

it('should be', () => {
  expect(getSelectionText(input)).toBe(output);
});
