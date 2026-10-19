'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { ColumnKit } from '@/registry/components/editor/column';
import { DndKit } from '@/registry/components/editor/dnd';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
import { TableKit } from '@/registry/components/editor/table';
import { dndTableValue } from '@/registry/examples/values/dnd-table-value';

export default function DndTableDemo() {
  const editor = useCreateEditor({
    plugins: [...BasicNodesKit, ...TableKit, ...ColumnKit, ...DndKit],
    initialValue: dndTableValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}
