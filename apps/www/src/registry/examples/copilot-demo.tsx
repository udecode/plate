'use client';

import * as React from 'react';

import { Plate } from '@udecode/plate/react';

import { copilotPlugins } from '@/registry/components/editor/plugins/copilot-plugins';
import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/components/editor/use-create-editor';
import { copilotValue } from '@/registry/examples/values/copilot-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function CopilotDemo() {
  const editor = useCreateEditor({
    plugins: [...copilotPlugins, ...editorPlugins],
    value: copilotValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
