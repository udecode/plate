'use client';

import { BaseImagePlugin } from 'platejs/media';
import { EditorContent, EditorRoot, useCreateEditor } from 'platejs/react';

import { DndKit } from '@/registry/components/editor/dnd';
import { MediaKit } from '@/registry/components/editor/media';
import { MediaToolbarButton } from '@/registry/components/editor/media-toolbar-button';
import { Toolbar } from '@/registry/components/editor/toolbar';
import { UploadKit } from '@/registry/components/editor/upload';

export default function FilesSdkProofPage() {
  const editor = useCreateEditor({
    plugins: [...MediaKit, ...UploadKit, ...DndKit],
    initialValue: [{ children: [{ text: 'target' }], type: 'paragraph' }],
  });

  return (
    <EditorRoot editor={editor}>
      <Toolbar data-testid="files-sdk-picker">
        <MediaToolbarButton plugin={BaseImagePlugin} />
      </Toolbar>
      <EditorContent aria-label="Files SDK proof" />
    </EditorRoot>
  );
}
