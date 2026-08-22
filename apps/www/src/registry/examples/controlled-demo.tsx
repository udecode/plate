'use client';

import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

const initialValue = [
  {
    children: [{ text: 'Initial Value' }],
    type: 'paragraph',
  },
];

const replacedValue = [
  {
    children: [{ text: 'Replaced Value' }],
    type: 'paragraph',
  },
];

export default function ControlledEditorDemo() {
  const editor = usePlateEditor({
    initialValue,
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
            editor.update((tx) => {
              tx.value.replace({ children: replacedValue });
              const end = tx.points.end([]);

              if (end) tx.selection.set(end);
            });

            editor.api.dom.focus();
          }}
        >
          Replace Value
        </Button>

        <Button
          onClick={() => {
            editor.update.value.replace({ children: initialValue });
            editor.api.dom.focus();
          }}
        >
          Reset Editor
        </Button>
      </div>

      <hr className="my-8" />
      <h2 className="mb-2 text-lg font-semibold">Async Controlled Editor</h2>
      <AsyncControlledEditorDemo />
    </div>
  );
}

function AsyncControlledEditorDemo() {
  const [innerInitialValue, setInitialValue] = React.useState<
    Array<{ children: Array<{ text: string }>; type: string }> | undefined
  >(undefined);
  const [loading, setLoading] = React.useState(true);
  const editor = usePlateEditor();

  React.useEffect(() => {
    // Simulate async fetch
    setTimeout(() => {
      setInitialValue([
        {
          children: [{ text: 'Loaded async value!' }],
          type: 'paragraph',
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  React.useEffect(() => {
    if (!loading && innerInitialValue) {
      editor.update((tx) => {
        tx.value.replace({ children: innerInitialValue });
        const end = tx.points.end([]);

        if (end) tx.selection.set(end);
      });
    }
  }, [loading, innerInitialValue, editor]);

  if (loading) return <div>Loading…</div>;

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor className="px-0" />
      </EditorContainer>
    </Plate>
  );
}
