'use client';

import type { Value } from 'platejs';
import { EditorRoot, useCreateEditor } from 'platejs/react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import {
  IndentToolbarButton,
  OutdentToolbarButton,
} from '@/registry/components/editor/indent-toolbar-button';
import { ListKit } from '@/registry/components/editor/list';
import {
  BulletedListToolbarButton,
  NumberedListToolbarButton,
  TodoListToolbarButton,
} from '@/registry/components/editor/list-toolbar-button';
import { Toolbar, ToolbarGroup } from '@/registry/components/editor/toolbar';
import { TurnIntoToolbarButton } from '@/registry/components/editor/turn-into-toolbar-button';

const initialValue: Value = [
  {
    type: 'heading',
    level: 2,
    children: [{ text: 'Lists' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Try Tab and Shift+Tab on nested items, toggle tasks with Mod+Enter, or restart numbering from the numbered menu.',
      },
    ],
  },
  {
    type: 'paragraph',
    checked: true,
    indent: 1,
    listId: 'tasks',
    listType: 'task',
    children: [{ text: 'Unify indent and list family moves' }],
  },
  {
    type: 'paragraph',
    checked: false,
    indent: 1,
    listId: 'tasks',
    listType: 'task',
    children: [{ text: 'Press Enter at the end of a checked task' }],
  },
  {
    type: 'paragraph',
    indent: 1,
    listId: 'bullets',
    listType: 'bulleted',
    children: [{ text: 'Bulleted item' }],
  },
  {
    type: 'paragraph',
    indent: 2,
    listId: 'bullets',
    listStyle: 'circle',
    listType: 'bulleted',
    children: [{ text: 'Nested circle bullet' }],
  },
  {
    type: 'paragraph',
    indent: 1,
    listId: 'steps',
    listStyle: 'upper-roman',
    listType: 'numbered',
    children: [{ text: 'First Roman step' }],
  },
  {
    type: 'paragraph',
    indent: 2,
    listId: 'steps',
    listType: 'numbered',
    children: [{ text: 'Nested step one' }],
  },
  {
    type: 'paragraph',
    indent: 2,
    listId: 'steps',
    listType: 'numbered',
    children: [{ text: 'Nested step two' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'A plain note between steps does not end the list.' }],
  },
  {
    type: 'paragraph',
    indent: 1,
    listId: 'steps',
    listStyle: 'upper-roman',
    listType: 'numbered',
    children: [{ text: 'Second Roman step continues past the note' }],
  },
];

export default function ListFocusedDemo() {
  const editor = useCreateEditor({
    plugins: [...BasicBlocksKit, ...ListKit],
    initialValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer className="h-[440px]">
        <Toolbar className="gap-1 border-b px-3 py-1">
          <ToolbarGroup>
            <TurnIntoToolbarButton />
          </ToolbarGroup>
          <ToolbarGroup>
            <BulletedListToolbarButton />
            <NumberedListToolbarButton />
            <TodoListToolbarButton />
          </ToolbarGroup>
          <ToolbarGroup>
            <OutdentToolbarButton />
            <IndentToolbarButton />
          </ToolbarGroup>
        </Toolbar>
        <Editor
          aria-label="List document"
          className="h-auto min-h-[320px] px-8 py-4"
          variant="demo"
        />
      </EditorContainer>
    </EditorRoot>
  );
}
