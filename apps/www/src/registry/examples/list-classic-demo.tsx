'use client';

import * as React from 'react';

import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin as BlockListPlugin } from '@platejs/list/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/plugins';
import { AutoformatKit } from '@/registry/components/editor/autoformat-classic';
import { FixedToolbarKit } from '@/registry/components/editor/fixed-toolbar-classic';
import { FixedToolbarPlugin } from '@/registry/components/editor/fixed-toolbar';
import { FloatingToolbarKit } from '@/registry/components/editor/floating-toolbar-classic';
import { FloatingToolbarPlugin } from '@/registry/components/editor/floating-toolbar';
import { ListKit } from '@/registry/components/editor/list-classic';
import { listValue } from '@/registry/examples/values/list-classic-value';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';

export default function ListClassicDemo() {
  const editor = usePlateEditor({
    initialValue: listValue,
    plugins: [
      ...EditorKit.filter(
        (plugin) =>
          plugin.name !== FixedToolbarPlugin.name &&
          plugin.name !== FloatingToolbarPlugin.name
      ),
      IndentPlugin.configure({ enabled: false }),
      BlockListPlugin.configure({ enabled: false }),
      ...ListKit,
      ...FixedToolbarKit,
      ...FloatingToolbarKit,
      ...AutoformatKit,
    ],
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
