'use client';

import * as React from 'react';

import { IndentPlugin } from '@platejs/indent/react';
import { ListPlugin as BlockListPlugin } from '@platejs/list/react';
import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-classic-kit';
import { FixedToolbarKit } from '@/registry/components/editor/plugins/fixed-toolbar-classic-kit';
import { FixedToolbarPlugin } from '@/registry/components/editor/plugins/fixed-toolbar-kit';
import { FloatingToolbarKit } from '@/registry/components/editor/plugins/floating-toolbar-classic-kit';
import { FloatingToolbarPlugin } from '@/registry/components/editor/plugins/floating-toolbar-kit';
import { ListKit } from '@/registry/components/editor/plugins/list-classic-kit';
import { listValue } from '@/registry/examples/values/list-classic-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function ListClassicDemo() {
  const editor = usePlateEditor({
    plugins: [
      ...EditorKit.filter(
        (plugin) =>
          plugin.key !== FixedToolbarPlugin.key &&
          plugin.key !== FloatingToolbarPlugin.key
      ),
      IndentPlugin.configure({ enabled: false }),
      BlockListPlugin.configure({ enabled: false }),
      ...ListKit,
      ...FixedToolbarKit,
      ...FloatingToolbarKit,
      ...AutoformatKit,
    ],
    initialValue: listValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
