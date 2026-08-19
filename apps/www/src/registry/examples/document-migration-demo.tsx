'use client';

import { Plate, usePlateEditor } from 'platejs/react';
import {
  defineDocumentMigrations,
  migratePlateV54,
  migratePlateV55,
} from 'platejs/migrations';

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
  version: 55,
} as const;

const MigrationDemoMigrations = defineDocumentMigrations(MigrationDemoSchema, {
  sourceFingerprints: { 54: 'fnv1a64:145ae3a4240757a3' },
  steps: { 54: migratePlateV54, 55: migratePlateV55 },
  unversioned: 53,
});

export default function DocumentMigrationDemo() {
  const editor = usePlateEditor({
    initialValue: v53Document,
    migrations: MigrationDemoMigrations,
    plugins: MigrationDemoKit,
    schema: MigrationDemoSchema,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor placeholder="Type something..." />
      </EditorContainer>
    </Plate>
  );
}
