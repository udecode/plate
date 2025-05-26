'use client';

import * as React from 'react';

import {
  BulletedListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list-classic/react';
import { Plate, usePlateEditor } from '@udecode/plate/react';

import { EditorKit } from '@/registry/components/editor/editor-kit';
import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-classic-kit';
import { FixedToolbarKit } from '@/registry/components/editor/plugins/fixed-toolbar-classic-kit';
import { listValue } from '@/registry/examples/values/list-classic-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import {
  BulletedListElement,
  NumberedListElement,
  TodoListElement,
} from '@/registry/ui/list-classic-node';

export default function ListClassicDemo() {
  const editor = usePlateEditor({
    plugins: [
      ...EditorKit,
      ListPlugin,
      BulletedListPlugin.withComponent(BulletedListElement),
      NumberedListPlugin.withComponent(NumberedListElement),
      ListItemPlugin,
      TodoListPlugin.withComponent(TodoListElement),
      ...FixedToolbarKit,
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
