/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { isAncestorEmpty } from '../../isAncestorEmpty';

jsxt;

const input = (
  <hp>
    <cursor />
  </hp>
) as any as TEditor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
