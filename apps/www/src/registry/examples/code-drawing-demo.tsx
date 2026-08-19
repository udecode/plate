'use client';

import * as React from 'react';

import { CodeDrawingPlugin } from '@platejs/code-drawing/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/plugins';
import { codeDrawingValue } from '@/registry/examples/values/code-drawing-value';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { CodeDrawingElement } from '@/registry/components/editor/code-drawing';

export default function CodeDrawingDemo() {
  const editor = usePlateEditor({
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
