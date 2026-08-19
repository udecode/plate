'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/plugins';
import { CopilotKit } from '@/registry/components/editor/copilot';
import { copilotValue } from '@/registry/examples/values/copilot-value';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function CopilotDemo() {
  const editor = usePlateEditor({
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
