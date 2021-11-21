/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Element } from 'slate';
import { PlateEditor } from '../../../../types/PlateEditor';
import { isAncestorEmpty } from '../../../queries/index';

jsx;

const input = ((
  <hp>
    test
    <cursor />
  </hp>
) as any) as PlateEditor;

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input as Element)).toEqual(output);
});
