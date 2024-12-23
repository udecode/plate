'use client';

import React from 'react';

import { withProps } from '@udecode/cn';
import { Plate, PlateElement } from '@udecode/plate-common/react';
import {
  BulletedListPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TodoListPlugin,
} from '@udecode/plate-list/react';

import { autoformatListPlugin } from '@/registry/default/components/editor/plugins/autoformat-list-plugin';
import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { FixedToolbarListPlugin } from '@/registry/default/components/editor/plugins/fixed-toolbar-list-plugin';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { listValue } from '@/registry/default/example/values/list-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { ListElement } from '@/registry/default/plate-ui/list-element';
import { TodoListElement } from '@/registry/default/plate-ui/todo-list-element';

export default function ListDemo() {
  const editor = useCreateEditor({
    components: {
      [BulletedListPlugin.key]: withProps(ListElement, { variant: 'ul' }),
      [ListItemPlugin.key]: withProps(PlateElement, { as: 'li' }),
      [NumberedListPlugin.key]: withProps(ListElement, { variant: 'ol' }),
      [TodoListPlugin.key]: TodoListElement,
    },
    plugins: [
      ...editorPlugins,
      ListPlugin,
      TodoListPlugin,
      FixedToolbarListPlugin,
      autoformatListPlugin,
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
