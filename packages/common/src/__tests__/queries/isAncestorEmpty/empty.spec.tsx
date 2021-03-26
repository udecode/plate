/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor, Element } from 'slate';
import { isAncestorEmpty } from '../../../queries/index';

jsx;

const input = ((
  <hp>
    <cursor />
  </hp>
) as any) as Editor;

const output = true;

it('should be', () => {
  expect(isAncestorEmpty(input, input as Element)).toEqual(output);
});
