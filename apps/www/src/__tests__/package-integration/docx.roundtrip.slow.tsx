/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import { jsx } from '@platejs/test';
import JSZip from 'jszip';
import {
  type EditorDocumentValue,
  type Node as PliteNode,
  type PluginReference,
  type Value,
  createEditor,
} from 'platejs';
import { exportDocx } from 'platejs/docx/export';
import { importDocx } from 'platejs/docx/import';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

jsx;

const docxImportPlugins: readonly PluginReference[] = BaseEditorKit;

const createTestEditor = (value?: Value) =>
  createEditor({
    plugins: BaseEditorKit,
    initialValue: value,
  });

const readDocxFixture = (filename: string): Buffer => {
  const docxTestDir = path.resolve(import.meta.dirname, './docx');

  return fs.readFileSync(path.join(docxTestDir, `${filename}.docx`));
};

const importDocxBuffer = async (
  buffer: Buffer
): Promise<EditorDocumentValue> => {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);

  const result = await importDocx(arrayBuffer, { plugins: docxImportPlugins });

  if (!result.ok) throw new Error(result.diagnostics[0]?.message);

  return result.document;
};

const exportDocumentToDocx = async (
  document: EditorDocumentValue
): Promise<Buffer> => {
  const editor = createTestEditor();
  editor.update.value.replace(document);
  const result = await exportDocx(editor, {
    projection: 'proposed',
  });

  if (!result.ok) throw new Error(result.diagnostics[0]?.message);

  return Buffer.from(await result.blob.arrayBuffer());
};

describe('docx roundtrip', () => {
  it('pairs TOC links with export-local heading bookmarks without persisted ids', async () => {
    const result = await exportDocx(
      createTestEditor([
        { children: [{ text: '' }], type: 'toc' },
        { children: [{ text: 'Introduction' }], level: 1, type: 'heading' },
      ]),
      { projection: 'proposed' }
    );

    if (!result.ok) throw new Error(result.diagnostics[0]?.message);
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const xml = new DOMParser().parseFromString(
      await zip.file('word/document.xml')!.async('string'),
      'application/xml'
    );
    const anchors = [...xml.getElementsByTagName('w:hyperlink')].map((node) =>
      node.getAttribute('w:anchor')
    );
    const bookmarks = [...xml.getElementsByTagName('w:bookmarkStart')].map(
      (node) => node.getAttribute('w:name')
    );

    expect(anchors).toHaveLength(1);
    expect(bookmarks).toContain(anchors[0]);
  });

  it.each(['headers', 'block_quotes', 'tables'])(
    'preserves data for %s',
    async (name) => {
      const importedDocument = await importDocxBuffer(readDocxFixture(name));
      const roundtrippedDocument = await importDocxBuffer(
        await exportDocumentToDocx(importedDocument)
      );

      expect(roundtrippedDocument.children).toEqual(importedDocument.children);
    }
  );

  it('preserves data for links with URL normalization', async () => {
    const importedDocument = await importDocxBuffer(readDocxFixture('links'));
    const roundtrippedDocument = await importDocxBuffer(
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
    const importedDocument = await importDocxBuffer(
      readDocxFixture('inline_formatting')
    );
    const roundtrippedDocument = await importDocxBuffer(
      await exportDocumentToDocx(importedDocument)
    );

    expect(roundtrippedDocument.children.length).toBeGreaterThan(0);
  });
});
