'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/plugins';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function EditorDefault() {
  const editor = usePlateEditor({
    plugins: EditorKit,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type your message here." />
      </EditorContainer>
    </Plate>
  );
}
