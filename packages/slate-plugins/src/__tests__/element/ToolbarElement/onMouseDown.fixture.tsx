/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';

export const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hh1>
      test
      <cursor />
    </hh1>
  </editor>
) as any;
