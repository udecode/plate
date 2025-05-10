'use client';

import { Plate } from '@udecode/plate/react';

import { useCreateEditor } from '@/registry/blocks/editor-basic/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}
