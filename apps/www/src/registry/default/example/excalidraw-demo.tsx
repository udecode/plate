'use client';

import React from 'react';

import { Plate } from '@udecode/plate-common/react';
import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { excalidrawValue } from '@/registry/default/example/values/excalidraw-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { ExcalidrawElement } from '@/registry/default/plate-ui/excalidraw-element';

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
