/** @jsx jsx */
import React from 'react';
import { PlateEditor, TPlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const input1 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as SPEditor;

export const output1 = (
  <editor>
    <hp>
      test
      <ha url="https://i.imgur.com/removed.png">
        https://i.imgur.com/removed.png
      </ha>
      <cursor />
    </hp>
  </editor>
) as any;

export const input2 = ((
  <editor>
    <hp>
      <ha url="https://i.imgur.com/removed.png">
        <cursor />
        https://i.imgur.com/removed.png
      </ha>
    </hp>
  </editor>
) as any) as SPEditor;

export const output2 = (
  <editor>
    <hp>
      <htext />
      <ha url="https://i.imgur.com/changed.png">
        <cursor />
        https://i.imgur.com/removed.png
      </ha>
      <htext />
    </hp>
  </editor>
) as any;

export const input3 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as SPEditor;

export const output3 = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;
