'use client';

import { Plate } from '@udecode/plate-common/react';

import { useCreateEditor } from '@/registry/default/block/editor-basic/components/editor/use-create-editor';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

export function PlateEditor() {
  const editor = useCreateEditor();

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}
