'use client';

import * as React from 'react';

import { CodeDrawingPlugin } from '@platejs/code-drawing/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { codeDrawingValue } from '@/registry/examples/values/code-drawing-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { CodeDrawingElement } from '@/registry/ui/code-drawing-node';

export default function CodeDrawingDemo() {
  const editor = usePlateEditor({
    plugins: [
      ...EditorKit,
      CodeDrawingPlugin.withComponent(CodeDrawingElement),
    ],
    value: codeDrawingValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
