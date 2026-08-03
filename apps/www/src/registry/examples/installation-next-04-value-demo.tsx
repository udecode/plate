'use client';

import * as React from 'react';

import type { Value } from 'platejs';

import {
  BlockquotePlugin,
  BoldPlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  ItalicPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { BlockquoteElement } from '@/registry/ui/blockquote-node';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import { FixedToolbar } from '@/registry/ui/fixed-toolbar';
import { H1Element, H2Element, H3Element } from '@/registry/ui/heading-node';
import { MarkToolbarButton } from '@/registry/ui/mark-toolbar-button';
import { ToolbarButton } from '@/registry/ui/toolbar';

const initialValue: Value = [
  {
    children: [{ text: 'Title' }],
    type: 'h3',
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
  const value = React.useMemo(() => {
    const savedValue = localStorage.getItem(
      `nextjs-plate-value-demo-${new Date().toISOString().split('T')[0]}`
    );

    return savedValue ? JSON.parse(savedValue) : initialValue;
  }, []);

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      H1Plugin.configure({ component: H1Element }),
      H2Plugin.configure({ component: H2Element }),
      H3Plugin.configure({ component: H3Element }),
      BlockquotePlugin.configure({ component: BlockquoteElement }),
    ],
    initialValue: value,
  });

  return (
    <Plate
      onValueChange={({ value }) => {
        localStorage.setItem(
          `nextjs-plate-value-demo-${new Date().toISOString().split('T')[0]}`,
          JSON.stringify(value)
        );
      }}
      editor={editor}
    >
      <FixedToolbar className="flex justify-start gap-1 rounded-t-lg">
        <ToolbarButton onClick={() => editor.update.h1.toggle()}>
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.update.h2.toggle()}>
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.update.h3.toggle()}>
          H3
        </ToolbarButton>

        <ToolbarButton onClick={() => editor.update.blockquote.toggle()}>
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

        <div className="flex-1" />

        <ToolbarButton
          className="px-2"
          onClick={() => {
            editor.update.value.replace({ children: initialValue });
          }}
        >
          Reset
        </ToolbarButton>
      </FixedToolbar>

      <EditorContainer>
        <Editor placeholder="Type your amazing content here..." />
      </EditorContainer>
    </Plate>
  );
}
