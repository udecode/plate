'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import { TablePlugin } from 'platejs/table/react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { createValue } from '@/registry/examples/values/demo-values';

export default function TableNoMergeDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      TablePlugin.configure({
        initialState: {
          disableMerge: true,
        },
      }),
    ],
    initialValue: createValue('table'),
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </EditorRoot>
  );
}
