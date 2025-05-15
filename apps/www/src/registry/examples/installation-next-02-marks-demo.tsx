'use client';

import * as React from 'react';

import type { Value } from '@udecode/plate';

import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import {
  type PlateLeafProps,
  Plate,
  PlateLeaf,
  usePlateEditor,
} from '@udecode/plate/react';

import { Editor, EditorContainer } from '@/registry/ui/editor';
import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import { MarkToolbarButton } from '@/registry/ui/mark-toolbar-button';
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
    type: 'p',
  },
];

export default function MyEditorPage() {
  const editor = usePlateEditor({
    components: {
      bold: function Bold(props: PlateLeafProps) {
        return <PlateLeaf {...props} as="strong" />;
      },
      italic: function Italic(props: PlateLeafProps) {
        return <PlateLeaf {...props} as="em" />;
      },
      underline: function Underline(props: PlateLeafProps) {
        return <PlateLeaf {...props} as="u" />;
      },
    },
    plugins: [BasicMarksPlugin],
    value: initialValue,
  });

  return (
    <Plate editor={editor}>
      <FixedToolbar className="justify-start rounded-t-lg">
        <MarkToolbarButton nodeType="bold" tooltip="Bold (⌘+B)">
          B
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="italic" tooltip="Italic (⌘+I)">
          I
        </MarkToolbarButton>
        <MarkToolbarButton nodeType="underline" tooltip="Underline (⌘+U)">
          U
        </MarkToolbarButton>
      </FixedToolbar>

      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
