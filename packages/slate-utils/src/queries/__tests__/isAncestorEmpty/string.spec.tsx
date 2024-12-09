/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';

import { isAncestorEmpty } from '../../isAncestorEmpty';

jsxt;

const input = (
  <hp>
    test
    <cursor />
  </hp>
) as any as SlateEditor;

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
