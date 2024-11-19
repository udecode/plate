'use client';

import React from 'react';

import { Plate } from '@udecode/plate-common/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { copilotValue } from '@/registry/default/example/values/copilot-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';

import { copilotPlugins } from '../components/editor/plugins/copilot-plugins';

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
