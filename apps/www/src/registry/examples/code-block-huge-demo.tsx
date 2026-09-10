'use client';

import { Plate, useCreateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

import { createValue } from './values/demo-values';

export default function CodeBlockHugeDemo({ id }: { id: string }) {
  const editor = useCreateEditor({
    plugins: EditorKit,
    initialValue: createValue(id),
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
