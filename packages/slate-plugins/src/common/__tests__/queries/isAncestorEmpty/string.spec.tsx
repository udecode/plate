/** @jsx jsx */

import { Editor, Element } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { isAncestorEmpty } from '../../../queries/index';

const input = ((
  <hp>
    test
    <cursor />
  </hp>
) as any) as Editor;

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input as Element)).toEqual(output);
});
