'use client';

import React, { useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate-common/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/use-chat';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';

export function PlateEditor() {
  const containerRef = useRef(null);

  const editor = useCreateEditor();

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>

        <EditorContainer
          id="scroll_container"
          ref={containerRef}
          variant="demo"
        >
          <Editor variant="demo" />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <CommentsPopover />

          <CursorOverlay containerRef={containerRef} />
        </EditorContainer>

        <SettingsDialog />
      </Plate>
    </DndProvider>
  );
}
