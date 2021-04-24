/** @jsx jsx */

import * as React from 'react';
import { SPEditor } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';

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
) as any) as Editor;

export const output2 = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;
