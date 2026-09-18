'use client';

import { CodeDrawingPlugin } from 'platejs/code-drawing/react';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { CodeDrawingElement } from '@/registry/components/editor/code-drawing';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { codeDrawingValue } from '@/registry/examples/values/code-drawing-value';

export default function CodeDrawingDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      CodeDrawingPlugin.configure({ component: CodeDrawingElement }),
    ],
    initialValue: codeDrawingValue,
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
