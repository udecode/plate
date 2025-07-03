'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-classic-kit';
import { FixedToolbarKit } from '@/registry/components/editor/plugins/fixed-toolbar-classic-kit';
import { FloatingToolbarKit } from '@/registry/components/editor/plugins/floating-toolbar-classic-kit';
import { ListKit } from '@/registry/components/editor/plugins/list-classic-kit';
import { listValue } from '@/registry/examples/values/list-classic-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';

export default function ListClassicDemo() {
  const editor = usePlateEditor({
    // Disable EditorKit's indent and list plugins
    override: {
      enabled: {
        indent: false,
        list: false,
      },
    },
    plugins: [
      ...EditorKit,
      ...ListKit,
      ...FixedToolbarKit,
      ...FloatingToolbarKit,
      ...AutoformatKit,
    ],
    value: listValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
