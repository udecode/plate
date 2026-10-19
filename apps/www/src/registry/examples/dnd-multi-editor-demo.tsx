'use client';

import { EditorRoot, useCreateEditor } from 'platejs/react';
import type * as React from 'react';

import { BasicNodesKit } from '@/registry/components/editor/basic-nodes';
import { DndKit } from '@/registry/components/editor/dnd';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  dndDocumentValue,
  dndOtherEditorValue,
} from '@/registry/examples/values/dnd-multi-editor-value';

function Pane({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <div className="rounded-md border">{children}</div>
    </section>
  );
}

export default function DndMultiEditorDemo() {
  const documentEditor = useCreateEditor({
    id: 'dnd-document',
    plugins: [...BasicNodesKit, ...DndKit],
    initialValue: dndDocumentValue,
  });
  const otherEditor = useCreateEditor({
    id: 'dnd-other-editor',
    plugins: [...BasicNodesKit, ...DndKit],
    initialValue: dndOtherEditorValue,
  });

  return (
    <div className="grid gap-4 p-4 md:grid-cols-3">
      <Pane label="Document">
        <EditorRoot editor={documentEditor}>
          <EditorContainer>
            <Editor className="px-12 py-4 text-base" variant="none" />
          </EditorContainer>
        </EditorRoot>
      </Pane>
      <Pane label="Same document, second view">
        <EditorRoot editor={documentEditor}>
          <EditorContainer>
            <Editor className="px-12 py-4 text-base" variant="none" />
          </EditorContainer>
        </EditorRoot>
      </Pane>
      <Pane label="Another editor">
        <EditorRoot editor={otherEditor}>
          <EditorContainer>
            <Editor className="px-12 py-4 text-base" variant="none" />
          </EditorContainer>
        </EditorRoot>
      </Pane>
    </div>
  );
}
