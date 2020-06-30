/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';

export const input = ((
  <editor>
    <hactionitem checked={false}>
      test
      <cursor />
    </hactionitem>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hactionitem checked>
      test
      <cursor />
    </hactionitem>
  </editor>
) as any;
