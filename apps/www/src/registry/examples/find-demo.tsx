'use client';

import { Plate, useCreateEditor } from 'platejs/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FindKit } from '@/registry/components/editor/find';
import { EditorKit } from '@/registry/components/editor/plugins';
import { findValue } from '@/registry/examples/values/find-value';

export default function FindDemo() {
  const editor = useCreateEditor(
    {
      plugins: [...EditorKit, ...FindKit],
      initialValue: findValue,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
