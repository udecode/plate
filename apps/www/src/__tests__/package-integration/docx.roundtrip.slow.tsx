/** @jsx jsx */

import fs from 'node:fs';
import path from 'node:path';

import { jsx } from '@platejs/test';
import { type Node as PliteNode, createEditor, type Value } from 'platejs';
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
): Promise<PliteNode[]> => {
  const arrayBuffer = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(arrayBuffer).set(buffer);

  const result = await importDocx(editor, arrayBuffer);

  return result.nodes;
};

const exportNodesToDocx = async (nodes: PliteNode[]): Promise<Buffer> => {
  const blob = await exportToDocx(nodes as Value, {
    editorPlugins: [...BaseEditorKit, ...DocxExportKit],
  });

  return Buffer.from(await blob.arrayBuffer());
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
      const importedNodes = await importDocxBuffer(
        editor,
        readDocxFixture(name)
      );
      const roundtrippedNodes = await importDocxBuffer(
        editor,
        await exportNodesToDocx(importedNodes)
      );

      expect(roundtrippedNodes).toEqual(importedNodes);
    }
  );

  it('preserves data for links with URL normalization', async () => {
    const editor = createTestEditor();
    const importedNodes = await importDocxBuffer(
      editor,
      readDocxFixture('links')
    );
    const roundtrippedNodes = await importDocxBuffer(
      editor,
      await exportNodesToDocx(importedNodes)
    );

    const normalizeUrls = (nodes: PliteNode[]) =>
      JSON.parse(
        JSON.stringify(nodes).replaceAll(
          /"url":"(https?:\/\/[^"/]+)"/g,
          '"url":"$1/"'
        )
      );

    expect(normalizeUrls(roundtrippedNodes)).toEqual(
      normalizeUrls(importedNodes)
    );
  });

  it('reimports inline formatting after export without dropping all content', async () => {
    const editor = createTestEditor();
    const importedNodes = await importDocxBuffer(
      editor,
      readDocxFixture('inline_formatting')
    );
    const roundtrippedNodes = await importDocxBuffer(
      editor,
      await exportNodesToDocx(importedNodes)
    );

    expect(roundtrippedNodes.length).toBeGreaterThan(0);
  });
});
