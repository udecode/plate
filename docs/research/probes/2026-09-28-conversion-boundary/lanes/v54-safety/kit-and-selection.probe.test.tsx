import { expect, test } from 'bun:test';

import { EditorKit } from '../../../../../../apps/www/src/registry/components/editor/plugins';
import contract from '../../../../../../apps/www/src/registry/components/editor/plugins.schema.json';
import { BaseCodeBlockPlugin } from '../../../../../../packages/platejs/src/features/code-block';
import { BaseLinkPlugin } from '../../../../../../packages/platejs/src/features/link';
import { BaseImagePlugin } from '../../../../../../packages/platejs/src/features/media';
import {
  defineDocumentMigrations,
  migrateDocument,
  migrateV54,
} from '../../../../../../packages/platejs/src/migrations/index';

// Lane v54-safety evidence. Product proof lives in
// packages/platejs/src/migrations/migratePlateV54Urls.spec.ts.

const v53 = {
  fingerprint: 'plate-v53',
  id: 'plate',
  kind: 'named',
  version: 53,
} as const;

test('the first-party kit migrates a v53 document to the current v54 identity', () => {
  const kit = EditorKit.filter(
    (plugin) =>
      plugin.name !== 'fixedToolbar' && plugin.name !== 'floatingToolbar'
  );
  const migrations = defineDocumentMigrations({
    plugins: kit,
    schema: { id: 'document-migration-demo', version: 54 },
    sourceFingerprints: { 53: 'plate-v53' },
    steps: { 54: migrateV54 },
  });
  const image = (url: string) => ({
    caption: [{ children: [{ text: 'Legacy media caption' }], type: 'p' }],
    children: [{ text: '' }],
    type: 'img',
    url,
  });
  const safe = migrateDocument(
    { children: [image('https://example.com/a.png')] },
    { migrations, source: 53 }
  );
  const unsafe = migrateDocument(
    { children: [image('javascript:alert(1)')] },
    { migrations, source: 53 }
  ).output;

  expect(safe.applied).toEqual([54]);
  // The committed generated contract carries the same semantic fingerprint.
  expect(safe.output.schema).toEqual({
    fingerprint: contract.fingerprint,
    id: 'document-migration-demo',
    kind: 'named',
    version: 54,
  });
  expect(migrateDocument(safe.output, { migrations }).output).toEqual(
    safe.output
  );
  expect(unsafe.document.children).toEqual([
    { children: [{ text: 'Legacy media caption' }], type: 'paragraph' },
  ]);
});

const migrations = defineDocumentMigrations({
  plugins: [BaseCodeBlockPlugin, BaseImagePlugin, BaseLinkPlugin],
  schema: { id: 'plate', version: 54 },
  sourceFingerprints: { 53: 'plate-v53' },
  steps: { 54: migrateV54 },
});
const select = (
  children: readonly unknown[],
  anchor: Readonly<{ offset: number; path: number[] }>,
  focus = anchor
) =>
  migrateDocument(
    {
      document: { children },
      schema: v53,
      selection: { anchor, focus, kind: 'text' },
    } as never,
    { migrations }
  ).output.selection;

test('selections around neutralized values map to the kept text', () => {
  const link = {
    children: [
      { text: 'one' },
      { children: [{ text: 'mid' }], type: 'a', url: 'https://example.com' },
      { text: 'two' },
    ],
    type: 'a',
    url: 'javascript:alert(1)',
  };
  const paragraph = {
    children: [{ text: 'A ' }, link, { text: ' tail' }],
    type: 'p',
  };

  expect(select([paragraph], { offset: 1, path: [0, 1, 1, 0] })).toMatchObject(
    { anchor: { offset: 1, path: [0, 1, 0] } }
  );
  expect(select([paragraph], { offset: 3, path: [0, 2] })).toMatchObject({
    anchor: { offset: 6, path: [0, 2] },
  });
  expect(
    select(
      [
        { alt: 'Alt text', children: [{ text: '' }], type: 'img', url: 'javascript:x' },
        { children: [{ text: '' }], type: 'img', url: 'javascript:x' },
        { children: [{ text: 'after' }], type: 'p' },
      ],
      { offset: 3, path: [2, 0] }
    )
  ).toMatchObject({ anchor: { offset: 3, path: [1, 0] } });
});

test('gap repro: a caret before a migrated legacy caption collapses', () => {
  // Reproduces with a safe URL, so it precedes URL neutralization: the v53
  // `caption` carrier migration diff loses offsets in earlier blocks.
  expect(
    select(
      [
        { children: [{ text: 'before' }], type: 'p' },
        {
          caption: [{ children: [{ text: 'cap' }], type: 'p' }],
          children: [{ text: '' }],
          type: 'img',
          url: 'https://example.com/a.png',
        },
      ],
      { offset: 2, path: [0, 0] }
    )
  ).toMatchObject({ anchor: { offset: 0, path: [0, 0] } });
});
