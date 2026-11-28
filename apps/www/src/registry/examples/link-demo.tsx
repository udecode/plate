'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { LinkKit } from '@/registry/components/editor/link';
import { LinkToolbarButton } from '@/registry/components/editor/link-toolbar-button';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { linkValue } from '@/registry/examples/values/link-value';

export default function LinkDemo() {
  const editor = useCreateEditor({
    initialValue: linkValue,
    plugins: [...BasicBlocksKit, ...BasicMarksKit, ...LinkKit],
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[420px]">
        <Toolbar className="border-b p-1" data-slot="fixed-toolbar">
          <LinkToolbarButton />
        </Toolbar>
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
