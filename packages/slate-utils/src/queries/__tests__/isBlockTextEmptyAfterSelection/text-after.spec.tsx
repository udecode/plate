/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

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
      last
    </hp>
  </editor>
) as any as SlateEditor;

const output = false;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [LinkPlugin],
  });

  expect(isBlockTextEmptyAfterSelection(editor)).toEqual(output);
});
