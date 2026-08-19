'use client';

import * as React from 'react';

import { ExcalidrawPlugin } from '@platejs/excalidraw/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/plugins';
import { excalidrawValue } from '@/registry/examples/values/excalidraw-value';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { ExcalidrawElement } from '@/registry/components/editor/excalidraw';

export default function ExcalidrawDemo() {
  const editor = usePlateEditor({
    plugins: [
      ...EditorKit,
      ExcalidrawPlugin.configure({ component: ExcalidrawElement }),
    ],
    initialValue: excalidrawValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
