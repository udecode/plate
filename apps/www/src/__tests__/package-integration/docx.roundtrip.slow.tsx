/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import { jsx } from '@platejs/test';
import {
  type EditorDocumentValue,
  type Node as PliteNode,
  type Value,
  createEditor,
} from 'platejs';
import { exportToDocx } from 'platejs/docx/export';
import { importDocx } from 'platejs/docx/import';
import { renderStaticHtml } from 'platejs/static';

import { DocxExportKit } from '@/registry/components/editor/docx-export';
import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

jsx;

const createTestEditor = (value?: Value) =>
  createEditor({
    plugins: [...BaseEditorKit, ...DocxExportKit],
    initialValue: value,
  });

const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(import.meta.dirname, './docx');

  return fs.readFileSync(path.join(docxTestDir, `${filename}.docx`));
};

const importDocxBuffer = async (
  editor: ReturnType<typeof createTestEditor>,
  buffer: Buffer
): Promise<EditorDocumentValue> => {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);

  const result = await importDocx(editor, arrayBuffer);

  if (!result.ok) throw new Error(result.diagnostics[0]?.message);

  return result.document;
};

const exportDocumentToDocx = async (
  document: EditorDocumentValue
): Promise<Buffer> => {
  const editor = createTestEditor();
  editor.update.value.replace(document);
  const result = await exportToDocx(editor, {
    editorPlugins: [...BaseEditorKit, ...DocxExportKit],
    projection: 'proposed',
  });

  if (!result.ok) throw new Error(result.diagnostics[0]?.message);

  return Buffer.from(await result.blob.arrayBuffer());
};

describe('docx roundtrip', () => {
  it('pairs TOC links with export-local heading bookmarks without persisted ids', async () => {
    const html = await renderStaticHtml(
      createTestEditor([
        { children: [{ text: '' }], type: 'toc' },
        { children: [{ text: 'Introduction' }], level: 1, type: 'heading' },
      ])
    );
    const document = new DOMParser().parseFromString(html, 'text/html');
    const href = document.querySelector('a')?.getAttribute('href');

    expect(href?.startsWith('#')).toBe(true);
    expect(document.getElementById(href!.slice(1))).not.toBeNull();
  });

  it.each(['headers', 'block_quotes', 'tables'])(
    'preserves data for %s',
    async (name) => {
      const editor = createTestEditor();
      const importedDocument = await importDocxBuffer(
        editor,
        readDocxFixture(name)
      );
      const roundtrippedDocument = await importDocxBuffer(
        editor,
        await exportDocumentToDocx(importedDocument)
      );

      expect(roundtrippedDocument.children).toEqual(importedDocument.children);
    }
  );

  it('preserves data for links with URL normalization', async () => {
    const editor = createTestEditor();
    const importedDocument = await importDocxBuffer(
      editor,
      readDocxFixture('links')
    );
    const roundtrippedDocument = await importDocxBuffer(
      editor,
      await exportDocumentToDocx(importedDocument)
    );

    const normalizeUrls = (nodes: readonly PliteNode[]) =>
      JSON.parse(
        JSON.stringify(nodes).replaceAll(
          /"url":"(https?:\/\/[^"/]+)"/g,
          '"url":"$1/"'
        )
      );

    expect(normalizeUrls(roundtrippedDocument.children)).toEqual(
      normalizeUrls(importedDocument.children)
    );
  });

  it('reimports inline formatting after export without dropping all content', async () => {
    const editor = createTestEditor();
    const importedDocument = await importDocxBuffer(
      editor,
      readDocxFixture('inline_formatting')
    );
    const roundtrippedDocument = await importDocxBuffer(
      editor,
      await exportDocumentToDocx(importedDocument)
    );

    expect(roundtrippedDocument.children.length).toBeGreaterThan(0);
  });
});
