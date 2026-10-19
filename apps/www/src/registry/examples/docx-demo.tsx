'use client';

import type { Editor as PlateEditor } from 'platejs';
import { createEditor, EditorRoot } from 'platejs/react';
import * as React from 'react';

import { DocxKit } from '@/registry/components/editor/docx';
import { DocxSourceProvider } from '@/registry/components/editor/docx-source';
import {
  Editor,
  EditorContainer,
  EditorFrame,
} from '@/registry/components/editor/editor';
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

const DocxImportKit = [
  ...EditorKit.filter(
    (plugin) =>
      plugin.name !== FixedToolbarPlugin.name &&
      !docxPluginNames.has(plugin.name)
  ),
  ...DocxKit,
] as const;

function DocxEditor() {
  const [editor, setEditor] = React.useState<PlateEditor>(() =>
    createEditor({
      plugins: DocxImportKit,
      initialValue: deserializeDocxValue,
      userId: 'alice',
    })
  );

  return (
    <EditorRoot editor={editor}>
      <EditorFrame className="h-[650px]">
        <FixedToolbar>
          <FixedToolbarButtons>
            <ToolbarGroup>
              <ExportToolbarButton />
              <ImportToolbarButton
                onImport={setEditor}
                plugins={DocxImportKit}
              />
            </ToolbarGroup>
          </FixedToolbarButtons>
        </FixedToolbar>
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </EditorFrame>
    </EditorRoot>
  );
}

export default function DocxDemo() {
  return (
    <DocxSourceProvider>
      <DocxEditor />
    </DocxSourceProvider>
  );
}
