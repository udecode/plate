'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function MyEditorPage() {
  const editor = usePlateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
