/** @jsx jsx */

import React from 'react';
import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const input1 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

export const output1 = (
  <editor>
    <hp>test</hp>
    <himg url="https://i.imgur.com/removed.png">
      <htext />
      <cursor />
    </himg>
  </editor>
) as any;

export const input2 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

export const output2 = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;
