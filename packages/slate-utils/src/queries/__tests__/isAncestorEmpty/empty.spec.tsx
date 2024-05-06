/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-common';

import { jsx } from '@udecode/plate-test-utils';

import { isAncestorEmpty } from '../../isAncestorEmpty';

jsx;

const input = (
  <hp>
    <cursor />
  </hp>
) as any as PlateEditor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
