'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function EditorDisabled() {
  const editor = usePlateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor disabled placeholder="Type your message here." />
      </EditorContainer>
    </Plate>
  );
}
