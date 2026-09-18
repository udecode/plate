'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { CopilotKit } from '@/registry/components/editor/copilot';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { copilotValue } from '@/registry/examples/values/copilot-value';

export default function CopilotDemo() {
  const editor = useCreateEditor({
    plugins: [...EditorKit, ...CopilotKit],
    userId: 'alice',
    initialValue: copilotValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
