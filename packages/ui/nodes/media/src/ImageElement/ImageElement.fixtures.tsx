/** @jsx jsx */

import React from 'react';
import { PlateEditor } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const imgInput = ((
  <editor>
    <himg url="https://source.unsplash.com/kFrdX5IeQzI" width="75%">
      <htext />
    </himg>
  </editor>
) as any) as PlateEditor;
