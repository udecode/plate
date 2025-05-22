'use client';

import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate, usePlateEditor } from '@udecode/plate/react';

import { EditorKit } from '@/registry/components/editor/editor-kit-ai';
import { SettingsDialog } from '@/registry/components/editor/settings';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
