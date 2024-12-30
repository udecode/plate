/** @jsx jsxt */

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { isBlockTextEmptyAfterSelection } from '../../isBlockTextEmptyAfterSelection';

jsxt;

const input = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any as TEditor;

const output = true;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input as any,
    plugins: [LinkPlugin],
  });

  expect(isBlockTextEmptyAfterSelection(editor as any)).toEqual(output);
});
