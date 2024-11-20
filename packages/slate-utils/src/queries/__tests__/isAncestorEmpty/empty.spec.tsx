/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { jsxt } from '@udecode/plate-test-utils';

import { isAncestorEmpty } from '../../isAncestorEmpty';

jsxt;

const input = (
  <hp>
    <cursor />
  </hp>
) as any as SlateEditor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
