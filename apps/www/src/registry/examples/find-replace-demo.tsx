'use client';

import * as React from 'react';

import { FindReplacePlugin } from '@platejs/find-replace';
import {
  Plate,
  useEditor,
  useEditorPlugin,
  usePlateEditor,
  usePluginStore,
} from 'platejs/react';

import { Input } from '@/components/ui/input';
import { EditorKit } from '@/registry/components/editor/plugins';
import { findReplaceValue } from '@/registry/examples/values/find-replace-value';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { FixedToolbar } from '@/registry/components/editor/fixed-toolbar';

export function FindToolbar() {
  const editor = useEditor();
  const { store } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginStore(FindReplacePlugin, 'search');

  return (
    <FixedToolbar className="border-none py-3">
      <Input
        data-testid="ToolbarSearchHighlightInput"
        className="mx-2"
        value={search}
        onChange={(e) => {
          store.set({ search: e.target.value });
          editor.api.react.refreshDecorations();
        }}
        placeholder="Search the text..."
        type="search"
      />
    </FixedToolbar>
  );
}

export default function FindReplaceDemo() {
  const editor = usePlateEditor(
    {
      plugins: [
        ...EditorKit,
        FindReplacePlugin.configure({
          initialState: { search: 'text' },
          render: { as: 'span' },
        }),
      ],
      initialValue: findReplaceValue,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <FindToolbar />

      <EditorContainer
        variant="demo"
        className="border-t [&_.plite-searchHighlight]:bg-yellow-100"
      >
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
