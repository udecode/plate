/** @jsx jsx */

import * as React from 'react';
import { SPEditor } from '@udecode/plate-core';
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

export const input2 = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as SPEditor;

export const output2 = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;
