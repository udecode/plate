'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function InactiveSelectionDemo() {
  const editor = useCreateEditor({
    plugins: [...BasicNodesKit],
    initialValue: [
      {
        children: [
          {
            text: 'Select this sentence, then move focus to either control.',
          },
        ],
        type: 'paragraph',
      },
    ],
  });

  return (
    <div className="flex h-full flex-col gap-4" data-inactive-selection-demo="">
      <EditorRoot editor={editor}>
        <EditorContainer className="min-h-0 flex-1">
          <Editor aria-label="Inactive selection editor" />
        </EditorContainer>

        <div className="flex flex-wrap gap-2">
          <Button data-editor-keep-selection-visible="" type="button">
            Keep selection visible
          </Button>
          <Button type="button" variant="outline">
            Clear selection paint
          </Button>
        </div>
      </EditorRoot>
    </div>
  );
}
