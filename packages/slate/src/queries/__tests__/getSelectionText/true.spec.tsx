/** @jsx jsxt */

import type { TEditor } from '../../../interfaces';;

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
) as any as TEditor;

const output = 'test';

it('should be', () => {
  expect(getSelectionText(input)).toBe(output);
});
