'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const INITIAL_VALUE = [
  {
    children: [
      {
        text: 'Yjs transport, persistence, authentication, and room naming are application-owned.',
      },
    ],
    type: 'p',
  },
];

export default function CollaborativeEditingDemo(): React.ReactNode {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: INITIAL_VALUE,
  });

  return (
    <div className="flex flex-col" data-collaboration-demo="app-owned-yjs">
      <div className="rounded-md bg-muted p-4 text-muted-foreground text-sm">
        <strong>Collaboration boundary:</strong> Plate renders the editor
        surface. Your app owns the Yjs provider, transport, persistence,
        authentication, room naming, and cursor data.
      </div>

      <div className="flex-1 overflow-hidden border-t">
        <Plate editor={editor}>
          <EditorContainer variant="demo">
            <Editor />
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}
