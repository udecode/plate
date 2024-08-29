/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { jsx } from '@udecode/plate-test-utils';

import { isAncestorEmpty } from '../../isAncestorEmpty';

jsx;

const input = (
  <hp>
    <cursor />
  </hp>
) as any as SlateEditor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
