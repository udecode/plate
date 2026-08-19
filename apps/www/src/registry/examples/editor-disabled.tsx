'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';

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
