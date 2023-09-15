import React, { useState } from 'react';
import { editorProps } from '@/plate/demo/editorProps';
import { Editor, Plate, Value } from '@udecode/plate-common';

export default function BasicEditorHandlerDemo() {
  const [debugValue, setDebugValue] = useState<Value>([]);

  return (
    <Plate
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
      <Editor {...editorProps} />
      debug value:
      <br />
      {JSON.stringify(debugValue)}
    </Plate>
  );
}
