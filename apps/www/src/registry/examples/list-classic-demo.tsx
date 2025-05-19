'use client';

import * as React from 'react';

import {
  BulletedListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list-classic/react';
import { Plate } from '@udecode/plate/react';

import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-classic-plugin';
import { editorPlugins } from '@/registry/components/editor/plugins/editor-plugins';
import { FixedToolbarPlugin } from '@/registry/components/editor/plugins/fixed-toolbar-classic-plugin';
import { useCreateEditor } from '@/registry/components/editor/use-create-editor';
import { listValue } from '@/registry/examples/values/list-classic-value';
import { Editor, EditorContainer } from '@/registry/ui/editor';
import {
  BulletedListElement,
  ListItemElement,
  NumberedListElement,
  TodoListElement,
} from '@/registry/ui/list-classic-node';

export default function ListClassicDemo() {
  const editor = useCreateEditor({
    components: {
      [BulletedListPlugin.key]: BulletedListElement,
      [ListItemPlugin.key]: ListItemElement,
      [NumberedListPlugin.key]: NumberedListElement,
      [TodoListPlugin.key]: TodoListElement,
    },
    plugins: [
      ...editorPlugins,
      ListPlugin,
      TodoListPlugin,
      FixedToolbarPlugin,
      AutoformatKit,
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
