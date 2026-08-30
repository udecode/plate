'use client';

import type { Value } from 'platejs';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  Plate,
  useCreateEditor,
} from 'platejs/react';
import * as React from 'react';

import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FixedToolbar } from '@/registry/components/editor/fixed-toolbar';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';
// import { Bold, Italic, Underline } from 'lucide-react'; // Example icons

const initialValue: Value = [
  {
    children: [
      { text: 'Hello! Try out the ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', and ' },
      { text: 'underline', underline: true },
      { text: ' formatting.' },
    ],
    type: 'paragraph',
  },
];

export default function MyEditorPage() {
  const editor = useCreateEditor({
    plugins: [BoldPlugin, ItalicPlugin, UnderlinePlugin],
    initialValue,
  });

  return (
    <Plate editor={editor}>
      <FixedToolbar className="justify-start rounded-t-lg">
        <MarkToolbarButton plugin={BoldPlugin} tooltip="Bold (⌘+B)">
          B
        </MarkToolbarButton>
        <MarkToolbarButton plugin={ItalicPlugin} tooltip="Italic (⌘+I)">
          I
        </MarkToolbarButton>
        <MarkToolbarButton plugin={UnderlinePlugin} tooltip="Underline (⌘+U)">
          U
        </MarkToolbarButton>
      </FixedToolbar>

      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
