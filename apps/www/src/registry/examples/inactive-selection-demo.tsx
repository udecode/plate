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
    <div className="space-y-4" data-inactive-selection-demo="">
      <EditorRoot editor={editor}>
        <EditorContainer variant="demo">
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
