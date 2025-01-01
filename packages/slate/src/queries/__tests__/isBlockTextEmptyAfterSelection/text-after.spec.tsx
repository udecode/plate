/** @jsx jsxt */

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isBlockTextEmptyAfterSelection } from '../../isBlockTextEmptyAfterSelection';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        <htext>first</htext>
        <ha>
          test
          <cursor />
        </ha>
        last
      </hp>
    </editor>
  ) as any
);

const output = false;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input as any,
    plugins: [LinkPlugin],
  });

  expect(isBlockTextEmptyAfterSelection(editor as any)).toEqual(output);
});
