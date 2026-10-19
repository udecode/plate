'use client';

import { readEditorSelection, type PersistedDocumentInput } from 'platejs';
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from 'platejs/migrations';
import { EditorRoot, useCreateEditor } from 'platejs/react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';

const v53Document = {
  children: [
    {
      align: 'center',
      children: [
        { bold: true, text: 'Migrated automatically' },
        { subscript: true, text: ' v53' },
      ],
      type: 'p',
    },
    {
      children: [{ text: 'One semantic heading' }],
      type: 'h2',
    },
    {
      children: [
        {
          children: [{ text: 'const migrated = true;' }],
          type: 'code_line',
        },
      ],
      lang: 'typescript',
      type: 'code_block',
    },
    {
      children: [{ text: 'Number four' }],
      indent: 1,
      listStart: 4,
      listStyleType: 'decimal',
      type: 'p',
    },
    {
      children: [{ text: 'Number five' }],
      indent: 1,
      listStart: 5,
      listStyleType: 'decimal',
      type: 'p',
    },
    {
      caption: [{ children: [{ text: 'Legacy media caption' }], type: 'p' }],
      children: [{ text: '' }],
      placeholderId: 'legacy-upload',
      initialHeight: 320,
      initialWidth: 480,
      isUpload: true,
      type: 'img',
      url: 'https://images.unsplash.com/photo-1712688930249-98e1963af7bd?q=80&w=600&auto=format&fit=crop',
    },
    {
      children: [
        {
          children: [
            {
              background: '#fef3c7',
              borders: { bottom: { size: 2, style: 'solid' } },
              children: [{ children: [{ text: 'Header' }], type: 'p' }],
              size: 180,
              type: 'th',
            },
            {
              children: [{ children: [{ text: 'Value' }], type: 'p' }],
              size: 220,
              type: 'td',
            },
          ],
          size: 48,
          type: 'tr',
        },
      ],
      type: 'table',
    },
    {
      children: [{ text: 'Direct file video' }],
      isUpload: true,
      type: 'video',
      url: 'https://videos.pexels.com/video-files/6769791/6769791-uhd_2560_1440_24fps.mp4',
    },
  ],
} as const;

const MigrationDemoKit = EditorKit.filter(
  (plugin) =>
    plugin.name !== 'fixedToolbar' && plugin.name !== 'floatingToolbar'
);

const MigrationDemoSchema = {
  id: 'document-migration-demo',
  version: 54,
} as const;

const MigrationDemoMigrations = defineDocumentMigrations({
  plugins: MigrationDemoKit,
  schema: MigrationDemoSchema,
  sourceFingerprints: { 53: 'plate-v53' },
  steps: { 54: migrateV54 },
});
const migratedDocument = migrateDocument(v53Document, {
  migrations: MigrationDemoMigrations,
  source: 53,
}).output;

export default function DocumentMigrationDemo() {
  const [loaded, setLoaded] =
    React.useState<PersistedDocumentInput>(migratedDocument);
  const [savedJson, setSavedJson] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState(
    'The v53 source is converted before the editor is created.'
  );
  const editor = useCreateEditor(
    {
      initialValue: loaded,
      plugins: MigrationDemoKit,
      schema: MigrationDemoSchema,
      userId: 'migration-demo',
    },
    [loaded]
  );

  return (
    <div className="flex w-full flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            setSavedJson(
              JSON.stringify({
                document: editor.read.value(),
                schema: editor.read.schema.identity(),
                selection: readEditorSelection(editor),
              })
            );
            setStatus('Saved the complete current document as JSON.');
          }}
          size="sm"
          variant="outline"
        >
          Save JSON
        </Button>
        <Button
          disabled={!savedJson}
          onClick={() => {
            if (!savedJson) return;

            const result = migrateDocument(JSON.parse(savedJson), {
              migrations: MigrationDemoMigrations,
            });
            setLoaded(result.output);
            setStatus(
              `Reopened current JSON with ${result.applied.length} historical steps.`
            );
          }}
          size="sm"
          variant="outline"
        >
          Reopen saved JSON
        </Button>
      </div>
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {status}
      </p>
      {savedJson && (
        <details className="rounded-md border p-3 text-sm">
          <summary className="cursor-pointer font-medium">Saved JSON</summary>
          <pre
            className="mt-3 max-h-40 overflow-auto text-xs whitespace-pre-wrap"
            data-testid="saved-document-json"
          >
            {savedJson}
          </pre>
        </details>
      )}
      <EditorRoot editor={editor} key={editor.id}>
        <EditorContainer>
          <Editor
            aria-label="Migrated document"
            placeholder="Type something..."
          />
        </EditorContainer>
      </EditorRoot>
    </div>
  );
}
