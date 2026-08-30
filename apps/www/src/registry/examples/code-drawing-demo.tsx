'use client';

import { CodeDrawingPlugin } from 'platejs/code-drawing/react';
import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { CodeDrawingElement } from '@/registry/components/editor/code-drawing';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
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
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
