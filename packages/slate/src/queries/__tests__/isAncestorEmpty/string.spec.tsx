/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { isAncestorEmpty } from '../../isAncestorEmpty';

jsxt;

const input = (
  <hp>
    test
    <cursor />
  </hp>
) as any as TEditor;

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
