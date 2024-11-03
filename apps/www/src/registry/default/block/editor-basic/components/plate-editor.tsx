'use client';

import { Plate } from '@udecode/plate-common/react';

import { useCreateEditor } from '@/registry/default/block/editor-basic/components/use-create-editor';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer id="scroll_container" variant="demo">
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}
