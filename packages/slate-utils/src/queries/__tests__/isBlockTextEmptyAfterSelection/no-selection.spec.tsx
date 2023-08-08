/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { TEditor } from '@udecode/slate';

import { isBlockTextEmptyAfterSelection } from '../../isBlockTextEmptyAfterSelection';

jsx;

const editor = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>test</ha>
    </hp>
  </editor>
) as any as TEditor;

const output = false;

it('should be', () => {
  editor.isInline = (element) => element.type === 'a';

  expect(isBlockTextEmptyAfterSelection(editor)).toEqual(output);
});
