'use client';

import React from 'react';

import { FindReplacePlugin } from '@udecode/plate-find-replace';
import { Plate, useEditorPlugin, usePluginOption } from '@udecode/plate/react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { findReplaceValue } from '@/registry/default/examples/values/find-replace-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { FixedToolbar } from '@/registry/default/plate-ui/fixed-toolbar';
import { Input } from '@/registry/default/plate-ui/input';
import { SearchHighlightLeaf } from '@/registry/default/plate-ui/search-highlight-leaf';

export function FindToolbar() {
  const { editor, setOption } = useEditorPlugin(FindReplacePlugin);
  const search = usePluginOption(FindReplacePlugin, 'search');

  return (
    <FixedToolbar className="border-none py-3">
      <Input
        data-testid="ToolbarSearchHighlightInput"
        className="mx-2"
        value={search}
        onChange={(e) => {
          setOption('search', e.target.value);
          editor.api.redecorate();
        }}
        placeholder="Search the text..."
        type="search"
      />
    </FixedToolbar>
  );
}

export default function FindReplaceDemo() {
  const editor = useCreateEditor(
    {
      components: {
        [FindReplacePlugin.key]: SearchHighlightLeaf,
      },
      plugins: [
        ...editorPlugins,
        FindReplacePlugin.configure({ options: { search: 'text' } }),
      ],
      value: findReplaceValue,
    },
    []
  );

  return (
    <Plate editor={editor}>
      <FindToolbar />

      <EditorContainer variant="demo" className="border-t">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
