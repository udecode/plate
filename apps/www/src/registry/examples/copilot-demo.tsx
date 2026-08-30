'use client';

import { Plate, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { CopilotKit } from '@/registry/components/editor/copilot';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { copilotValue } from '@/registry/examples/values/copilot-value';

export default function CopilotDemo() {
  const editor = useCreateEditor({
    plugins: [...EditorKit, ...CopilotKit],
    initialValue: copilotValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
