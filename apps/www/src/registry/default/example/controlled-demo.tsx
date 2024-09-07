import React from 'react';

import {
  Plate,
  focusEditor,
  focusEditorEdge,
  usePlateEditor,
} from '@udecode/plate-common/react';

import { Button } from '@/registry/default/plate-ui/button';
import { Editor } from '@/registry/default/plate-ui/editor';

export default function ControlledEditorDemo() {
  const editor = usePlateEditor({
    value: [
      {
        children: [{ text: 'Initial Value' }],
        type: 'p',
      },
    ],
  });

  return (
    <div>
      <Plate editor={editor}>
        <Editor />
      </Plate>

      <div className="mt-4 flex flex-col gap-2">
        <Button
          onClick={() => {
            // Replace with HTML string
            editor.tf.setValue([
              {
                children: [{ text: 'Replaced Value' }],
                type: 'p',
              },
            ]);

            focusEditorEdge(editor, { edge: 'end' });
          }}
        >
          Replace Value
        </Button>

        <Button
          onClick={() => {
            editor.tf.reset();

            focusEditor(editor);
          }}
        >
          Reset Editor
        </Button>
      </div>
    </div>
  );
}
