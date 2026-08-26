'use client';

import { Plate, usePlateEditor } from 'platejs/react';
import * as React from 'react';

import { DocxKit } from '@/registry/components/editor/docx';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { ExportToolbarButton } from '@/registry/components/editor/export-toolbar-button';
import {
  FixedToolbar,
  FixedToolbarButtons,
  FixedToolbarPlugin,
} from '@/registry/components/editor/fixed-toolbar';
import { ImportToolbarButton } from '@/registry/components/editor/import-toolbar-button';
import { EditorKit } from '@/registry/components/editor/plugins';
import { ToolbarGroup } from '@/registry/components/editor/toolbar';
import { deserializeDocxValue } from '@/registry/examples/values/deserialize-docx-value';

const docxPluginNames = new Set<string>(DocxKit.map((plugin) => plugin.name));

const DocxFixedToolbarPlugin = FixedToolbarPlugin.configure({
  render: {
    beforeEditable: () => (
      <FixedToolbar>
        <FixedToolbarButtons>
          <ToolbarGroup>
            <ExportToolbarButton />
            <ImportToolbarButton />
          </ToolbarGroup>
        </FixedToolbarButtons>
      </FixedToolbar>
    ),
  },
});

const DocxEditorKit = [
  ...EditorKit.filter(
    (plugin) =>
      plugin.name !== FixedToolbarPlugin.name &&
      !docxPluginNames.has(plugin.name)
  ),
  ...DocxKit,
  DocxFixedToolbarPlugin,
] as const;

export default function DocxDemo() {
  const editor = usePlateEditor({
    plugins: DocxEditorKit,
    initialValue: deserializeDocxValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}
