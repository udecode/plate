'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

import { createValue } from './values/demo-values';

export default function CodeBlockDemo({ id }: { id: string }) {
  const editor = useCreateEditor({
    plugins: EditorKit,
    initialValue: createValue(id),
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
