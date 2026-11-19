'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { DirectionProvider } from '@/components/ui/direction';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { rtlValue } from '@/registry/examples/values/rtl-value';

export default function RtlDemo() {
  const editor = useCreateEditor({
    plugins: EditorKit,
    initialValue: rtlValue,
  });

  return (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <EditorRoot editor={editor}>
          <EditorFrame className="h-[650px]">
            <EditorContainer>
              <Editor />
            </EditorContainer>
          </EditorFrame>
        </EditorRoot>
      </div>
    </DirectionProvider>
  );
}
