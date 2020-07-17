/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';

export const input = ((
  <editor>
    <hembed url="test" />
  </editor>
) as any) as Editor;

export const output = (
  <editor>
    <hembed url="change">
      <cursor />
    </hembed>
  </editor>
) as any;
