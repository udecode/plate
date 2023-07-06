import React, { useState } from 'react';
import { editableProps } from '@/plate/demo/editableProps';
import { Plate } from '@udecode/plate-common';

import { MyValue } from '@/types/plate-types';

export default function BasicEditorHandlerDemo() {
  const [debugValue, setDebugValue] = useState<MyValue | null>(null);

  return (
    <Plate<MyValue>
      editableProps={editableProps}
      initialValue={[
        {
          type: 'p',
          children: [
            {
              text: 'This is editable plain text with react and history plugins, just like a textarea!',
            },
          ],
        },
      ]}
      onChange={(newValue) => {
        setDebugValue(newValue);
        // save newValue...
      }}
    >
      debug value:
      <br />
      {JSON.stringify(debugValue)}
    </Plate>
  );
}
