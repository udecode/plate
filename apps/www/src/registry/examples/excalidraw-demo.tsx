'use client';

import React from 'react';

import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { Plate } from '@udecode/plate/react';

import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/components/editor/use-create-editor';
import { excalidrawValue } from '@/registry/examples/values/excalidraw-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { ExcalidrawElement } from '@/registry/ui/excalidraw-element';

export default function ExcalidrawDemo() {
  const editor = useCreateEditor({
    components: {
      [ExcalidrawPlugin.key]: ExcalidrawElement,
    },
    plugins: [...editorPlugins, ExcalidrawPlugin],
    value: excalidrawValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
