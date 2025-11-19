'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/registry/ui/editor';

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
        <EditorContainer>
          <Editor className="px-0" />
        </EditorContainer>
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

            editor.tf.focus({ edge: 'endEditor' });
          }}
        >
          Replace Value
        </Button>

        <Button
          onClick={() => {
            editor.tf.reset();
            editor.tf.focus();
          }}
        >
          Reset Editor
        </Button>
      </div>

      <hr className="my-8" />
      <h2 className="mb-2 font-semibold text-lg">Async Controlled Editor</h2>
      <AsyncControlledEditorDemo />
    </div>
  );
}

function AsyncControlledEditorDemo() {
  const [initialValue, setInitialValue] = React.useState<
    { children: { text: string }[]; type: string }[] | undefined
  >(undefined);
  const [loading, setLoading] = React.useState(true);
  const editor = usePlateEditor({
    skipInitialization: true,
  });

  React.useEffect(() => {
    // Simulate async fetch
    setTimeout(() => {
      setInitialValue([
        {
          children: [{ text: 'Loaded async value!' }],
          type: 'p',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  React.useEffect(() => {
    if (!loading && initialValue) {
      editor.tf.init({ autoSelect: 'end', value: initialValue });
    }
  }, [loading, initialValue, editor]);

  if (loading) return <div>Loading…</div>;

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor className="px-0" />
      </EditorContainer>
    </Plate>
  );
}
