'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BoardKit } from '@/registry/components/editor/board';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { boardValue } from '@/registry/examples/values/board-value';

export default function BoardDemo() {
  const editor = useCreateEditor({
    plugins: [...EditorKit, ...BoardKit],
    initialValue: boardValue,
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
