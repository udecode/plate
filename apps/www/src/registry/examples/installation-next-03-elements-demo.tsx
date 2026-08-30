'use client';

import type { Value } from 'platejs';
import {
  BlockquotePlugin,
  BoldPlugin,
  HeadingPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  Plate,
  useCreateEditor,
} from 'platejs/react';
import * as React from 'react';

import { BlockquoteElement } from '@/registry/components/editor/blockquote';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FixedToolbar } from '@/registry/components/editor/fixed-toolbar';
import { HeadingElement } from '@/registry/components/editor/heading';
import { MarkToolbarButton } from '@/registry/components/editor/mark-toolbar-button';
import { ToolbarButton } from '@/registry/components/editor/toolbar';

const initialValue: Value = [
  {
    children: [{ text: 'Title' }],
    level: 3,
    type: 'heading',
  },
  {
    children: [
      {
        children: [{ text: 'This is a quote.' }],
        type: 'paragraph',
      },
    ],
    type: 'blockquote',
  },
  {
    children: [
      { text: 'With some ' },
      { bold: true, text: 'bold' },
      { text: ' text for emphasis!' },
    ],
    type: 'paragraph',
  },
];

export default function MyEditorPage() {
  const editor = useCreateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      HeadingPlugin.configure({ component: HeadingElement }),
      BlockquotePlugin.configure({ component: BlockquoteElement }),
    ],
    initialValue,
  });

  return (
    <Plate editor={editor}>
      <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
        <ToolbarButton
          onClick={() => {
            editor.plugin(HeadingPlugin).update.toggle({ level: 1 });
          }}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            editor.plugin(HeadingPlugin).update.toggle({ level: 2 });
          }}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            editor.plugin(HeadingPlugin).update.toggle({ level: 3 });
          }}
        >
          H3
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            editor.plugin(BlockquotePlugin).update.toggle();
          }}
        >
          Quote
        </ToolbarButton>

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
